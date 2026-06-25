// Phase 5: Profile Calibration Service
import type { Role } from "@/server/permissions/types";
import { requirePermission } from "@/server/permissions/check-permission";
import {
  createCalibration,
  confirmCalibration,
  getCalibrationById,
} from "@/server/repositories/business-feedback/profile-calibration-repository";
import type { CreateCalibrationInput } from "@/server/repositories/business-feedback/profile-calibration-repository";

export async function submitCalibration(
  role: Role, userId: string, departmentId: string | undefined,
  input: Omit<CreateCalibrationInput, "createdBy">
) {
  requirePermission({ role, userId, departmentId }, "candidates", "create");

  if (role === "interviewer") {
    throw new Error("Permission denied: interviewer cannot create profile calibrations");
  }

  if (!input.sourceFeedbackIds || input.sourceFeedbackIds.length === 0) {
    throw new Error("At least one source feedback is required");
  }

  return createCalibration({ ...input, createdBy: userId });
}

export async function confirmCalibrationAction(
  role: Role, userId: string, departmentId: string | undefined,
  calibrationId: string
) {
  // Only admin/leader/hrbp/business_owner can confirm
  if (role === "recruiter" || role === "interviewer") {
    throw new Error("Permission denied: only admin/leader/hrbp/business_owner can confirm calibrations");
  }

  requirePermission({ role, userId, departmentId }, "candidates", "update");

  const calibration = await getCalibrationById(calibrationId);
  if (!calibration) throw new Error("Calibration not found");

  return confirmCalibration(calibrationId, userId);
}
