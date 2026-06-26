// Phase 7: GET /api/jobs/:id/actions
import { getSession } from "@/server/auth/session";
import { getJobActionList } from "@/server/services/action/action-service";

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
    const actions = await getJobActionList(id, session.role, session.userId, session.departmentId);
    return Response.json({ success: true, data: actions });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
