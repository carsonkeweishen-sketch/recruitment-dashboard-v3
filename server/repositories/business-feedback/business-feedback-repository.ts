// Phase 5: Business Feedback Repository
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface CreateFeedbackInput {
  jobId: string;
  applicationId?: string;
  reviewerId: string;
  decision: string;
  reasonCode?: string;
  reasonText?: string;
}

export interface FeedbackListParams {
  scope: ScopeWhere;
  jobId?: string;
  applicationId?: string;
}

export async function getFeedbacks(params: FeedbackListParams) {
  const { scope, jobId, applicationId } = params;
  if (scope.scope === "DENY") return [];

  const where: Record<string, unknown> = {};
  if (jobId) where.jobId = jobId;
  if (applicationId) where.applicationId = applicationId;

  // Scope filtering
  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    where.job = { departmentId: scope.departmentId };
  } else if (scope.scope === "OWNED" && scope.userId) {
    where.OR = [
      { job: { ownerId: scope.userId } },
      { reviewerId: scope.userId },
    ];
  } else if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      // interviewer cannot see business feedback
      return [];
    }
    where.OR = [
      { job: { businessOwnerId: scope.userId } },
      { reviewerId: scope.userId },
    ];
  }

  return prisma.businessFeedback.findMany({
    where,
    include: {
      job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } } } },
      reviewer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeedbackById(id: string) {
  return prisma.businessFeedback.findUnique({
    where: { id },
    include: {
      job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } } } },
      reviewer: { select: { id: true, name: true } },
    },
  });
}

export async function createFeedback(input: CreateFeedbackInput) {
  return prisma.businessFeedback.create({
    data: {
      jobId: input.jobId,
      applicationId: input.applicationId,
      reviewerId: input.reviewerId,
      decision: input.decision,
      reasonCode: input.reasonCode,
      reasonText: input.reasonText,
    },
    include: {
      job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } } } },
      reviewer: { select: { id: true, name: true } },
    },
  });
}

export async function getFeedbackStatsByJob(jobId: string) {
  const feedbacks = await prisma.businessFeedback.findMany({
    where: { jobId },
    select: { decision: true, reasonCode: true },
  });

  const total = feedbacks.length;
  const decisionStats: Record<string, number> = {};
  const reasonStats: Record<string, number> = {};

  for (const f of feedbacks) {
    decisionStats[f.decision] = (decisionStats[f.decision] || 0) + 1;
    if (f.reasonCode) {
      reasonStats[f.reasonCode] = (reasonStats[f.reasonCode] || 0) + 1;
    }
  }

  const rejectCount = decisionStats["REJECT"] || 0;
  const rejectionRate = total > 0 ? rejectCount / total : 0;

  // Profile signals: detect calibration needs
  let calibrationNeeded = false;
  let topReasonCode: string | null = null;
  let topReasonCount = 0;
  let suggestedCalibrationReason: string | null = null;

  for (const [code, count] of Object.entries(reasonStats)) {
    if (count > topReasonCount) {
      topReasonCount = count;
      topReasonCode = code;
    }
  }

  // Rule: >= 3 REJECT + same reasonCode >= 2 → calibration needed
  const sameReasonRejects = feedbacks.filter(
    (f) => f.decision === "REJECT" && f.reasonCode === topReasonCode
  ).length;
  if (rejectCount >= 3 && sameReasonRejects >= 2) {
    calibrationNeeded = true;
    suggestedCalibrationReason = `连续 ${sameReasonRejects} 个候选人因「${topReasonCode}」被拒，建议复核岗位画像`;
  } else if (total >= 3 && rejectionRate >= 0.6) {
    calibrationNeeded = true;
    suggestedCalibrationReason = `岗位业务筛选拒绝率 ${(rejectionRate * 100).toFixed(0)}%，建议复核岗位画像`;
  }

  return {
    total,
    decisionStats,
    reasonStats,
    rejectionRate,
    profileSignals: {
      calibrationNeeded,
      topReasonCode,
      topReasonCount,
      rejectionRate,
      suggestedCalibrationReason,
    },
  };
}
