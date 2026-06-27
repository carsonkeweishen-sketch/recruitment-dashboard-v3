// Phase 8.5: GET /api/offer-risks/:id/analysis
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getOfferRiskDetailData } from "@/server/services/offer-risks/offer-risk-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "interviewer") return Response.json({ success: false, error: "暂无权限查看 Offer 风险详情" }, { status: 403 });
  const { id } = await params;
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "jobs");
    if (scope.scope === "DENY") return Response.json({ success: false, error: "暂无权限" }, { status: 403 });
    const data = await getOfferRiskDetailData(id);
    if (!data) return Response.json({ success: false, error: "Not found" }, { status: 404 });
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "Offer 风险详情加载失败" }, { status: 500 }); }
}
