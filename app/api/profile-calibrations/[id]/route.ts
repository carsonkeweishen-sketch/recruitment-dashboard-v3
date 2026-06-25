// Phase 5: Profile Calibration Detail API (GET + PATCH confirm)
import { getSession } from "@/server/auth/session";
import { getCalibrationByIdWithScope } from "@/server/repositories/business-feedback/profile-calibration-repository";
import { confirmCalibrationAction } from "@/server/services/business-feedback/profile-calibration-service";
import { logProfileCalibrationConfirmed } from "@/server/services/business-feedback/activity-log-helper";
import { buildScopeWhere } from "@/server/permissions/check-permission";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id } = await params;
  const scope = buildScopeWhere(session, "candidates");
  const calibration = await getCalibrationByIdWithScope(id, scope);
  if (!calibration) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  return Response.json({ success: true, data: calibration });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }

  if (body.status !== "confirmed") {
    return Response.json({ success: false, error: "Only status=confirmed is supported" }, { status: 400 });
  }

  try {
    const calibration = await confirmCalibrationAction(session.role, session.userId, session.departmentId, id);
    if (!calibration) return Response.json({ success: false, error: "Not found" }, { status: 404 });

    await logProfileCalibrationConfirmed({
      actorId: session.userId,
      calibrationId: calibration.id,
      jobId: calibration.jobId,
    });

    return Response.json({ success: true, data: calibration });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : msg.includes("already confirmed") ? 409 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
