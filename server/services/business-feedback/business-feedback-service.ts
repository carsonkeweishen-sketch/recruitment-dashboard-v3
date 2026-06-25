// Phase 5.1: Business Feedback Service (with object-level ownership check)
import type { Role } from "@/server/permissions/types";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import {
  getFeedbacks,
  getFeedbackById,
  createFeedback,
  getFeedbackStatsByJob,
} from "@/server/repositories/business-feedback/business-feedback-repository";
import { getCalibrationsByJob } from "@/server/repositories/business-feedback/profile-calibration-repository";
import { requireJobOwnership } from "@/server/repositories/business-feedback/ownership-check";
import type { CreateFeedbackInput } from "@/server/repositories/business-feedback/business-feedback-repository";

export async function listFeedbacks(
  role: Role, userId: string | undefined, departmentId: string | undefined,
  filters: { jobId?: string; applicationId?: string }
) {
  const scope = buildScopeWhere({ role, userId, departmentId }, "candidates");
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
  // business_owner uses "view" action for feedback (create is gated by ownership check)
  if (role === "business_owner") {
    requirePermission({ role, userId, departmentId }, "candidates", "view");
  } else {
    requirePermission({ role, userId, departmentId }, "candidates", "create");
  }

  if (role === "interviewer") {
    throw new Error("Permission denied: interviewer cannot create business feedback");
  }

  // Phase 5.1: Object-level ownership check — must be related to the job
  await requireJobOwnership(userId, input.jobId, role);

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
      status: c.status,
      confirmedAt: c.confirmedAt?.toISOString() || null,
      confirmedBy: c.confirmedBy,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}
