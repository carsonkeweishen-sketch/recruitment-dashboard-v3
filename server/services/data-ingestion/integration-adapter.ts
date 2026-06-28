// Phase 8.9: Integration Center — Adapter Contract

export type IntegrationProvider = 'deepseek' | 'openai_compatible' | 'feishu' | 'moka';

export type IntegrationStatusType =
  | 'not_configured'
  | 'configured'
  | 'connected'
  | 'permission_required'
  | 'readonly'
  | 'error'
  | 'timeout';

export type IntegrationMode = 'ai_provider' | 'document_provider' | 'ats_provider';

export interface IntegrationStatus {
  provider: IntegrationProvider;
  status: IntegrationStatusType;
  mode: IntegrationMode;
  writebackEnabled: false;
  lastCheckedAt?: string;
  lastSuccessAt?: string;
  errorCode?: string;
  errorMessage?: string;
  maskedKeyPreview?: string;
  configured: boolean;
  displayName: string;
}

export interface IntegrationAdapter {
  getStatus(): Promise<IntegrationStatus>;
  testConnection(): Promise<IntegrationStatus>;
  validateConfig(): Promise<IntegrationStatus>;
}

export interface ReadonlyExternalAdapter extends IntegrationAdapter {
  fetchMetadata(externalId: string): Promise<{ status: IntegrationStatus; metadata?: unknown }>;
}
