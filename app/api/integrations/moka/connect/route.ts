// Phase 8.7: POST /api/integrations/moka/connect (预留)
import { getSession } from "@/server/auth/session";

export async function POST(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return Response.json({ success: true, data: { status: "not_configured", message: "Moka 连接未配置。当前仅保留对象链接和外部 ID；配置后可读取岗位、候选人和投递状态用于分析，本系统不写回 Moka。" } });
}
