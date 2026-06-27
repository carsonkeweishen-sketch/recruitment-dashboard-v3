// Phase 8.8: Knowledge Repository — scope-aware CRUD
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectionScopeWhere(scope: ScopeWhere): any {
  if (scope.scope === "DENY") return { id: "__none__" };
  if (scope.scope === "ALL") return {};
  return { visibility: { in: ["global", "scoped"] }, allowedRoles: { contains: scope.scope.toLowerCase() } };
}

export async function getCollections(scope: ScopeWhere) {
  return (prisma as any).knowledgeCollection.findMany({ where: collectionScopeWhere(scope), orderBy: { createdAt: "desc" } });
}

export async function createCollection(data: { key: string; name: string; description?: string; visibility?: string; allowedRoles?: string; createdById?: string }) {
  return (prisma as any).knowledgeCollection.create({ data });
}

export async function getDocuments(scope: ScopeWhere) {
  const collectionWhere = collectionScopeWhere(scope);
  const collections = await (prisma as any).knowledgeCollection.findMany({ where: collectionWhere, select: { id: true } });
  return (prisma as any).knowledgeDocument.findMany({ where: { collectionId: { in: collections.map((c: any) => c.id) } }, orderBy: { createdAt: "desc" }, take: 100 });
}

export async function getDocumentById(id: string) {
  return (prisma as any).knowledgeDocument.findUnique({ where: { id }, include: { chunks: { orderBy: { chunkIndex: "asc" } }, indexJobs: { orderBy: { createdAt: "desc" }, take: 5 } } });
}

export async function createKnowledgeDocument(data: { collectionId: string; dataSourceId: string; title: string; sourceType: string; usageType?: string; objectType?: string; objectId?: string; indexStatus?: string; createdById?: string }) {
  return (prisma as any).knowledgeDocument.create({ data });
}

export async function createKnowledgeChunk(data: { knowledgeDocumentId: string; dataSourceChunkId?: string; chunkIndex: number; contentText?: string; contentSummary?: string; tags?: string; tokenCount?: number; evidenceLevel?: string }) {
  return (prisma as any).knowledgeChunk.create({ data });
}

export async function updateDocumentIndexStatus(id: string, indexStatus: string, chunkCount: number) {
  return (prisma as any).knowledgeDocument.update({ where: { id }, data: { indexStatus, chunkCount, lastIndexedAt: new Date() } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function searchChunks(query: string, collectionId?: string, objectType?: string, scope?: ScopeWhere): Promise<any[]> {
  const where: Record<string, unknown> = {};
  if (collectionId) where.knowledgeDocument = { collectionId };
  if (objectType) where.knowledgeDocument = { ...(where.knowledgeDocument as object || {}), objectType };

  const chunks = await (prisma as any).knowledgeChunk.findMany({
    where: {
      ...where,
      OR: [{ contentText: { contains: query, mode: "insensitive" } }, { contentSummary: { contains: query, mode: "insensitive" } }, { tags: { contains: query, mode: "insensitive" } }],
    },
    include: { knowledgeDocument: { include: { collection: { select: { key: true, name: true } } } } },
    orderBy: { chunkIndex: "asc" },
    take: 10,
  });
  return chunks.map((c: any) => ({
    chunkId: c.id, dataSourceId: c.knowledgeDocument?.dataSourceId, dataSourceChunkId: c.dataSourceChunkId,
    sourceLabel: c.knowledgeDocument?.title || "unknown", collection: c.knowledgeDocument?.collection?.name || "",
    summary: c.contentSummary, quote: c.contentText?.substring(0, 200), evidenceLevel: c.evidenceLevel,
    score: c.contentSummary?.toLowerCase().includes(query.toLowerCase()) ? 0.85 : 0.5,
  }));
}

export async function createAnswer(data: { question: string; answer?: string; answerStatus: string; generatedBy?: string; provider?: string; model?: string; promptVersion?: string; humanReviewStatus?: string; createdById?: string }) {
  return (prisma as any).knowledgeAnswer.create({ data });
}

export async function createCitation(data: { knowledgeAnswerId: string; knowledgeChunkId: string; dataSourceId?: string; dataSourceChunkId?: string; sourceLabel: string; quote?: string; summary?: string; score?: number }) {
  return (prisma as any).knowledgeCitation.create({ data });
}

export async function getAnswerById(id: string) {
  return (prisma as any).knowledgeAnswer.findUnique({ where: { id }, include: { citations: true } });
}

export async function updateAnswerReview(id: string, humanReviewStatus: string, answer?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { humanReviewStatus };
  if (answer) data.answer = answer;
  return (prisma as any).knowledgeAnswer.update({ where: { id }, data });
}

export async function createIndexJob(data: { dataSourceId: string; knowledgeDocumentId?: string; status: string; errorCode?: string; errorMessage?: string }) {
  return (prisma as any).knowledgeIndexJob.create({ data });
}

export async function getIndexJobs() {
  return (prisma as any).knowledgeIndexJob.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
}

export async function getKnowledgeStats() {
  const [collections, documents, chunks, indexedChunks, answers] = await Promise.all([
    (prisma as any).knowledgeCollection.count(), (prisma as any).knowledgeDocument.count(),
    (prisma as any).knowledgeChunk.count(), (prisma as any).knowledgeChunk.count({ where: { evidenceLevel: { not: "unknown" } } }),
    (prisma as any).knowledgeAnswer.count(),
  ]);
  return { collections, documents, chunks, indexedChunks, answers };
}
