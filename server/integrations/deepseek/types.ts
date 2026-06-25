// DeepSeek Integration Adapter — Phase 3.1 预留
// Phase 10 启用

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

// 复用 OpenAI 兼容接口类型
export type { ChatMessage, ChatCompletionRequest, ChatCompletionResponse } from "@/server/integrations/openai/types";

// Phase 10 实现
// import { DeepSeekClient } from "./client";
// export const deepseek = new DeepSeekClient(config);
