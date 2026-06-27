// Phase 8.2: GET /api/jobs/:id/analysis — Job detail analysis API
import { getSession } from "@/server/auth/session";
import { getJobAnalysisDetailData } from "@/server/services/jobs/job-analysis-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const data = await getJobAnalysisDetailData(id);
    if (!data) return Response.json({ success: false, error: "Job not found" }, { status: 404 });
    return Response.json({ success: true, data });
  } catch {
    return Response.json({ success: false, error: "岗位分析加载失败" }, { status: 500 });
  }
}
