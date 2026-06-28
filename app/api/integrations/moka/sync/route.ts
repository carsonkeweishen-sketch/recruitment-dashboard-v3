// Phase 8.9: POST /api/integrations/moka/sync
import { getSession } from "@/server/auth/session";
import { attemptMokaSync } from "@/server/services/data-ingestion/integration-service";

export async function POST(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // Interviewer cannot trigger moka sync
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "暂无权限触发 Moka 同步" }, { status: 403 });
  }

  try {
    const result = await attemptMokaSync();
    return Response.json({ success: true, data: result });
  } catch {
    return Response.json({ success: false, error: "Moka 同步失败" }, { status: 500 });
  }
}
