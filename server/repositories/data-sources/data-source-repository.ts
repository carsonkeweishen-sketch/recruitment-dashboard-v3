// Phase 8.7: Data Source Repository
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface DSParams { scope: ScopeWhere; userId: string; role: string; departmentId?: string; }

function buildScopeWhere(params: DSParams): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (params.scope.scope === "DEPARTMENT" && params.scope.departmentId) {
    where.OR = [{ objectType: "job", objectId: { in: [] } }]; // department-scoped via job
  } else if (params.scope.scope === "OWNED" && params.scope.userId) {
    where.OR = [{ uploadedById: params.scope.userId }, { objectType: "job", objectId: { in: [] } }];
  } else if (params.scope.scope === "RELATED" && params.scope.userId) {
    where.OR = [{ uploadedById: params.scope.userId }];
  } else if (params.scope.scope === "DENY") {
    where.id = "__none__";
  }
  return where;
}

export async function listDataSources(params: DSParams) {
  const where = buildScopeWhere(params);
  if (params.role === "interviewer") {
    where.OR = [{ uploadedById: params.scope.userId }, { objectType: "interview" }];
  }
  return prisma.dataSource.findMany({
    where,
    include: { links: { select: { objectType: true, objectId: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getDataSource(id: string) {
  return prisma.dataSource.findUnique({
    where: { id },
    include: {
      chunks: { orderBy: { chunkIndex: "asc" } },
      parseJobs: { orderBy: { createdAt: "desc" }, take: 5 },
      links: { select: { objectType: true, objectId: true } },
    },
  });
}

export async function createDataSource(data: {
  sourceType: string; sourceSystem: string; fileName?: string; fileMimeType?: string;
  fileSize?: number; fileUrl?: string; externalUrl?: string; externalId?: string;
  objectType?: string; objectId?: string; usageType?: string; parseStatus?: string;
  uploadedById?: string;
}) {
  return prisma.dataSource.create({ data });
}

export async function updateDataSource(id: string, data: Record<string, unknown>) {
  return prisma.dataSource.update({ where: { id }, data });
}

export async function deleteDataSource(id: string) {
  return prisma.dataSource.delete({ where: { id } });
}

export async function createChunk(data: {
  dataSourceId: string; chunkIndex: number; contentText?: string;
  contentSummary?: string; tokenCount?: number; metadataJson?: string;
}) {
  return prisma.dataSourceChunk.create({ data });
}

export async function createParseJob(data: {
  dataSourceId: string; jobStatus: string; parserType?: string;
  startedAt?: Date; finishedAt?: Date; errorCode?: string; errorMessage?: string;
}) {
  return prisma.dataSourceParseJob.create({ data });
}

export async function createLink(data: { dataSourceId: string; objectType: string; objectId: string }) {
  return prisma.dataSourceLink.create({ data });
}

export async function getIntegrations() {
  return prisma.integrationConnection.findMany();
}

export async function getIntegration(provider: string) {
  return prisma.integrationConnection.findUnique({ where: { provider } });
}
