// Phase 8.6: PATCH /api/ai/insights/[id]/review
import { getSession } from "@/server/auth/session";
import { reviewInsight } from "@/server/services/ai/ai-insight-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const { status, reviewNote, editedSummary, editedSuggestedAction } = await request.json();
    const data = await reviewInsight(id, session.userId, status, reviewNote, editedSummary, editedSuggestedAction);
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "操作失败" }, { status: 500 }); }
}
