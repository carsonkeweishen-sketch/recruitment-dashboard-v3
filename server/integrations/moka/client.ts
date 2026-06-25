// Moka Client — Phase 3.1.1 占位
// Phase 8 实现真实调用

import type { MokaConfig, MokaJob, MokaCandidate, MokaApplication } from "./types";
import type { ClientResult } from "@/server/integrations/openai/client";

export class MokaClient {
  private config: MokaConfig | null = null;

  constructor() {
    const apiBaseUrl = process.env.MOKA_API_BASE_URL;
    const clientId = process.env.MOKA_CLIENT_ID;
    const clientSecret = process.env.MOKA_CLIENT_SECRET;
    if (apiBaseUrl && clientId && clientSecret) {
      this.config = { apiBaseUrl, clientId, clientSecret };
    }
  }

  get status(): "not_configured" | "ready" {
    return this.config ? "ready" : "not_configured";
  }

  async fetchJobs(): Promise<ClientResult<MokaJob[]>> {
    if (!this.config) return { ok: false, errorCode: "not_configured", message: "Moka not configured" };
    return { ok: false, errorCode: "not_configured", message: "Moka integration not yet implemented" };
  }

  async fetchCandidates(_jobId: string): Promise<ClientResult<MokaCandidate[]>> {
    if (!this.config) return { ok: false, errorCode: "not_configured", message: "Moka not configured" };
    return { ok: false, errorCode: "not_configured", message: "Moka integration not yet implemented" };
  }

  async fetchApplications(_jobId: string): Promise<ClientResult<MokaApplication[]>> {
    if (!this.config) return { ok: false, errorCode: "not_configured", message: "Moka not configured" };
    return { ok: false, errorCode: "not_configured", message: "Moka integration not yet implemented" };
  }
}

export const moka = new MokaClient();
