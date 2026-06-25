// DeepSeek Client — Phase 3.1.1 占位
// Phase 10 实现真实调用

import type { DeepSeekConfig } from "./types";
import type { ChatCompletionRequest, ChatCompletionResponse } from "@/server/integrations/openai/types";
import type { ClientResult } from "@/server/integrations/openai/client";

export class DeepSeekClient {
  private config: DeepSeekConfig | null = null;

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.DEEPSEEK_BASE_URL;
    const model = process.env.DEEPSEEK_MODEL;
    if (apiKey && baseUrl && model) {
      this.config = { apiKey, baseUrl, model };
    }
  }

  get status(): "not_configured" | "ready" {
    return this.config ? "ready" : "not_configured";
  }

  async chatCompletion(_req: ChatCompletionRequest): Promise<ClientResult<ChatCompletionResponse>> {
    if (!this.config) return { ok: false, errorCode: "not_configured", message: "DeepSeek not configured" };
    return { ok: false, errorCode: "not_configured", message: "DeepSeek integration not yet implemented" };
  }
}

export const deepseek = new DeepSeekClient();
