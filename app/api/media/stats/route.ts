// Phase 8.10: GET /api/media/stats — Media KPI statistics
import { getSession } from "@/server/auth/session";
import { getMediaStats } from "@/server/services/media/media-service";
import { buildScopeWhere } from "@/server/permissions/check-permission";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "interviews"
    );

    const stats = await getMediaStats(scope);
    return Response.json({ success: true, data: stats });
  } catch {
    return Response.json({ success: false, error: "加载媒体统计失败" }, { status: 500 });
  }
}
