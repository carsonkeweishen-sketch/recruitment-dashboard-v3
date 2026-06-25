// Phase 5.1: Profile Calibration Service (with object-level ownership check)
import type { Role } from "@/server/permissions/types";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import {
  createCalibration,
  confirmCalibration,
  getCalibrationById,
} from "@/server/repositories/business-feedback/profile-calibration-repository";
import { requireJobOwnership, requireCalibrationOwnership } from "@/server/repositories/business-feedback/ownership-check";
import type { CreateCalibrationInput } from "@/server/repositories/business-feedback/profile-calibration-repository";

export async function submitCalibration(
  role: Role, userId: string, departmentId: string | undefined,
  input: Omit<CreateCalibrationInput, "createdBy">
) {
  // business_owner uses "view" action (create is gated by ownership check)
  if (role === "business_owner") {
    requirePermission({ role, userId, departmentId }, "candidates", "view");
  } else {
    requirePermission({ role, userId, departmentId }, "candidates", "create");
  }

  if (role === "interviewer") {
    throw new Error("Permission denied: interviewer cannot create profile calibrations");
  }

  if (!input.sourceFeedbackIds || input.sourceFeedbackIds.length === 0) {
    throw new Error("At least one source feedback is required");
  }

  // Phase 5.1: Object-level ownership check
  await requireJobOwnership(userId, input.jobId, role);

  // Phase 5.2: Validate sourceFeedbackIds belong to job and are visible
  const { getFeedbackByIdWithScope } = await import("@/server/repositories/business-feedback/business-feedback-repository");
  const scope = buildScopeWhere({ role, userId, departmentId }, "candidates");
  for (const fid of input.sourceFeedbackIds) {
    const fb = await getFeedbackByIdWithScope(fid, scope);
    if (!fb) throw new Error(`Source feedback ${fid} not found or access denied`);
    if (fb.jobId !== input.jobId) throw new Error(`Source feedback ${fid} does not belong to job ${input.jobId}`);
  }

  return createCalibration({ ...input, createdBy: userId });
}

export async function confirmCalibrationAction(
  role: Role, userId: string, departmentId: string | undefined,
  calibrationId: string
) {
  if (role === "recruiter" || role === "interviewer") {
    throw new Error("Permission denied: only admin/leader/hrbp/business_owner can confirm calibrations");
  }

  requirePermission({ role, userId, departmentId }, "candidates", "update");

  // Phase 5.1: Object-level ownership check
  await requireCalibrationOwnership(userId, calibrationId, role);

  const calibration = await getCalibrationById(calibrationId);
  if (!calibration) throw new Error("Calibration not found");

  return confirmCalibration(calibrationId, userId);
}
