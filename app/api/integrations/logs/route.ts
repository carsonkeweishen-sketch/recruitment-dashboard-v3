// Phase 8.9: GET /api/integrations/logs
import { getSession } from "@/server/auth/session";
import { getRunLogs } from "@/server/services/data-ingestion/integration-service";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") ?? undefined;
    const limit = Number(searchParams.get("limit")) || 20;

    // Admin: all logs. Others: own provider logs or 403
    if (session.role !== "admin") {
      return Response.json({ success: false, error: "暂无权限查看集成运行日志" }, { status: 403 });
    }

    const result = await getRunLogs({ provider, limit });
    return Response.json({ success: true, data: result });
  } catch {
    return Response.json({ success: false, error: "加载运行日志失败" }, { status: 500 });
  }
}
