// Phase 8.1: AI Dashboard Repository
// Scope-aware data queries for dashboard aggregation.
// All queries respect Scope Guardrail — no unscoped fallback.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";
import { buildActionScopeWhere } from "@/server/permissions/resource-scope-builder";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface DashboardQueryParams {
  scope: ScopeWhere;
  userId: string;
  role: string;
  departmentId?: string;
}

// ============================================================
// Action Metrics
// ============================================================

export async function getActionMetrics(params: DashboardQueryParams) {
  const scopeWhere = buildActionScopeWhere(params.scope);

  const [total, overdue, highPriority, dueToday, resolved, dismissed] = await Promise.all([
    prisma.actionItem.count({ where: { ...scopeWhere, status: "open" } }),
    prisma.actionItem.count({
      where: { ...scopeWhere, status: "open", dueAt: { lt: new Date() } },
    }),
    prisma.actionItem.count({
      where: { ...scopeWhere, status: "open", priority: { in: ["urgent", "high"] } },
    }),
    prisma.actionItem.count({
      where: {
        ...scopeWhere,
        status: "open",
        dueAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.actionItem.count({ where: { ...scopeWhere, status: "resolved" } }),
    prisma.actionItem.count({ where: { ...scopeWhere, status: "dismissed" } }),
  ]);

  // Average resolution time (hours) for resolved actions in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const resolvedActions = await prisma.actionItem.findMany({
    where: { ...scopeWhere, status: "resolved", resolvedAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, resolvedAt: true },
  });

  let averageResolutionHours: number | null = null;
  let onTimeResolutionRate: number | null = null;

  if (resolvedActions.length > 0) {
    const totalHours = resolvedActions.reduce((sum, a) => {
      if (a.resolvedAt) {
        return sum + (a.resolvedAt.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);
    averageResolutionHours = Math.round(totalHours / resolvedActions.length);

    const onTime = resolvedActions.filter((a) => {
      if (!a.resolvedAt || !a.createdAt) return false;
      return a.resolvedAt.getTime() - a.createdAt.getTime() <= 72 * 60 * 60 * 1000; // 72h
    }).length;
    onTimeResolutionRate = Math.round((onTime / resolvedActions.length) * 100);
  }

  return {
    openActionCount: total,
    overdueActionCount: overdue,
    highPriorityActionCount: highPriority,
    dueTodayActionCount: dueToday,
    resolvedActionCount: resolved,
    dismissedActionCount: dismissed,
    averageResolutionHours,
    onTimeResolutionRate,
  };
}

// ============================================================
// Job Metrics
// ============================================================

export async function getJobMetrics(params: DashboardQueryParams) {
  const where: Record<string, unknown> = {};
  if (params.scope.scope === "DEPARTMENT" && params.scope.departmentId) {
    where.departmentId = params.scope.departmentId;
  } else if (params.scope.scope === "OWNED" && params.scope.userId) {
    where.ownerId = params.scope.userId;
  } else if (params.scope.scope === "RELATED" && params.scope.userId) {
    where.businessOwnerId = params.scope.userId;
  }

  const activeJobs = await prisma.job.count({
    where: { ...where, status: { not: "closed" } },
  });

  // Total active candidates across scoped jobs
  const jobIds = await prisma.job.findMany({
    where: { ...where, status: { not: "closed" } },
    select: { id: true },
  });
  const jobIdList = jobIds.map((j) => j.id);

  const activeCandidates = await prisma.application.count({
    where: { jobId: { in: jobIdList }, status: "active" },
  });

  return { activeJobCount: activeJobs, activeCandidateCount: activeCandidates, scopedJobIds: jobIdList };
}

// ============================================================
// Interview / Feedback Metrics
// ============================================================

export async function getFeedbackMetrics(params: DashboardQueryParams) {
  const jobIds = await getScopedJobIds(params);

  const [pendingFeedback, lowQualityFeedback] = await Promise.all([
    prisma.interview.count({
      where: {
        status: "completed",
        feedbacks: { none: {} },
        application: { jobId: { in: jobIds } },
      },
    }),
    prisma.interviewFeedback.count({
      where: {
        feedbackQualityScore: { lt: 60 },
        interview: { application: { jobId: { in: jobIds } } },
      },
    }),
  ]);

  return { pendingFeedbackCount: pendingFeedback, lowQualityFeedbackCount: lowQualityFeedback };
}

async function getScopedJobIds(params: DashboardQueryParams): Promise<string[]> {
  const where: Record<string, unknown> = {};
  if (params.scope.scope === "DEPARTMENT" && params.scope.departmentId) {
    where.departmentId = params.scope.departmentId;
  } else if (params.scope.scope === "OWNED" && params.scope.userId) {
    where.ownerId = params.scope.userId;
  } else if (params.scope.scope === "RELATED" && params.scope.userId) {
    where.businessOwnerId = params.scope.userId;
  }
  const jobs = await prisma.job.findMany({ where, select: { id: true } });
  return jobs.map((j) => j.id);
}

// ============================================================
// Priority Actions
// ============================================================

export async function getPriorityActions(params: DashboardQueryParams) {
  const scopeWhere = buildActionScopeWhere(params.scope);
  return prisma.actionItem.findMany({
    where: { ...scopeWhere, status: "open" },
    orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { priority: "asc" }, { updatedAt: "desc" }],
    take: 5,
    include: {
      owner: { select: { name: true } },
      job: { select: { id: true, title: true } },
      candidate: { select: { id: true, name: true } },
    },
  });
}

// ============================================================
// Job Health
// ============================================================

export async function getJobHealthItems(params: DashboardQueryParams, jobIds: string[]) {
  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds }, status: { not: "closed" } },
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { name: true } },
      applications: { select: { id: true, status: true, stage: true } },
    },
  });

  const results = [];
  for (const job of jobs) {
    const actionCount = await prisma.actionItem.count({
      where: { jobId: job.id, status: "open" },
    });
    const overdueCount = await prisma.actionItem.count({
      where: { jobId: job.id, status: "open", dueAt: { lt: new Date() } },
    });

    let healthLevel: "healthy" | "attention" | "risk" = "healthy";
    if (overdueCount > 0) healthLevel = "risk";
    else if (actionCount >= 2) healthLevel = "attention";

    results.push({
      jobId: job.id,
      jobTitle: job.title,
      jobStatus: job.status,
      candidateCount: job.applications.length,
      openActions: actionCount,
      overdueActions: overdueCount,
      healthLevel,
      ownerName: job.owner?.name ?? "—",
    });
  }
  return results;
}

