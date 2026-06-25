// OpenAI Integration Adapter — Phase 3.1 预留
// 当前不实现真实调用，仅定义接口边界
// Phase 10 启用

export interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  content: string;
  finishReason: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

// Phase 10 实现
// import { OpenAIClient } from "./client";
// export const openai = new OpenAIClient(config);
