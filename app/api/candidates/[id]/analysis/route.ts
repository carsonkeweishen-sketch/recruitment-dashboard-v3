// Phase 8.3: GET /api/candidates/:id/analysis
import { getSession } from "@/server/auth/session";
import { getCandidateAnalysisDetailData } from "@/server/services/candidates/candidate-analysis-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const data = await getCandidateAnalysisDetailData(id);
    if (!data) return Response.json({ success: false, error: "Candidate not found" }, { status: 404 });
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "候选人评估加载失败" }, { status: 500 }); }
}
