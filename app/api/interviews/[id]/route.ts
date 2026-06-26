// Phase 6: GET /api/interviews/:id — Interview detail
import { getSession } from "@/server/auth/session";
import { getInterviewDetail } from "@/server/services/interview/interview-service";

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
    const interview = await getInterviewDetail(
      id,
      session.role,
      session.userId,
      session.departmentId
    );

    if (!interview) {
      return Response.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true, data: interview });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
