// Feishu (飞书) Integration Adapter — Phase 3.1 预留
// Phase 7+ 启用（Action 通知、周报推送）
// 当前不实现真实调用，仅定义接口边界

export interface FeishuConfig {
  appId: string;
  appSecret: string;
  webhookSecret?: string;
}

export interface FeishuMessage {
  title: string;
  content: string;
  receivers: string[];
  msgType?: "text" | "interactive" | "post";
}

// Phase 7+ 实现
// import { FeishuClient } from "./client";
