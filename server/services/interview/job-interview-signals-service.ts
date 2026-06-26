// Phase 6.1: Job Interview Signals Service (optimized)
// Fixed: removed listInterviews + JS filter. Uses shared Prisma instance.

import type { Role } from "@/server/permissions/types";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import { getJobByIdWithScope } from "@/server/repositories/job-repository";
import { getFeedbacksByJobId } from "@/server/repositories/interview/interview-feedback-repository";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Reuse the same PrismaClient pattern as repositories — single pool instance
let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    _prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  }
  return _prisma;
}

export async function getJobInterviewSignals(
  jobId: string,
  role: Role,
  userId: string,
  departmentId: string | undefined
) {
  requirePermission({ role, userId, departmentId }, "interviews", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "interviews");

  // Verify job access
  const job = await getJobByIdWithScope(jobId, scope);
  if (!job) {
    return null;
  }

  // Build scope-aware job interview query (single query, no JS filter)
  const interviewWhere: Record<string, unknown> = {
    application: { jobId },
  };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    interviewWhere.application = {
      job: { departmentId: scope.departmentId, id: jobId },
    };
  } else if (scope.scope === "OWNED" && scope.userId) {
    interviewWhere.OR = [
      { application: { ownerId: scope.userId } },
      { application: { job: { ownerId: scope.userId } } },
    ];
  } else if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      interviewWhere.interviewerId = scope.userId;
    } else {
      interviewWhere.application = {
        job: { businessOwnerId: scope.userId, id: jobId },
      };
    }
  } else if (scope.scope === "DENY") {
    return null;
  }
  // ALL scope: no extra filter

  // Single query for interview stats
  const prisma = getPrisma();
  const interviews = await prisma.interview.findMany({
    where: interviewWhere,
    select: {
      id: true,
      status: true,
      scheduledAt: true,
      feedbacks: {
        select: {
          id: true,
          feedbackQualityScore: true,
          submittedAt: true,
        },
      },
    },
  });

  // Get feedbacks for quality analysis
  const feedbacks = await getFeedbacksByJobId(jobId, scope);

  // Funnel stats from single interview query
  const scheduled = interviews.filter((i) => i.status === "scheduled").length;
  const completed = interviews.filter((i) => i.status === "completed").length;
  const withFeedback = interviews.filter((i) => i.feedbacks.length > 0).length;
  const pending = completed - withFeedback;

  // Quality
  const qualityScores = feedbacks
    .map((f) => f.feedbackQualityScore)
    .filter((s): s is number => s !== null && s !== undefined);
  const avgQuality =
    qualityScores.length > 0
      ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
      : 0;

  // Risk signals
  const riskSignals = feedbacks
    .filter((f) => f.riskSignals)
    .flatMap((f) => {
      const signals = f.riskSignals as Array<{
        riskType: string;
        riskLevel: string;
        reason: string;
      }>;
      const candidateName =
        f.interview?.application?.candidate?.name ?? "Unknown";
      return (signals || []).map((s) => ({
        ...s,
        feedbackId: f.id,
        candidateName,
      }));
    });

  // Avg delay
  const delays = feedbacks
    .filter((f) => f.submittedAt && f.interview?.scheduledAt)
    .map((f) => {
      const submitted = new Date(f.submittedAt!).getTime();
      const scheduled = new Date(f.interview!.scheduledAt!).getTime();
      return (submitted - scheduled) / (1000 * 60 * 60);
    });
  const avgDelayHours =
    delays.length > 0
      ? Math.round((delays.reduce((a, b) => a + b, 0) / delays.length) * 10) / 10
      : 0;

  return {
    job: {
      id: job.id,
      title: job.title,
      jobCode: job.jobCode,
    },
    interviewFunnel: {
      scheduledCount: scheduled,
      completedCount: completed,
      feedbackSubmittedCount: withFeedback,
      feedbackPendingCount: pending,
      firstInterviewPassRate: null as number | null,
      firstInterviewPassRateReason: "insufficient_data" as const,
      secondInterviewPassRate: null as number | null,
      secondInterviewPassRateReason: "insufficient_data" as const,
      finalInterviewPassRate: null as number | null,
      finalInterviewPassRateReason: "insufficient_data" as const,
      avgFeedbackDelayHours: avgDelayHours,
    },
    feedbackQualitySummary: {
      totalFeedbacks: feedbacks.length,
      avgQualityScore: avgQuality,
      qualityDistribution: {
        excellent: qualityScores.filter((s) => s >= 85).length,
        good: qualityScores.filter((s) => s >= 70 && s < 85).length,
        needs_improvement: qualityScores.filter((s) => s >= 50 && s < 70).length,
        insufficient: qualityScores.filter((s) => s < 50).length,
      },
    },
    riskSignals: riskSignals.slice(0, 10),
    interviewerQualitySummary: {
      totalInterviewers: new Set(feedbacks.map((f) => f.interviewerId)).size,
      avgQualityScore: avgQuality,
    },
  };
}
