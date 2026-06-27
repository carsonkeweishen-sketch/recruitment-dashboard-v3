// Phase 8.7: Integration Service — honest status, no fake connections
export function getIntegrationsStatus() {
  return {
    integrations: [
      { provider: "feishu", status: "not_configured", displayName: "飞书", message: "飞书连接未配置。当前仅保存链接和关联对象；配置飞书应用授权后，可读取文档内容用于解析。" },
      { provider: "moka", status: "not_configured", displayName: "Moka", message: "Moka 连接未配置。当前仅保留对象链接和外部 ID；配置后可读取岗位、候选人和投递状态用于分析，本系统不写回 Moka。" },
      { provider: "deepseek", status: process.env.DEEPSEEK_API_KEY ? "connected" : "not_configured", displayName: "DeepSeek AI", message: process.env.DEEPSEEK_API_KEY ? "已连接" : "DeepSeek API Key 未配置" },
    ],
  };
}

export function getProviderStatus(provider: string) {
  if (provider === "feishu") return { provider: "feishu", status: "not_configured", message: "飞书连接未配置" };
  if (provider === "moka") return { provider: "moka", status: "not_configured", message: "Moka 连接未配置" };
  if (provider === "deepseek") return { provider: "deepseek", status: process.env.DEEPSEEK_API_KEY ? "connected" : "not_configured" };
  return { provider, status: "unknown" };
}
