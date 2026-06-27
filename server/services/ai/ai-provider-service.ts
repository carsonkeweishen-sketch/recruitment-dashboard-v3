// Phase 8.6A: AI Provider Service — DeepSeek adapter
// Checks DEEPSEEK_API_KEY, delegates to deepseek-provider.ts
// No fake/mock responses. No API Key exposure.

import { getProviderStatus as deepseekStatus, generateCompletion as deepseekGenerate } from "@/server/services/ai/providers/deepseek-provider";

export interface ProviderStatus {
  status: "configured" | "not_configured";
  provider?: string;
  model?: string;
  message?: string;
}

export function getProviderStatus(): ProviderStatus {
  const status = deepseekStatus();
  if (status.status === "configured") {
    return { status: "configured", provider: status.provider, model: status.model };
  }
  return { status: "not_configured", message: "AI Provider 未配置，暂不能生成 AI 辅助建议。系统规则提醒仍可使用。" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateCompletion(systemPrompt: string, userPrompt: string, promptVersion: string): Promise<any> {
  const status = deepseekStatus();
  if (status.status !== "configured") {
    throw new Error("AI Provider not configured");
  }
  return deepseekGenerate(systemPrompt, userPrompt, promptVersion);
}
