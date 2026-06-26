// Phase 5: Profile Calibrations API
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { submitCalibration } from "@/server/services/business-feedback/profile-calibration-service";
import { getCalibrationsByJob } from "@/server/repositories/business-feedback/profile-calibration-repository";
import { logProfileCalibrationCreated } from "@/server/services/business-feedback/activity-log-helper";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id } = await params;
  const scope = buildScopeWhere(session, "candidates");

  const calibrations = await getCalibrationsByJob(id, scope);
  return Response.json({ success: true, data: calibrations });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id: jobId } = await params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }

  const { sourceFeedbackIds, calibrationReason, beforeSnapshot, afterSnapshot } = body;

  if (!sourceFeedbackIds || !Array.isArray(sourceFeedbackIds) || sourceFeedbackIds.length === 0) {
    return Response.json({ success: false, error: "At least one sourceFeedbackId is required" }, { status: 400 });
  }

  try {
    const calibration = await submitCalibration(session.role, session.userId, session.departmentId, {
      jobId,
      sourceFeedbackIds: sourceFeedbackIds as string[],
      calibrationReason: calibrationReason as string | undefined,
      beforeSnapshot: beforeSnapshot as Record<string, unknown> | undefined,
      afterSnapshot: afterSnapshot as Record<string, unknown> | undefined,
    });

    await logProfileCalibrationCreated({
      actorId: session.userId,
      calibrationId: calibration.id,
      jobId,
      sourceFeedbackIds: sourceFeedbackIds as string[],
    });

    return Response.json({ success: true, data: calibration }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status =
      msg.includes("Permission denied") ? 403 :
      msg.includes("not found") || msg.includes("access denied") ? 404 :
      msg.includes("does not belong") ? 400 :
      500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
