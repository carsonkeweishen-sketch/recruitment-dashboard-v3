// Phase 8.6: GET /api/ai/audit-logs
import { getSession } from "@/server/auth/session";
import { listLogs } from "@/server/services/ai/ai-audit-service";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const data = await listLogs(20);
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "加载失败" }, { status: 500 }); }
}
