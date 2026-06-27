// Phase 8.8: GET /api/knowledge/stats
import { getSession } from "@/server/auth/session";
import { getStats } from "@/server/services/knowledge/knowledge-service";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const data = await getStats();
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "加载失败" }, { status: 500 }); }
}
