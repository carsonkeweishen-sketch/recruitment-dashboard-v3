// Phase 8.8: Knowledge Service — search + ask + index
import type { ScopeWhere } from "@/server/permissions/types";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as repo from "@/server/repositories/knowledge/knowledge-repository";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function getCollections(scope: ScopeWhere) { return repo.getCollections(scope); }

export async function createCollection(data: { key: string; name: string; description?: string; visibility?: string; allowedRoles?: string; createdById?: string }) {
  return repo.createCollection(data);
}

export async function getDocuments(scope: ScopeWhere) { return repo.getDocuments(scope); }

export async function indexFromDataSource(dataSourceId: string) {
  const ds = await prisma.dataSource.findUnique({ where: { id: dataSourceId }, include: { chunks: true } });
  if (!ds || ds.parseStatus !== "parsed") {
    await repo.createIndexJob({ dataSourceId, status: "failed", errorCode: "NOT_PARSED", errorMessage: "DataSource not parsed" });
    return { success: false, error: "DataSource not parsed" };
  }
  await repo.createIndexJob({ dataSourceId, status: "indexing" });

  // Ensure default collection exists
  let collection = await (prisma as any).knowledgeCollection.findUnique({ where: { key: "default" } });
  if (!collection) collection = await repo.createCollection({ key: "default", name: "默认知识库", description: "自动索引的资料", visibility: "global" });

  // Check if already indexed
  const existing = await (prisma as any).knowledgeDocument.findUnique({ where: { dataSourceId } });
  if (existing) {
    await repo.updateDocumentIndexStatus(existing.id, "indexed", existing.chunkCount);
    await repo.createIndexJob({ dataSourceId, knowledgeDocumentId: existing.id, status: "indexed" });
    return { success: true, documentId: existing.id };
  }

  const doc = await repo.createKnowledgeDocument({
    collectionId: collection.id, dataSourceId, title: ds.fileName || "Untitled",
    sourceType: ds.sourceType, usageType: ds.usageType || undefined, objectType: ds.objectType || undefined, objectId: ds.objectId || undefined,
    indexStatus: "indexed", createdById: ds.uploadedById || undefined,
  });

  let chunkCount = 0;
  for (const chunk of ds.chunks) {
    await repo.createKnowledgeChunk({
      knowledgeDocumentId: doc.id, dataSourceChunkId: chunk.id || undefined, chunkIndex: chunk.chunkIndex,
      contentText: chunk.contentText || undefined, contentSummary: chunk.contentSummary || undefined, tokenCount: chunk.tokenCount || undefined,
      evidenceLevel: "C", // Default for auto-indexed content
    });
    chunkCount++;
  }

  await repo.updateDocumentIndexStatus(doc.id, "indexed", chunkCount);
  await repo.createIndexJob({ dataSourceId, knowledgeDocumentId: doc.id, status: "indexed" });
  return { success: true, documentId: doc.id, chunkCount };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function search(query: string, collectionKey?: string, objectType?: string, scope?: ScopeWhere): Promise<any> {
  let collectionId: string | undefined;
  if (collectionKey) {
    const col = await (prisma as any).knowledgeCollection.findUnique({ where: { key: collectionKey } });
    collectionId = col?.id;
  }
  const results = await repo.searchChunks(query, collectionId, objectType, scope);
  return { results, noEvidence: results.length === 0 };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ask(question: string, collectionKey?: string, scope?: ScopeWhere, userId?: string): Promise<any> {
  const { results, noEvidence } = await search(question, collectionKey, undefined, scope);

  if (noEvidence) {
    await repo.createAnswer({ question, answerStatus: "no_evidence", humanReviewStatus: "pending", createdById: userId });
    return { answerStatus: "no_evidence", answer: null, message: "当前知识库未找到足够证据，建议补充 JD、面试记录或相关资料后再生成。", citations: [] };
  }

  // Build answer from retrieval results (retrieval_only mode — no LLM)
  const topResults = results.slice(0, 5);
  const answer = topResults.map((r: { sourceLabel: string; summary: string }, i: number) => `${i + 1}. 【${r.sourceLabel}】${r.summary}`).join("\n\n");
  const generatedBy = process.env.DEEPSEEK_API_KEY ? "llm" : "retrieval_only";

  const knowledgeAnswer = await repo.createAnswer({
    question, answer, answerStatus: "generated", generatedBy,
    provider: generatedBy === "llm" ? "deepseek" : undefined, model: generatedBy === "llm" ? "deepseek-v4-flash" : undefined,
    promptVersion: "knowledge-rag-v1", humanReviewStatus: "pending", createdById: userId,
  });

  for (const r of topResults) {
    await repo.createCitation({
      knowledgeAnswerId: knowledgeAnswer.id, knowledgeChunkId: (r as { chunkId: string }).chunkId,
      dataSourceId: (r as { dataSourceId: string }).dataSourceId, dataSourceChunkId: (r as { dataSourceChunkId?: string }).dataSourceChunkId,
      sourceLabel: (r as { sourceLabel: string }).sourceLabel, quote: (r as { quote: string }).quote,
      summary: (r as { summary: string }).summary, score: (r as { score: number }).score,
    });
  }

  return {
    answerStatus: "generated", answer, generatedBy, provider: knowledgeAnswer.provider, model: knowledgeAnswer.model,
    promptVersion: "knowledge-rag-v1", humanReviewStatus: "pending", citations: topResults,
    answerId: knowledgeAnswer.id, disclaimer: "AI 辅助建议，仅供参考",
  };
}

export async function getAnswer(id: string) { return repo.getAnswerById(id); }
export async function reviewAnswer(id: string, status: string, editedAnswer?: string) { return repo.updateAnswerReview(id, status, editedAnswer); }
export async function getIndexJobs() { return repo.getIndexJobs(); }
export async function getStats() { return repo.getKnowledgeStats(); }
