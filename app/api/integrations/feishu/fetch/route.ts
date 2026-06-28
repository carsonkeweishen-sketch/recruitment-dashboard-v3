// Phase 8.9: POST /api/integrations/feishu/fetch
import { getSession } from "@/server/auth/session";
import { attemptFeishuFetch } from "@/server/services/data-ingestion/integration-service";

export async function POST(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // Interviewer cannot trigger feishu fetch
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "暂无权限触发飞书抓取" }, { status: 403 });
  }

  try {
    const result = await attemptFeishuFetch();
    return Response.json({ success: true, data: result });
  } catch {
    return Response.json({ success: false, error: "飞书抓取失败" }, { status: 500 });
  }
}
