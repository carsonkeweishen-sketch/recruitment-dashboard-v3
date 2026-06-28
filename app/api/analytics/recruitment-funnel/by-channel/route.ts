// Phase 8.2R: GET /api/analytics/recruitment-funnel/by-channel
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getFunnelAnalysis } from "@/server/services/analytics/recruitment-funnel-service";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "暂无权限访问招聘漏斗", safe: true }, { status: 403 });
  }
  try {
    const url = new URL(request.url);
    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "jobs"
    );
    const result = await getFunnelAnalysis(scope, {
      dateFrom: url.searchParams.get("dateFrom") ? new Date(url.searchParams.get("dateFrom")!) : undefined,
      dateTo: url.searchParams.get("dateTo") ? new Date(url.searchParams.get("dateTo")!) : undefined,
    });
    return Response.json({ success: true, data: { byChannel: result.byChannel } });
  } catch {
    return Response.json({ success: false, error: "渠道数据加载失败" }, { status: 500 });
  }
}
