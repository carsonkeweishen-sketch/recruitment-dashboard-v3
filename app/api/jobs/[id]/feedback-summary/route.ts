// Phase 5: Job Feedback Summary API
import { getSession } from "@/server/auth/session";
import { getJobFeedbackSummary } from "@/server/services/business-feedback/business-feedback-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id } = await params;

  try {
    const summary = await getJobFeedbackSummary(session.role, session.userId, session.departmentId, id);
    return Response.json({ success: true, data: summary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status =
      msg.includes("Permission denied") ? 403 :
      msg.includes("not found") || msg.includes("access denied") ? 404 :
      msg.includes("does not belong") || msg.includes("Invalid") ? 400 :
      500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
