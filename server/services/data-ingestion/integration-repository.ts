// Phase 8.9: Integration Center — Repository Layer
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// ── IntegrationConnection CRUD ──────────────────────────────────

export async function getAllConnections() {
  return prisma.integrationConnection.findMany({ orderBy: { provider: "asc" } });
}

export async function getConnectionByProvider(provider: string) {
  return prisma.integrationConnection.findUnique({ where: { provider } });
}

export async function upsertConnection(
  provider: string,
  data: {
    status?: string;
    displayName?: string;
    mode?: string;
    isWritebackEnabled?: boolean;
    lastCheckedAt?: Date;
    lastSuccessAt?: Date;
    lastErrorCode?: string | null;
    lastErrorMessage?: string | null;
  },
) {
  return prisma.integrationConnection.upsert({
    where: { provider },
    create: { provider, ...data },
    update: data,
  });
}

// ── IntegrationRunLog CRUD ──────────────────────────────────────

export async function createRunLog(data: {
  provider: string;
  runType: string;
  status: string;
  latencyMs?: number;
  requestId?: string;
  errorCode?: string;
  errorMessage?: string;
  createdById?: string;
}) {
  return prisma.integrationRunLog.create({ data });
}

export async function getRunLogs(filters: { provider?: string; limit?: number }) {
  return prisma.integrationRunLog.findMany({
    where: filters.provider ? { provider: filters.provider } : undefined,
    orderBy: { createdAt: "desc" },
    take: filters.limit ?? 50,
  });
}

// ── IntegrationCredentialMeta CRUD ──────────────────────────────

export async function getCredentialMeta(provider: string) {
  return prisma.integrationCredentialMeta.findUnique({ where: { provider } });
}

export async function upsertCredentialMeta(
  provider: string,
  data: {
    configured?: boolean;
    maskedKeyPreview?: string;
    secretStorage?: string;
    lastRotatedAt?: Date;
  },
) {
  return prisma.integrationCredentialMeta.upsert({
    where: { provider },
    create: { provider, ...data },
    update: data,
  });
}

// ── ExternalObjectMapping CRUD ──────────────────────────────────

export async function getMappings(filters: {
  provider?: string;
  objectType?: string;
  limit?: number;
}) {
  return prisma.externalObjectMapping.findMany({
    where: {
      ...(filters.provider ? { provider: filters.provider } : {}),
      ...(filters.objectType ? { objectType: filters.objectType } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit ?? 100,
  });
}

export async function createMapping(data: {
  provider: string;
  externalObjectType: string;
  externalId?: string;
  externalUrl?: string;
  objectType: string;
  objectId?: string;
  syncStatus?: string;
  createdById?: string;
}) {
  return prisma.externalObjectMapping.create({ data });
}
