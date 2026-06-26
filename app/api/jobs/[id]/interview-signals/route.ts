// Phase 6: GET /api/jobs/:id/interview-signals
import { getSession } from "@/server/auth/session";
import { getJobInterviewSignals } from "@/server/services/interview/job-interview-signals-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await getJobInterviewSignals(
      id,
      session.role,
      session.userId,
      session.departmentId
    );

    if (!result) {
      return Response.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true, data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status =
      msg.includes("Permission denied") ? 403 :
      msg.includes("not found") ? 404 :
      500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
