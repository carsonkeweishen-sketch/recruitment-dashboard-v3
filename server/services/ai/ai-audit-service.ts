// Phase 8.6: AI Audit Service
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface AuditLogParams {
  provider: string;
  model: string;
  objectType: string;
  objectId?: string;
  promptVersion: string;
  requestHash: string;
  status: string;
  latencyMs?: number;
  tokenUsageInput?: number;
  tokenUsageOutput?: number;
  errorCode?: string;
  errorMessage?: string;
  createdById?: string;
}

export async function logCall(params: AuditLogParams) {
  return prisma.aICallLog.create({ data: params });
}

export async function listLogs(limit = 20) {
  return prisma.aICallLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}
