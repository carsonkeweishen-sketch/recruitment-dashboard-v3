// Phase 5: Business Feedback Service
import type { Role } from "@/server/permissions/types";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import {
  getFeedbacks,
  getFeedbackById,
  createFeedback,
  getFeedbackStatsByJob,
} from "@/server/repositories/business-feedback/business-feedback-repository";
import { getCalibrationsByJob } from "@/server/repositories/business-feedback/profile-calibration-repository";
import type { CreateFeedbackInput } from "@/server/repositories/business-feedback/business-feedback-repository";

export async function listFeedbacks(
  role: Role, userId: string | undefined, departmentId: string | undefined,
  filters: { jobId?: string; applicationId?: string }
) {
  const scope = buildScopeWhere({ role, userId, departmentId }, "candidates");
  // interviewer cannot access business feedback
  if (role === "interviewer") return [];
  return getFeedbacks({ scope, ...filters });
}

export async function getFeedback(id: string) {
  return getFeedbackById(id);
}

export async function submitFeedback(
  role: Role, userId: string, departmentId: string | undefined,
  input: Omit<CreateFeedbackInput, "reviewerId">
) {
  requirePermission({ role, userId, departmentId }, "candidates", "create");

  // Business owner can only create for RELATED jobs
  if (role === "business_owner") {
    const scope = buildScopeWhere({ role, userId, departmentId }, "candidates");
    if (scope.scope !== "RELATED") {
      throw new Error("Permission denied: business_owner can only create feedback for related jobs");
    }
  }

  if (role === "interviewer") {
    throw new Error("Permission denied: interviewer cannot create business feedback");
  }

  return createFeedback({ ...input, reviewerId: userId });
}

export async function getJobFeedbackSummary(
  role: Role, userId: string | undefined, departmentId: string | undefined,
  jobId: string
) {
  requirePermission({ role, userId, departmentId }, "candidates", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "candidates");

  const [stats, calibrations, recentFeedbacks] = await Promise.all([
    getFeedbackStatsByJob(jobId),
    getCalibrationsByJob(jobId, scope),
    getFeedbacks({ scope, jobId }),
  ]);

  return {
    jobId,
    feedbackCount: stats.total,
    decisionStats: stats.decisionStats,
    reasonStats: stats.reasonStats,
    profileSignals: stats.profileSignals,
    recentFeedbacks: recentFeedbacks.slice(0, 10),
    calibrationHistory: calibrations.map((c) => ({
      id: c.id,
      sourceFeedbackIds: c.sourceFeedbackIds,
      calibrationReason: c.calibrationReason,
      status: (c.afterSnapshot as Record<string, unknown>)?._status || "draft",
      confirmedAt: (c.afterSnapshot as Record<string, unknown>)?._confirmedAt || null,
      createdAt: c.createdAt,
    })),
  };
}
