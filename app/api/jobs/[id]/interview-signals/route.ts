// Phase 6: Job Interview Signals API
import { getSession } from "@/server/auth/session";
import { getJobInterviewSignals } from "@/server/services/interview/interview-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id } = await params;

  try {
    const signals = await getJobInterviewSignals(session.role, session.userId, session.departmentId, id);
    return Response.json({ success: true, data: signals });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    return Response.json({ success: false, error: msg }, { status: 500 });
  }
}
