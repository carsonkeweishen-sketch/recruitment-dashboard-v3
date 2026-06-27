// Phase 8.8: GET/POST /api/knowledge/collections
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getCollections, createCollection } from "@/server/services/knowledge/knowledge-service";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "jobs");
    const data = await getCollections(scope);
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "加载失败" }, { status: 500 }); }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") return Response.json({ success: false, error: "暂无权限" }, { status: 403 });
  try {
    const body = await request.json();
    const data = await createCollection({ ...body, createdById: session.userId });
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "创建失败" }, { status: 500 }); }
}
