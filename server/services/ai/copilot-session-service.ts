// Phase 8.11: Copilot Session Service
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { logCopilotActivity, COPILOT_ACTIVITIES } from "./copilot-activity-helper";
import type { ScopeWhere } from "@/server/permissions/types";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) { const pool = new Pool({ connectionString: process.env.DATABASE_URL }); _prisma = new PrismaClient({ adapter: new PrismaPg(pool) }); }
  return _prisma;
}

export async function createSession(params: {
  userId: string;
  role: string;
  moduleKey: string;
  objectType: string;
  objectId: string;
}) {
  const p = getPrisma();
  // Reuse active session within 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const existing = await p.aICopilotSession.findFirst({
    where: { userId: params.userId, objectType: params.objectType, objectId: params.objectId, status: "active", updatedAt: { gt: fiveMinAgo } },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;

  const session = await p.aICopilotSession.create({ data: { userId: params.userId, role: params.role, moduleKey: params.moduleKey, objectType: params.objectType, objectId: params.objectId } });
  await logCopilotActivity(params.userId, COPILOT_ACTIVITIES.SESSION_CREATED, "ai_copilot_session", session.id, { moduleKey: params.moduleKey, objectType: params.objectType, objectId: params.objectId });
  return session;
}

export async function listSessions(userId: string, _scope: ScopeWhere, objectType?: string, objectId?: string) {
  const p = getPrisma();
  const where: Record<string, unknown> = { userId, status: "active" };
  if (objectType) where.objectType = objectType;
  if (objectId) where.objectId = objectId;
  return p.aICopilotSession.findMany({ where, orderBy: { updatedAt: "desc" }, take: 20, include: { _count: { select: { messages: true } } } });
}

export async function getSession(id: string, userId: string) {
  const p = getPrisma();
  return p.aICopilotSession.findFirst({ where: { id, userId }, include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } } });
}

export async function archiveSession(id: string, userId: string) {
  const p = getPrisma();
  return p.aICopilotSession.update({ where: { id, userId }, data: { status: "archived" } });
}
