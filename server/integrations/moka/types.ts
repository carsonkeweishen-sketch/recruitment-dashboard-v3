// Moka Integration Adapter — Phase 3.1 预留
// Phase 8 启用（数据导入）
// 当前不实现真实调用，仅定义接口边界

export interface MokaConfig {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  webhookSecret?: string;
}

export interface MokaJob {
  externalId: string;
  title: string;
  department: string;
  status: string;
}

export interface MokaCandidate {
  externalId: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
}

export interface MokaApplication {
  externalId: string;
  jobExternalId: string;
  candidateExternalId: string;
  stage: string;
  status: string;
  createdAt: string;
}

// Phase 8 实现
// import { MokaClient } from "./client";
// import { MokaMapper } from "./mapper";
