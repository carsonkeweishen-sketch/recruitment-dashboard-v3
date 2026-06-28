// Phase 8.2R: POST /api/analytics/recruitment-funnel/refresh-snapshot
// Optional: refresh the analysis cache snapshot. Currently returns not_enabled.
import { getSession } from "@/server/auth/session";

export async function POST() {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") {
    return Response.json({ success: false, error: "暂无权限刷新快照" }, { status: 403 });
  }
  // Snapshot caching not yet enabled — data is real-time aggregated
  return Response.json({
    success: true,
    data: {
      status: "not_enabled",
      message: "漏斗数据当前为实时聚合，暂未启用快照缓存。数据已是最新。",
    },
  });
}
