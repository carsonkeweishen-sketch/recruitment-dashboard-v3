// Phase 8.6: GET /api/ai/insights/[id]
import { getSession } from "@/server/auth/session";
import { getInsight } from "@/server/services/ai/ai-insight-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const data = await getInsight(id);
    if (!data) return Response.json({ success: false, error: "Not found" }, { status: 404 });
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "加载失败" }, { status: 500 }); }
}
