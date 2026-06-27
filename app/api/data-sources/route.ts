// Phase 8.7: GET /api/data-sources
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getSources } from "@/server/services/data-ingestion/data-source-service";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "jobs");
    const data = await getSources({ scope, userId: session.userId, role: session.role, departmentId: session.departmentId });
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "资料加载失败" }, { status: 500 }); }
}
