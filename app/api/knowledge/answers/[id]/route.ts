// Phase 8.8: GET/PATCH /api/knowledge/answers/[id]
import { getSession } from "@/server/auth/session";
import { getAnswer, reviewAnswer } from "@/server/services/knowledge/knowledge-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const data = await getAnswer(id);
    if (!data) return Response.json({ success: false, error: "Not found" }, { status: 404 });
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "加载失败" }, { status: 500 }); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const { humanReviewStatus, editedAnswer } = await request.json();
    if (!["accepted", "edited", "rejected"].includes(humanReviewStatus)) {
      return Response.json({ success: false, error: "Invalid status" }, { status: 400 });
    }
    const data = await reviewAnswer(id, humanReviewStatus, editedAnswer);
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "更新失败" }, { status: 500 }); }
}
