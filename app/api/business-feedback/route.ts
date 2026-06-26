// Phase 5: Business Feedback API
import { getSession } from "@/server/auth/session";
import { listFeedbacks, submitFeedback } from "@/server/services/business-feedback/business-feedback-service";
import { logBusinessFeedbackCreated } from "@/server/services/business-feedback/activity-log-helper";

export async function GET(request: Request) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);

  const feedbacks = await listFeedbacks(session.role, session.userId, session.departmentId, {
    jobId: searchParams.get("jobId") ?? undefined,
    applicationId: searchParams.get("applicationId") ?? undefined,
  });

  return Response.json({ success: true, data: feedbacks, scope: session.role });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }

  const { jobId, applicationId, decision, reasonCode, reasonText } = body;

  if (!jobId || !decision) {
    return Response.json({ success: false, error: "jobId and decision are required" }, { status: 400 });
  }

  if (!["PASS", "REJECT", "HOLD", "REDIRECT"].includes(decision as string)) {
    return Response.json({ success: false, error: "Invalid decision" }, { status: 400 });
  }

  try {
    const feedback = await submitFeedback(session.role, session.userId, session.departmentId, {
      jobId: jobId as string,
      applicationId: applicationId as string | undefined,
      decision: decision as string,
      reasonCode: reasonCode as string | undefined,
      reasonText: reasonText as string | undefined,
    });

    // Write ActivityLog
    await logBusinessFeedbackCreated({
      actorId: session.userId,
      feedbackId: feedback.id,
      jobId: jobId as string,
      applicationId: applicationId as string | undefined,
      decision: decision as string,
      reasonCode: reasonCode as string | undefined,
    });

    return Response.json({ success: true, data: feedback }, { status: 201 });
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
