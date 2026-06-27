// Phase 8.6: GET /api/ai/insights
import { getSession } from "@/server/auth/session";
import { listInsights } from "@/server/services/ai/ai-insight-service";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const objectType = url.searchParams.get("objectType") || undefined;
  const objectId = url.searchParams.get("objectId") || undefined;
  try {
    const data = await listInsights(objectType, objectId);
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "加载失败" }, { status: 500 }); }
}
