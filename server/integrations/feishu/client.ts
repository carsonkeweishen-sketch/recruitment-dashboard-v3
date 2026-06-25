// Feishu Client — Phase 3.1.1 占位
// Phase 7+ 实现真实调用

import type { FeishuConfig, FeishuMessage } from "./types";
import type { ClientResult } from "@/server/integrations/openai/client";

export class FeishuClient {
  private config: FeishuConfig | null = null;

  constructor() {
    const appId = process.env.FEISHU_APP_ID;
    const appSecret = process.env.FEISHU_APP_SECRET;
    if (appId && appSecret) {
      this.config = { appId, appSecret };
    }
  }

  get status(): "not_configured" | "ready" {
    return this.config ? "ready" : "not_configured";
  }

  async sendMessage(_msg: FeishuMessage): Promise<ClientResult<void>> {
    if (!this.config) return { ok: false, errorCode: "not_configured", message: "Feishu not configured" };
    return { ok: false, errorCode: "not_configured", message: "Feishu integration not yet implemented" };
  }
}

export const feishu = new FeishuClient();