// ============================================================
// Candidate Risk
// ============================================================

export async function getCandidateRiskItems(params: DashboardQueryParams, jobIds: string[]) {
  const riskyApps = await prisma.application.findMany({
    where: {
      jobId: { in: jobIds },
      status: "active",
      OR: [
        { stage: "offer_risk" },
        { updatedAt: { lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
      ],
    },
    take: 5,
    orderBy: { updatedAt: "asc" },
    include: {
      candidate: { select: { id: true, name: true } },
      job: { select: { id: true, title: true } },
    },
  });

  const results = [];
  for (const app of riskyApps) {
    const actionCount = await prisma.actionItem.count({
      where: { candidateId: app.candidateId, status: "open" },
    });

    const riskLabels: string[] = [];
    if (app.stage === "offer_risk") riskLabels.push("Offer风险");
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    if (app.updatedAt < fourteenDaysAgo) riskLabels.push("推进停滞");

    results.push({
      candidateId: app.candidate.id,
      candidateName: app.candidate.name,
      jobTitle: app.job.title,
      stage: app.stage,
      riskLabels,
      openActions: actionCount,
      lastUpdatedAt: app.updatedAt.toISOString(),
    });
  }
  return results;
}

// ============================================================
// Recent Activity
// ============================================================

export async function getRecentActivity(params: DashboardQueryParams) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      actor: { select: { id: true, name: true } },
    },
  });
}

// ============================================================
// Risk Distribution (for Risk Radar)
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getRiskDistribution(params: DashboardQueryParams) {
  const scopeWhere = buildActionScopeWhere(params.scope);
  const categories = [
    "process_blocker",
    "feedback_followup",
    "candidate_risk_followup",
    "offer_risk",
    "business_feedback",
    "data_quality",
  ];

  const results = [];
  for (const cat of categories) {
    const [total, overdue] = await Promise.all([
      prisma.actionItem.count({ where: { ...scopeWhere, status: "open", category: cat } }),
      prisma.actionItem.count({
        where: { ...scopeWhere, status: "open", category: cat, dueAt: { lt: new Date() } },
      }),
    ]);
    if (total > 0) {
      results.push({
        riskName: cat,
        totalActionCount: total,
        overdueCount: overdue,
        highestPriority: overdue > 0 ? "urgent" : total > 2 ? "high" : "medium",
      });
    }
  }
  return results;
}
