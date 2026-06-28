// Phase 8.11: Data Source Context Source — DataSourceChunk (parseStatus=parsed)
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

export async function fetch(_objectType: string, objectId: string, _scope: ScopeWhere): Promise<ContextSourceResult[]> {
  const sources: ContextSourceResult[] = [];
  const p = getPrisma();

  // If objectId is a specific data source, get its chunks
  if (objectId && objectId !== "all" && objectId !== "data_source_list") {
    const chunks = await p.dataSourceChunk.findMany({
      where: { dataSourceId: objectId, dataSource: { parseStatus: "parsed" } },
      select: { id: true, contentText: true, contentSummary: true, chunkIndex: true, dataSource: { select: { id: true, fileName: true, objectType: true, objectId: true, usageType: true } } },
      take: 10,
      orderBy: { chunkIndex: "asc" },
    });
    for (const chunk of chunks) {
      sources.push({ refType: "data_source_chunk", refId: chunk.id, objectType: "data_source", objectId: chunk.dataSource?.id || objectId, sourceLabel: `资料 · ${chunk.dataSource?.fileName || "未知文件"}`, excerpt: chunk.contentSummary || chunk.contentText?.substring(0, 500) || "", redactionStatus: "applied", hasEvidence: true, isRequired: false });
    }
    return sources;
  }

  // List mode: get recent parsed data sources
  const dataSources = await p.dataSource.findMany({
    where: { parseStatus: "parsed" },
    select: { id: true, fileName: true, sourceType: true, usageType: true, objectType: true, objectId: true, _count: { select: { chunks: true } } },
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  if (dataSources.length > 0) {
    sources.push({ refType: "data_source", refId: "data_source_list", objectType: "data_source", objectId: "all", sourceLabel: "已解析资料列表", excerpt: JSON.stringify(dataSources.map((ds) => ({ fileName: ds.fileName, type: ds.sourceType, usage: ds.usageType, chunkCount: ds._count.chunks }))), redactionStatus: "not_required", hasEvidence: true, isRequired: false });
  }
  return sources;
}
