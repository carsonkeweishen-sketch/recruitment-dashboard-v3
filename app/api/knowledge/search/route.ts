// Phase 8.8: GET /api/knowledge/search
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { search } from "@/server/services/knowledge/knowledge-service";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const collectionKey = url.searchParams.get("collection") || undefined;
  const objectType = url.searchParams.get("objectType") || undefined;
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "jobs");
    const result = await search(q, collectionKey, objectType, scope);
    return Response.json({ success: true, data: result });
  } catch { return Response.json({ success: false, error: "搜索失败" }, { status: 500 }); }
}
