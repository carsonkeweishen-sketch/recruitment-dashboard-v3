// Phase 8.5: Offer Risk Repository
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface ORParams { scope: ScopeWhere; userId: string; role: string; departmentId?: string; }

export async function getOfferRisks(params: ORParams) {
  const where: Record<string, unknown> = {};
  if (params.scope.scope === "DEPARTMENT" && params.scope.departmentId) where.application = { job: { departmentId: params.scope.departmentId } };
  else if (params.scope.scope === "OWNED" && params.scope.userId) where.application = { job: { ownerId: params.scope.userId } };
  else if (params.scope.scope === "RELATED" && params.scope.userId) where.application = { job: { businessOwnerId: params.scope.userId } };
  else if (params.scope.scope === "DENY") return [];
  return prisma.offerRisk.findMany({
    where: { ...where, status: "open" },
    include: { application: { include: { candidate: { select: { id: true, name: true } }, job: { select: { id: true, title: true } } } }, owner: { select: { name: true } } },
    orderBy: [{ level: "asc" }, { createdAt: "desc" }],
  });
}

export async function getOfferRiskDetail(id: string) {
  return prisma.offerRisk.findUnique({
    where: { id },
    include: { application: { include: { candidate: { select: { id: true, name: true } }, job: { select: { id: true, title: true } } } }, owner: { select: { id: true, name: true } } },
  });
}

export async function getOfferRiskActions(offerRiskId: string) {
  const risk = await prisma.offerRisk.findUnique({ where: { id: offerRiskId }, select: { application: { select: { candidateId: true } } } });
  return prisma.actionItem.findMany({
    where: { candidateId: risk?.application?.candidateId, status: "open" },
    orderBy: [{ priority: "asc" }, { dueAt: { sort: "asc", nulls: "last" } }],
    include: { owner: { select: { name: true } }, job: { select: { title: true } } },
    take: 20,
  });
}

export async function getOfferRiskActivity(offerRiskId: string) {
  return prisma.activityLog.findMany({
    where: { OR: [{ resourceType: "offer_risk", resourceId: offerRiskId }] },
    orderBy: { createdAt: "desc" }, take: 10,
    include: { actor: { select: { name: true } } },
  });
}
