// Phase 8.2R: Recruitment Funnel Repository — scope-aware read-only queries
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface FunnelFilter {
  dateFrom?: Date;
  dateTo?: Date;
  departmentId?: string;
  jobId?: string;
  channel?: string;
  ownerId?: string;
  stage?: string;
}

function buildDateWhere(dateFrom?: Date, dateTo?: Date): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (dateFrom) where.createdAt = { ...((where.createdAt as object) || {}), gte: dateFrom };
  if (dateTo) where.createdAt = { ...((where.createdAt as object) || {}), lte: dateTo };
  return Object.keys(where).length > 0 ? where : {};
}

// Get scoped applications for funnel
export async function findApplicationsForFunnel(scope: ScopeWhere, filter: FunnelFilter) {
  const dateWhere = buildDateWhere(filter.dateFrom, filter.dateTo);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { ...dateWhere };
  if (filter.jobId) where.jobId = filter.jobId;
  if (filter.channel) where.source = filter.channel;
  if (filter.ownerId) where.ownerId = filter.ownerId;
  if (filter.stage) where.stage = filter.stage;

  // Apply scope
  if (scope.scope === "DENY") return [];
  if (scope.scope === "OWNED") where.ownerId = scope.userId;
  if (scope.scope === "DEPARTMENT") {
    const deptJobs = await prisma.job.findMany({
      where: { departmentId: scope.departmentId },
      select: { id: true },
    });
    where.jobId = { in: deptJobs.map((j) => j.id) };
  }

  return prisma.application.findMany({
    where,
    include: {
      job: { select: { id: true, title: true, departmentId: true, ownerId: true } },
      candidate: { select: { id: true, name: true, source: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Get scoped interviews for funnel
export async function findInterviewsForFunnel(scope: ScopeWhere, filter: FunnelFilter) {
  const dateWhere = buildDateWhere(filter.dateFrom, filter.dateTo);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { ...dateWhere };

  // Apply scope through application relation
  if (scope.scope === "DENY") return [];

  const include = {
    application: {
      include: {
        job: { select: { id: true, title: true, departmentId: true, ownerId: true } },
        candidate: { select: { id: true, name: true } },
      },
    },
  };

  const results = await prisma.interview.findMany({
    where,
    include,
    orderBy: { scheduledAt: "desc" },
  });

  // Filter by scope post-query
  if (scope.scope === "OWNED") {
    return results.filter((i) => i.application?.job?.ownerId === scope.userId);
  }
  if (scope.scope === "DEPARTMENT") {
    return results.filter((i) => i.application?.job?.departmentId === scope.departmentId);
  }
  return results;
}

// Get scoped interview feedbacks
export async function findFeedbacksForFunnel(scope: ScopeWhere, filter: FunnelFilter) {
  const dateWhere = buildDateWhere(filter.dateFrom, filter.dateTo);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { ...dateWhere };

  if (scope.scope === "DENY") return [];

  const results = await prisma.interviewFeedback.findMany({
    where,
    include: {
      interview: {
        include: {
          application: {
            include: { job: { select: { id: true, title: true, departmentId: true, ownerId: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (scope.scope === "OWNED") {
    return results.filter((f) => f.interview?.application?.job?.ownerId === scope.userId);
  }
  if (scope.scope === "DEPARTMENT") {
    return results.filter((f) => f.interview?.application?.job?.departmentId === scope.departmentId);
  }
  return results;
}

// Get scoped action items
export async function findActionsForFunnel(scope: ScopeWhere, filter: FunnelFilter) {
  const dateWhere = buildDateWhere(filter.dateFrom, filter.dateTo);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { ...dateWhere };
  if (filter.jobId) where.jobId = filter.jobId;
  if (filter.ownerId) where.ownerId = filter.ownerId;
  if (scope.scope === "OWNED") where.ownerId = scope.userId;
  if (scope.scope === "DENY") return [];

  return prisma.actionItem.findMany({
    where,
    include: {
      job: { select: { id: true, title: true, departmentId: true, ownerId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Get scoped offer risks (OfferRisk has no direct jobId — filter via application)
export async function findOfferRisksForFunnel(scope: ScopeWhere, filter: FunnelFilter) {
  const dateWhere = buildDateWhere(filter.dateFrom, filter.dateTo);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { ...dateWhere };

  if (scope.scope === "DENY") return [];

  // OfferRisk has no direct jobId, so we can't filter by jobId in where clause.
  // We fetch all and then filter post-query by application.jobId.
  const results = await prisma.offerRisk.findMany({
    where,
    include: {
      application: {
        include: { job: { select: { id: true, title: true, departmentId: true, ownerId: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let filtered = results;
  if (filter.jobId) {
    filtered = filtered.filter((r) => r.application?.jobId === filter.jobId);
  }
  if (scope.scope === "OWNED") {
    filtered = filtered.filter((r) => r.application?.job?.ownerId === scope.userId);
  }
  if (scope.scope === "DEPARTMENT") {
    filtered = filtered.filter((r) => r.application?.job?.departmentId === scope.departmentId);
  }
  return filtered;
}

// Get jobs with scope
export async function findJobsForFunnel(scope: ScopeWhere) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (scope.scope === "OWNED") where.ownerId = scope.userId;
  if (scope.scope === "DEPARTMENT") where.departmentId = scope.departmentId;
  if (scope.scope === "DENY") return [];
  return prisma.job.findMany({ where, orderBy: { createdAt: "desc" } });
}
