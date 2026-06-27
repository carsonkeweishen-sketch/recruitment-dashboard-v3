// Phase 8.7: POST /api/integrations/feishu/connect (预留)
import { getSession } from "@/server/auth/session";

export async function POST(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return Response.json({ success: true, data: { status: "not_configured", message: "飞书连接未配置。当前仅保存链接和关联对象；配置飞书应用授权后，可读取文档内容用于解析。" } });
}
