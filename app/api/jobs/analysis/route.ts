// Phase 8.2: GET /api/jobs/analysis — Job Center list API
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getJobsAnalysisList } from "@/server/services/jobs/job-analysis-service";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "interviewer") return Response.json({ success: false, error: "暂无权限查看岗位分析" }, { status: 403 });

  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "jobs");
    const data = await getJobsAnalysisList(scope, session.userId, session.role, session.departmentId);
    return Response.json({ success: true, data });
  } catch {
    return Response.json({ success: false, error: "岗位分析加载失败" }, { status: 500 });
  }
}
