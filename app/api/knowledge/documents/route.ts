// Phase 8.8: GET /api/knowledge/documents
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getDocuments } from "@/server/services/knowledge/knowledge-service";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "jobs");
    const data = await getDocuments(scope);
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "加载失败" }, { status: 500 }); }
}
