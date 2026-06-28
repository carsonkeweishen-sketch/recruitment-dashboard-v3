// Phase 8.9: POST /api/integrations/[provider]/validate-config
import { getSession } from "@/server/auth/session";
import { validateProviderConfig } from "@/server/services/data-ingestion/integration-service";

const VALID_PROVIDERS = ["deepseek", "openai_compatible", "feishu", "moka"];

export async function POST(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // Interviewer cannot validate configurations
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "暂无权限验证集成配置" }, { status: 403 });
  }

  try {
    const { provider } = await params;

    if (!VALID_PROVIDERS.includes(provider)) {
      return Response.json({ success: false, error: `不支持的集成提供商: ${provider}` }, { status: 400 });
    }

    const result = await validateProviderConfig(provider);

    // NEVER return secret/token in response
    return Response.json({ success: true, data: result });
  } catch {
    return Response.json({ success: false, error: "验证配置失败" }, { status: 500 });
  }
}
