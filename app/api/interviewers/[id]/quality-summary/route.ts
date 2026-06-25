// Phase 6: Interviewer Quality Summary API
import { getSession } from "@/server/auth/session";
import { getInterviewerQuality } from "@/server/services/interview/interview-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id } = await params;

  try {
    const summary = await getInterviewerQuality(session.role, session.userId, session.departmentId, id);
    return Response.json({ success: true, data: summary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
