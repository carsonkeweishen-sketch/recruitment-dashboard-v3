// Phase 8.4: GET /api/interview-quality/analysis
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getInterviewQualityList } from "@/server/services/interviews/interview-quality-service";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "interviews");
    const data = await getInterviewQualityList(scope, session.userId, session.role, session.departmentId);
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "面试质量分析加载失败" }, { status: 500 }); }
}
