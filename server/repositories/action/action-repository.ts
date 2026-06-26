// Phase 7: Action Repository
// All queries use findFirst/findMany + scope WHERE (never findUnique).
// Scope enforcement via buildActionScopeWhere from guardrail.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";
import { buildActionScopeWhere } from "@/server/permissions/resource-scope-builder";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface CreateActionInput {
  title: string;
  description?: string;
  category: string;
  priority: string;
  ownerId?: string;
  createdById: string;
  jobId?: string;
  candidateId?: string;
  applicationId?: string;
  interviewId?: string;
  feedbackId?: string;
  sourceType: string;
  sourceRefId?: string;
  sourceSummary?: string;
  dueAt?: Date;
}

export interface UpdateActionInput {
  title?: string;
  description?: string;
  priority?: string;
  ownerId?: string;
  status?: string;
  dueAt?: Date;
}

const actionInclude = {
  owner: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  job: { select: { id: true, title: true, jobCode: true } },
  candidate: { select: { id: true, name: true } },
  application: {
    select: {
      id: true,
      stage: true,
      candidate: { select: { id: true, name: true } },
      job: { select: { id: true, title: true } },
    },
  },
  interview: {
    select: {
      id: true,
      round: true,
      interviewer: { select: { id: true, name: true } },
    },
  },
} as const;

export async function listActions(
  scope: ScopeWhere,
  filters?: {
    status?: string;
    priority?: string;
    category?: string;
    ownerId?: string;
    jobId?: string;
    candidateId?: string;
    overdueOnly?: boolean;
  }
) {
  if (scope.scope === "DENY") return [];

  const scopeWhere = buildActionScopeWhere(scope);
  const where: Record<string, unknown> = { ...scopeWhere };

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }
  if (filters?.priority && filters.priority !== "all") {
    where.priority = filters.priority;
  }
  if (filters?.category && filters.category !== "all") {
    where.category = filters.category;
  }
  if (filters?.ownerId) {
    where.ownerId = filters.ownerId;
  }
  if (filters?.jobId) {
    where.jobId = filters.jobId;
  }
  if (filters?.candidateId) {
    where.candidateId = filters.candidateId;
  }
  if (filters?.overdueOnly) {
    where.dueAt = { lt: new Date() };
    where.status = { in: ["open", "in_progress", "blocked"] };
  }

  return prisma.actionItem.findMany({
    where,
    include: actionInclude,
    orderBy: [{ priority: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
  });
}

export async function getActionByIdWithScope(id: string, scope: ScopeWhere) {
  if (scope.scope === "DENY") return null;

  const scopeWhere = buildActionScopeWhere(scope);
  const where: Record<string, unknown> = { id, ...scopeWhere };

  return prisma.actionItem.findFirst({
    where,
    include: actionInclude,
  });
}

export async function createAction(input: CreateActionInput) {
  return prisma.actionItem.create({
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      status: "open",
      ownerId: input.ownerId,
      createdById: input.createdById,
      jobId: input.jobId,
      candidateId: input.candidateId,
      applicationId: input.applicationId,
      interviewId: input.interviewId,
      feedbackId: input.feedbackId,
      sourceType: input.sourceType,
      sourceRefId: input.sourceRefId,
      sourceSummary: input.sourceSummary,
      dueAt: input.dueAt,
    },
    include: actionInclude,
  });
}

export async function createActionIfNotExists(input: CreateActionInput) {
  // Dedup: same sourceType + sourceRefId + category + open status
  const existing = await prisma.actionItem.findFirst({
    where: {
      sourceType: input.sourceType,
      sourceRefId: input.sourceRefId,
      category: input.category,
      status: { in: ["open", "in_progress", "blocked"] },
    },
    select: { id: true },
  });

  if (existing) {
    return { created: false, actionId: existing.id, action: null };
  }

  const action = await createAction(input);
  return { created: true, actionId: action.id, action };
}

export async function updateAction(id: string, input: UpdateActionInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.ownerId !== undefined) data.ownerId = input.ownerId;
  if (input.status !== undefined) data.status = input.status;
  if (input.dueAt !== undefined) data.dueAt = input.dueAt;

  return prisma.actionItem.update({
    where: { id },
    data,
    include: actionInclude,
  });
}

export async function resolveAction(
  id: string,
  resolvedById: string,
  resolutionNote: string
) {
  return prisma.actionItem.update({
    where: { id },
    data: {
      status: "resolved",
      resolvedAt: new Date(),
      resolvedById,
      resolutionNote,
    },
    include: actionInclude,
  });
}

export async function dismissAction(
  id: string,
  resolvedById: string,
  dismissedReason: string
) {
  return prisma.actionItem.update({
    where: { id },
    data: {
      status: "dismissed",
      resolvedAt: new Date(),
      resolvedById,
      dismissedReason,
    },
    include: actionInclude,
  });
}

export async function getActionsByJob(jobId: string, scope: ScopeWhere) {
  if (scope.scope === "DENY") return [];

  const scopeWhere = buildActionScopeWhere(scope);
  const where: Record<string, unknown> = { jobId, ...scopeWhere };

  return prisma.actionItem.findMany({
    where,
    include: actionInclude,
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getActionsByCandidate(candidateId: string, scope: ScopeWhere) {
  if (scope.scope === "DENY") return [];

  const scopeWhere = buildActionScopeWhere(scope);
  const where: Record<string, unknown> = { candidateId, ...scopeWhere };

  return prisma.actionItem.findMany({
    where,
    include: actionInclude,
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getActionMetrics(scope: ScopeWhere) {
  if (scope.scope === "DENY") {
    return {
      openCount: 0,
      overdueCount: 0,
      highPriorityCount: 0,
      dueTodayCount: 0,
      avgResolutionHours: 0,
      onTimeResolutionRate: 0,
    };
  }

  const scopeWhere = buildActionScopeWhere(scope);

  const [open, overdue, highPriority, dueToday, resolved] = await Promise.all([
    prisma.actionItem.count({
      where: { ...scopeWhere, status: { in: ["open", "in_progress", "blocked"] } },
    }),
    prisma.actionItem.count({
      where: {
        ...scopeWhere,
        status: { in: ["open", "in_progress", "blocked"] },
        dueAt: { lt: new Date() },
      },
    }),
    prisma.actionItem.count({
      where: {
        ...scopeWhere,
        status: { in: ["open", "in_progress", "blocked"] },
        priority: { in: ["high", "urgent"] },
      },
    }),
    prisma.actionItem.count({
      where: {
        ...scopeWhere,
        status: { in: ["open", "in_progress", "blocked"] },
        dueAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.actionItem.findMany({
      where: { ...scopeWhere, status: "resolved", resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true, dueAt: true },
    }),
  ]);

  // Avg resolution hours
  const withResolution = resolved.filter((a) => a.resolvedAt && a.createdAt);
  const totalHours = withResolution.reduce((sum, a) => {
    return sum + (a.resolvedAt!.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60);
  }, 0);
  const avgResolutionHours =
    withResolution.length > 0
      ? Math.round((totalHours / withResolution.length) * 10) / 10
      : 0;

  // On-time rate
  const onTime = withResolution.filter((a) => {
    if (!a.dueAt) return true;
    return a.resolvedAt!.getTime() <= a.dueAt.getTime();
  });
  const onTimeRate =
    withResolution.length > 0
      ? Math.round((onTime.length / withResolution.length) * 100)
      : 0;

  return {
    openCount: open,
    overdueCount: overdue,
    highPriorityCount: highPriority,
    dueTodayCount: dueToday,
    avgResolutionHours,
    onTimeResolutionRate: onTimeRate,
  };
}
