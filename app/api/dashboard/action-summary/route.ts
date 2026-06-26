// Phase 7: GET /api/dashboard/action-summary
import { getSession } from "@/server/auth/session";
import { getDashboardActionSummary } from "@/server/services/action/action-service";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const metrics = await getDashboardActionSummary(session.role, session.userId, session.departmentId);
    return Response.json({ success: true, data: metrics });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
