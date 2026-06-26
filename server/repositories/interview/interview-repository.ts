// Phase 6: Interview Repository
// All detail queries use findFirst + scope WHERE (never findUnique).
// Scope enforcement via buildInterviewScopeWhere from guardrail.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";
import { buildInterviewScopeWhere } from "@/server/permissions/resource-scope-builder";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const interviewInclude = {
  application: {
    select: {
      id: true,
      stage: true,
      status: true,
      candidate: { select: { id: true, name: true, currentCompany: true, currentTitle: true } },
      job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } }, level: true } },
      owner: { select: { id: true, name: true } },
    },
  },
  interviewer: { select: { id: true, name: true } },
  feedbacks: {
    select: {
      id: true,
      overallRecommendation: true,
      scores: true,
      evidenceText: true,
      riskNotes: true,
      feedbackQualityScore: true,
      qualityLevel: true,
      riskSignals: true,
      submittedAt: true,
      interviewer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" as const },
  },
} as const;

export async function listInterviews(
  scope: ScopeWhere,
  filters?: { status?: string; round?: string }
) {
  if (scope.scope === "DENY") return [];
  if (scope.scope === "RELATED" && scope.role === "interviewer" && !scope.userId) return [];

  const scopeWhere = buildInterviewScopeWhere(scope);
  const where: Record<string, unknown> = { ...scopeWhere };

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }
  if (filters?.round) {
    where.round = filters.round;
  }

  return prisma.interview.findMany({
    where,
    include: interviewInclude,
    orderBy: { scheduledAt: "desc" },
  });
}

export async function getInterviewByIdWithScope(id: string, scope: ScopeWhere) {
  if (scope.scope === "DENY") return null;
  if (scope.scope === "RELATED" && scope.role === "interviewer" && !scope.userId) return null;

  const scopeWhere = buildInterviewScopeWhere(scope);
  const where: Record<string, unknown> = { id, ...scopeWhere };

  return prisma.interview.findFirst({
    where,
    include: interviewInclude,
  });
}

export async function getInterviewMetrics(scope: ScopeWhere) {
  if (scope.scope === "DENY") {
    return {
      totalInterviews: 0,
      feedbackSubmittedCount: 0,
      feedbackPendingCount: 0,
      feedbackOnTimeRate: 0,
      avgFeedbackQualityScore: 0,
      overdueFeedbackCount: 0,
    };
  }

  const scopeWhere = buildInterviewScopeWhere(scope);
  const interviews = await prisma.interview.findMany({
    where: scopeWhere,
    select: {
      id: true,
      status: true,
      scheduledAt: true,
      feedbacks: {
        select: {
          feedbackQualityScore: true,
          submittedAt: true,
        },
      },
    },
  });

  const total = interviews.length;
  const withFeedback = interviews.filter((i) => i.feedbacks.length > 0);
  const withoutFeedback = interviews.filter((i) => i.feedbacks.length === 0 && i.status === "completed");

  // On-time: submitted within 24 hours of completion (or scheduled time)
  const onTime = withFeedback.filter((i) => {
    const fbTime = i.feedbacks[0].submittedAt;
    const refTime = i.scheduledAt;
    if (!fbTime || !refTime) return false;
    return fbTime.getTime() - refTime.getTime() < 24 * 60 * 60 * 1000;
  });

  // Quality scores
  const scores = withFeedback
    .map((i) => i.feedbacks[0].feedbackQualityScore)
    .filter((s): s is number => s !== null && s !== undefined);

  // Overdue: completed but no feedback after 24h
  const now = new Date();
  const overdue = withoutFeedback.filter((i) => {
    const refTime = i.scheduledAt;
    if (!refTime) return false;
    return now.getTime() - refTime.getTime() > 24 * 60 * 60 * 1000;
  });

  return {
    totalInterviews: total,
    feedbackSubmittedCount: withFeedback.length,
    feedbackPendingCount: withoutFeedback.length,
    feedbackOnTimeRate: withFeedback.length > 0 ? Math.round((onTime.length / withFeedback.length) * 100) : 0,
    avgFeedbackQualityScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    overdueFeedbackCount: overdue.length,
  };
}
