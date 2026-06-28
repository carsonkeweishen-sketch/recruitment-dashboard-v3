// Phase 8.11: Offer Risk Context Source
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
  const risk = await p.offerRisk.findUnique({
    where: { id: objectId },
    select: { id: true, riskType: true, level: true, description: true, status: true, dueAt: true, application: { select: { id: true, candidate: { select: { name: true } }, job: { select: { title: true } } } } },
  });
  if (!risk) {
    sources.push({ refType: "offer_risk", refId: objectId, objectType: "offer_risk", objectId, sourceLabel: "Offer 风险", excerpt: "未找到该风险", redactionStatus: "not_required", hasEvidence: false, isRequired: true });
    return sources;
  }
  sources.push({
    refType: "offer_risk", refId: risk.id, objectType: "offer_risk", objectId: risk.id,
    sourceLabel: `Offer 风险 · ${risk.application?.candidate?.name || ""} / ${risk.application?.job?.title || ""}`,
    excerpt: JSON.stringify({ riskType: risk.riskType, level: risk.level, status: risk.status, description: risk.description, dueAt: risk.dueAt }),
    redactionStatus: "applied", hasEvidence: true, isRequired: true,
  });
  // Related actions
  const actions = await p.actionItem.findMany({ where: { applicationId: risk.application?.id || "" }, select: { title: true, status: true, priority: true }, take: 5 });
  if (actions.length > 0) {
    sources.push({ refType: "action", refId: `${risk.id}_actions`, objectType: "offer_risk", objectId: risk.id, sourceLabel: `相关行动项 · ${risk.riskType}`, excerpt: JSON.stringify(actions), redactionStatus: "not_required", hasEvidence: true, isRequired: false });
  }
  return sources;
}
