// Phase 8.2R: GET /api/analytics/recruitment-funnel/summary
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getFunnelAnalysis } from "@/server/services/analytics/recruitment-funnel-service";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // interviewer gets 403 safe for funnel — no global funnel access
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "暂无权限访问招聘漏斗", safe: true }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const dateFrom = url.searchParams.get("dateFrom") || undefined;
    const dateTo = url.searchParams.get("dateTo") || undefined;
    const jobId = url.searchParams.get("jobId") || undefined;
    const channel = url.searchParams.get("channel") || undefined;
    const departmentId = url.searchParams.get("departmentId") || undefined;

    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "jobs"
    );

    const result = await getFunnelAnalysis(scope, {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      jobId,
      channel,
      departmentId,
    });

    return Response.json({ success: true, data: result });
  } catch (e) {
    return Response.json({ success: false, error: "漏斗分析加载失败" }, { status: 500 });
  }
}
