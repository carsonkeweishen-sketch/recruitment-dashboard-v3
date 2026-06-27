// Phase 8.3: GET /api/candidates/analysis
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getCandidatesAnalysisList } from "@/server/services/candidates/candidate-analysis-service";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "interviewer") return Response.json({ success: false, error: "暂无权限查看候选人评估" }, { status: 403 });
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "candidates");
    const data = await getCandidatesAnalysisList(scope, session.userId, session.role, session.departmentId);
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "候选人评估加载失败" }, { status: 500 }); }
}
