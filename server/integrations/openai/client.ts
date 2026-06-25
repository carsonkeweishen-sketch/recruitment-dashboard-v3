// OpenAI Client — Phase 3.1.1 占位
// Phase 10 实现真实调用
// 当前返回 not_configured

import type { OpenAIConfig, ChatCompletionRequest, ChatCompletionResponse } from "./types";

export type IntegrationStatus = "not_configured" | "ready";
export type ClientResult<T> = { ok: true; data: T } | { ok: false; errorCode: "not_configured" | "request_failed"; message: string };

export class OpenAIClient {
  private config: OpenAIConfig | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL;
    const model = process.env.OPENAI_MODEL;
    if (apiKey && baseUrl && model) {
      this.config = { apiKey, baseUrl, model };
    }
  }

  get status(): IntegrationStatus {
    return this.config ? "ready" : "not_configured";
  }

  async chatCompletion(_request: ChatCompletionRequest): Promise<ClientResult<ChatCompletionResponse>> {
    if (!this.config) return { ok: false, errorCode: "not_configured", message: "OpenAI not configured" };
    // Phase 10: 实现真实 API 调用
    return { ok: false, errorCode: "not_configured", message: "OpenAI integration not yet implemented" };
  }
}

export const openai = new OpenAIClient();
