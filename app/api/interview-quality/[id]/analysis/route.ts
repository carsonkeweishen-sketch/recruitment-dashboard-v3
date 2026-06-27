// Phase 8.4: GET /api/interview-quality/:id/analysis
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getInterviewQualityDetail } from "@/server/services/interviews/interview-quality-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "interviews");
    if (scope.scope === "DENY") return Response.json({ success: false, error: "暂无权限查看面试质量详情" }, { status: 403 });
    const data = await getInterviewQualityDetail(id);
    if (!data) return Response.json({ success: false, error: "Feedback not found" }, { status: 404 });
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "面试质量详情加载失败" }, { status: 500 }); }
}
