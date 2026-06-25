// Phase 6: Interview Repository
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface InterviewListParams {
  scope: ScopeWhere;
  jobId?: string;
  applicationId?: string;
  interviewerId?: string;
  status?: string;
}

export async function getInterviews(params: InterviewListParams) {
  const { scope, jobId, applicationId, interviewerId, status } = params;
  if (scope.scope === "DENY") return [];

  const where: Record<string, unknown> = {};
  if (jobId) where.application = { jobId };
  if (applicationId) where.applicationId = applicationId;
  if (interviewerId) where.interviewerId = interviewerId;
  if (status) where.status = status;

  // Scope filtering
  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    where.application = { ...(where.application as object ?? {}), job: { departmentId: scope.departmentId } };
  } else if (scope.scope === "OWNED" && scope.userId) {
    where.OR = [
      { interviewerId: scope.userId },
      { application: { ownerId: scope.userId } },
    ];
  } else if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      // interviewer only sees their own interviews
      where.interviewerId = scope.userId;
    } else {
      where.OR = [
        { interviewerId: scope.userId },
        { application: { job: { businessOwnerId: scope.userId } } },
      ];
    }
  }

  return prisma.interview.findMany({
    where,
    include: {
      application: {
        include: {
          candidate: { select: { id: true, name: true, currentCompany: true, currentTitle: true } },
          job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } } } },
        },
      },
      interviewer: { select: { id: true, name: true } },
      feedbacks: { select: { id: true, overallRecommendation: true, submittedAt: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });
}

export async function getInterviewById(id: string) {
  return prisma.interview.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          candidate: { select: { id: true, name: true, currentCompany: true, currentTitle: true, tags: true } },
          job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } }, level: true } },
          owner: { select: { id: true, name: true } },
        },
      },
      interviewer: { select: { id: true, name: true } },
      feedbacks: true,
    },
  });
}

export async function getInterviewMetrics(scope: ScopeWhere) {
  const interviews = await getInterviews({ scope });
  const total = interviews.length;
  const submitted = interviews.filter((i) => i.feedbacks.length > 0).length;
  const pending = total - submitted;
  const onTime = interviews.filter((i) => {
    if (!i.completedAt || i.feedbacks.length === 0) return false;
    const fb = i.feedbacks[0];
    if (!fb.submittedAt) return false;
    const diff = fb.submittedAt.getTime() - i.completedAt.getTime();
    return diff <= 24 * 60 * 60 * 1000; // 24 hours
  }).length;

  return {
    totalInterviews: total,
    feedbackSubmittedCount: submitted,
    feedbackPendingCount: pending,
    feedbackOnTimeRate: total > 0 ? onTime / total : 0,
  };
}

export async function getInterviewFunnelByJob(jobId: string) {
  const interviews = await prisma.interview.findMany({
    where: { application: { jobId } },
    include: { feedbacks: { select: { overallRecommendation: true } } },
  });

  const byRound: Record<string, { total: number; passed: number }> = {};
  for (const iv of interviews) {
    if (!byRound[iv.round]) byRound[iv.round] = { total: 0, passed: 0 };
    byRound[iv.round].total++;
    const fb = iv.feedbacks[0];
    if (fb?.overallRecommendation && ["STRONG_HIRE", "HIRE"].includes(fb.overallRecommendation)) {
      byRound[iv.round].passed++;
    }
  }

  return {
    scheduledCount: interviews.filter((i) => i.status === "scheduled").length,
    completedCount: interviews.filter((i) => i.status === "completed").length,
    feedbackSubmittedCount: interviews.filter((i) => i.feedbacks.length > 0).length,
    feedbackPendingCount: interviews.filter((i) => i.status === "completed" && i.feedbacks.length === 0).length,
    byRound,
  };
}
