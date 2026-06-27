// Phase 8.3: GET /api/candidates/:id/analysis
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getCandidateAnalysisDetailData } from "@/server/services/candidates/candidate-analysis-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // interviewer cannot access candidate detail analysis
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "暂无权限查看候选人评估详情" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "candidates");
    // Verify candidate is within scope
    if (scope.scope === "DENY") {
      return Response.json({ success: false, error: "暂无权限查看该候选人" }, { status: 403 });
    }
    const data = await getCandidateAnalysisDetailData(id);
    if (!data) return Response.json({ success: false, error: "Candidate not found" }, { status: 404 });
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "候选人评估加载失败" }, { status: 500 }); }
}
