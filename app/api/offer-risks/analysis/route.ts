// Phase 8.5: GET /api/offer-risks/analysis
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getOfferRiskList } from "@/server/services/offer-risks/offer-risk-service";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "interviewer") return Response.json({ success: false, error: "暂无权限查看 Offer 风险分析" }, { status: 403 });
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "jobs");
    const data = await getOfferRiskList(scope, session.userId, session.role, session.departmentId);
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "Offer 风险分析加载失败" }, { status: 500 }); }
}
