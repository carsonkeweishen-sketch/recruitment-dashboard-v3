// Phase 8.11: Action Context Source
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

  if (objectId === "all" || objectId === "action_list") {
    const actions = await p.actionItem.findMany({ where: { status: "open" }, select: { id: true, title: true, category: true, priority: true, dueAt: true }, take: 15, orderBy: { priority: "desc" } });
    sources.push({ refType: "action", refId: "action_list", objectType: "action", objectId: "all", sourceLabel: "行动项列表", excerpt: JSON.stringify(actions), redactionStatus: "not_required", hasEvidence: actions.length > 0, isRequired: false });
    return sources;
  }

  const action = await p.actionItem.findUnique({ where: { id: objectId }, select: { id: true, title: true, description: true, category: true, priority: true, status: true, sourceType: true, sourceRefId: true, sourceSummary: true, dueAt: true, jobId: true, candidateId: true, applicationId: true, interviewId: true } });
  if (!action) {
    sources.push({ refType: "action", refId: objectId, objectType: "action", objectId, sourceLabel: "行动项", excerpt: "未找到该行动项", redactionStatus: "not_required", hasEvidence: false, isRequired: true });
    return sources;
  }
  sources.push({
    refType: "action", refId: action.id, objectType: "action", objectId: action.id,
    sourceLabel: `行动项 · ${action.title}`,
    excerpt: JSON.stringify({ title: action.title, description: action.description, category: action.category, priority: action.priority, status: action.status, sourceType: action.sourceType, dueAt: action.dueAt }),
    redactionStatus: "not_required", hasEvidence: true, isRequired: true,
  });
  // Recent activity logs
  const logs = await p.activityLog.findMany({ where: { resourceId: objectId }, select: { action: true, detail: true, createdAt: true }, take: 5, orderBy: { createdAt: "desc" } });
  if (logs.length > 0) {
    sources.push({ refType: "action", refId: `${action.id}_logs`, objectType: "action", objectId: action.id, sourceLabel: `操作记录 · ${action.title}`, excerpt: JSON.stringify(logs.map((l) => ({ action: l.action, detail: l.detail, time: l.createdAt }))), redactionStatus: "applied", hasEvidence: true, isRequired: false });
  }
  return sources;
}
