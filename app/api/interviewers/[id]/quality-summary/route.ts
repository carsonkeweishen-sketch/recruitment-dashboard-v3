// Phase 6: GET /api/interviewers/:id/quality-summary
import { getSession } from "@/server/auth/session";
import { getInterviewerQualitySummary } from "@/server/services/interview/interviewer-quality-service";

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
    const result = await getInterviewerQualitySummary(
      id,
      session.role,
      session.userId,
      session.departmentId
    );

    if (!result.accessible) {
      return Response.json(
        { success: false, error: result.reason || "Access denied" },
        { status: 403 }
      );
    }

    return Response.json({ success: true, data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
