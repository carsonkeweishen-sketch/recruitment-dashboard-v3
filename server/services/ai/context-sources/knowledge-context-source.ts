// Phase 8.11: Knowledge Context Source — KnowledgeChunk 关键词搜索
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ContextSourceResult } from "../copilot-context-builder-v2";
import type { ScopeWhere } from "@/server/permissions/types";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) { const pool = new Pool({ connectionString: process.env.DATABASE_URL }); _prisma = new PrismaClient({ adapter: new PrismaPg(pool) }); }
  return _prisma;
}

export async function fetch(_objectType: string, objectId: string, scope: ScopeWhere, question?: string): Promise<ContextSourceResult[]> {
  const sources: ContextSourceResult[] = [];
  const p = getPrisma();

  if (!question || question.trim().length < 2) {
    // No question — return recent knowledge chunks
    const chunks = await p.knowledgeChunk.findMany({
      where: { knowledgeDocument: { indexStatus: "indexed" } },
      select: { id: true, contentText: true, contentSummary: true, knowledgeDocument: { select: { title: true, collection: { select: { name: true, visibility: true, allowedRoles: true } } } } },
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    if (chunks.length > 0) {
      sources.push({ refType: "knowledge_chunk", refId: "recent", objectType: "knowledge", objectId: "global", sourceLabel: "近期知识库内容", excerpt: JSON.stringify(chunks.map((c) => ({ summary: c.contentSummary || c.contentText?.substring(0, 200), docTitle: c.knowledgeDocument?.title, collection: c.knowledgeDocument?.collection?.name }))), redactionStatus: "applied", hasEvidence: true, isRequired: false });
    }
    return sources;
  }

  // Keyword search in KnowledgeChunk
  const keywords = question.split(/\s+/).filter((k) => k.length >= 2);
  const whereClause = keywords.map((kw) => ({ contentText: { contains: kw, mode: "insensitive" as const } }));

  const chunks = await p.knowledgeChunk.findMany({
    where: { OR: whereClause, knowledgeDocument: { indexStatus: "indexed" } },
    select: { id: true, contentText: true, contentSummary: true, tokenCount: true, knowledgeDocument: { select: { id: true, title: true, objectType: true, objectId: true, collection: { select: { name: true, visibility: true, allowedRoles: true } } } } },
    take: 10,
  });

  // Filter by role visibility
  const role = scope.role || "admin";
  const visibleChunks = chunks.filter((c) => {
    const collection = c.knowledgeDocument?.collection;
    if (!collection) return true;
    if (collection.visibility === "public") return true;
    if (collection.allowedRoles && Array.isArray(collection.allowedRoles)) {
      return (collection.allowedRoles as string[]).includes(role);
    }
    return role === "admin" || role === "leader";
  });

  if (visibleChunks.length === 0) {
    sources.push({ refType: "knowledge_chunk", refId: "no_results", objectType: "knowledge", objectId: "global", sourceLabel: "知识库检索", excerpt: "未找到匹配的知识库内容", redactionStatus: "not_required", hasEvidence: false, isRequired: true });
    return sources;
  }

  for (const chunk of visibleChunks) {
    sources.push({
      refType: "knowledge_chunk",
      refId: chunk.id,
      objectType: "knowledge",
      objectId: chunk.knowledgeDocument?.id || "unknown",
      sourceLabel: `知识库 · ${chunk.knowledgeDocument?.title || "未知文档"}`,
      excerpt: chunk.contentSummary || chunk.contentText?.substring(0, 500) || "",
      redactionStatus: "applied",
      hasEvidence: true,
      isRequired: true,
    });
  }

  return sources;
}
