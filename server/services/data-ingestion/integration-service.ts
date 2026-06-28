// Phase 8.9: Integration Center — Prisma-backed Service
import type {
  IntegrationProvider,
  IntegrationStatus,
  IntegrationStatusType,
  IntegrationMode,
  IntegrationAdapter,
} from "@/server/services/data-ingestion/integration-adapter";
import {
  getAllConnections,
  getConnectionByProvider,
  upsertConnection,
  createRunLog,
  getRunLogs as repoGetRunLogs,
  getCredentialMeta,
  upsertCredentialMeta,
  getMappings as repoGetMappings,
  createMapping,
} from "@/server/services/data-ingestion/integration-repository";

// ── Types ───────────────────────────────────────────────────────

export interface RunLogEntry {
  id: string;
  provider: string;
  runType: string;
  status: string;
  latencyMs: number | null;
  requestId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdById: string | null;
  createdAt: string;
}

export interface MappingEntry {
  id: string;
  provider: string;
  externalObjectType: string;
  externalId: string | null;
  externalUrl: string | null;
  objectType: string;
  objectId: string | null;
  syncStatus: string;
  lastSyncedAt: string | null;
  createdById: string | null;
  createdAt: string;
}

export interface IntegrationSummary {
  total: number;
  connected: number;
  configured: number;
  notConfigured: number;
  error: number;
}

// ── Provider Display Names ──────────────────────────────────────

const DISPLAY_NAMES: Record<IntegrationProvider, string> = {
  deepseek: "DeepSeek AI",
  openai_compatible: "OpenAI Compatible",
  feishu: "飞书",
  moka: "Moka",
};

const PROVIDER_MODES: Record<IntegrationProvider, IntegrationMode> = {
  deepseek: "ai_provider",
  openai_compatible: "ai_provider",
  feishu: "document_provider",
  moka: "ats_provider",
};

// ── Provider Adapters ───────────────────────────────────────────

const DeepSeekAdapter: IntegrationAdapter = {
  async getStatus(): Promise<IntegrationStatus> {
    const hasKey = !!process.env.DEEPSEEK_API_KEY;
    return {
      provider: "deepseek",
      status: hasKey ? "connected" : "not_configured",
      mode: "ai_provider",
      writebackEnabled: false,
      configured: hasKey,
      displayName: DISPLAY_NAMES.deepseek,
    };
  },
  async testConnection(): Promise<IntegrationStatus> {
    const hasKey = !!process.env.DEEPSEEK_API_KEY;
    return {
      provider: "deepseek",
      status: hasKey ? "connected" : "not_configured",
      mode: "ai_provider",
      writebackEnabled: false,
      configured: hasKey,
      displayName: DISPLAY_NAMES.deepseek,
    };
  },
  async validateConfig(): Promise<IntegrationStatus> {
    const hasKey = !!process.env.DEEPSEEK_API_KEY;
    return {
      provider: "deepseek",
      status: hasKey ? "connected" : "not_configured",
      mode: "ai_provider",
      writebackEnabled: false,
      configured: hasKey,
      displayName: DISPLAY_NAMES.deepseek,
    };
  },
};

const OpenAICompatibleAdapter: IntegrationAdapter = {
  async getStatus(): Promise<IntegrationStatus> {
    const hasKey = !!process.env.OPENAI_API_KEY;
    return {
      provider: "openai_compatible",
      status: hasKey ? "connected" : "not_configured",
      mode: "ai_provider",
      writebackEnabled: false,
      configured: hasKey,
      displayName: DISPLAY_NAMES.openai_compatible,
    };
  },
  async testConnection(): Promise<IntegrationStatus> {
    const hasKey = !!process.env.OPENAI_API_KEY;
    return {
      provider: "openai_compatible",
      status: hasKey ? "connected" : "not_configured",
      mode: "ai_provider",
      writebackEnabled: false,
      configured: hasKey,
      displayName: DISPLAY_NAMES.openai_compatible,
    };
  },
  async validateConfig(): Promise<IntegrationStatus> {
    const hasKey = !!process.env.OPENAI_API_KEY;
    return {
      provider: "openai_compatible",
      status: hasKey ? "connected" : "not_configured",
      mode: "ai_provider",
      writebackEnabled: false,
      configured: hasKey,
      displayName: DISPLAY_NAMES.openai_compatible,
    };
  },
};

const FeishuAdapter: IntegrationAdapter = {
  async getStatus(): Promise<IntegrationStatus> {
    return {
      provider: "feishu",
      status: "not_configured",
      mode: "document_provider",
      writebackEnabled: false,
      configured: false,
      displayName: DISPLAY_NAMES.feishu,
    };
  },
  async testConnection(): Promise<IntegrationStatus> {
    return {
      provider: "feishu",
      status: "not_configured",
      mode: "document_provider",
      writebackEnabled: false,
      configured: false,
      displayName: DISPLAY_NAMES.feishu,
    };
  },
  async validateConfig(): Promise<IntegrationStatus> {
    return {
      provider: "feishu",
      status: "not_configured",
      mode: "document_provider",
      writebackEnabled: false,
      configured: false,
      displayName: DISPLAY_NAMES.feishu,
    };
  },
};

const MokaAdapter: IntegrationAdapter = {
  async getStatus(): Promise<IntegrationStatus> {
    return {
      provider: "moka",
      status: "not_configured",
      mode: "ats_provider",
      writebackEnabled: false,
      configured: false,
      displayName: DISPLAY_NAMES.moka,
    };
  },
  async testConnection(): Promise<IntegrationStatus> {
    return {
      provider: "moka",
      status: "not_configured",
      mode: "ats_provider",
      writebackEnabled: false,
      configured: false,
      displayName: DISPLAY_NAMES.moka,
    };
  },
  async validateConfig(): Promise<IntegrationStatus> {
    return {
      provider: "moka",
      status: "not_configured",
      mode: "ats_provider",
      writebackEnabled: false,
      configured: false,
      displayName: DISPLAY_NAMES.moka,
    };
  },
};

const ADAPTERS: Record<IntegrationProvider, IntegrationAdapter> = {
  deepseek: DeepSeekAdapter,
  openai_compatible: OpenAICompatibleAdapter,
  feishu: FeishuAdapter,
  moka: MokaAdapter,
};

const ALL_PROVIDERS: IntegrationProvider[] = ["deepseek", "openai_compatible", "feishu", "moka"];

// ── Helpers ─────────────────────────────────────────────────────

function isIntegrationProvider(value: string): value is IntegrationProvider {
  return ALL_PROVIDERS.includes(value as IntegrationProvider);
}

async function syncStatusToDb(status: IntegrationStatus): Promise<void> {
  await upsertConnection(status.provider, {
    status: status.status,
    displayName: status.displayName,
    mode: status.mode,
    isWritebackEnabled: false,
    lastCheckedAt: status.lastCheckedAt ? new Date(status.lastCheckedAt) : undefined,
    lastSuccessAt: status.lastSuccessAt ? new Date(status.lastSuccessAt) : undefined,
    lastErrorCode: status.errorCode ?? null,
    lastErrorMessage: status.errorMessage ?? null,
  });
}

async function buildStatusFromDb(provider: IntegrationProvider): Promise<IntegrationStatus> {
  const conn = await getConnectionByProvider(provider);
  if (conn) {
    return {
      provider: provider,
      status: conn.status as IntegrationStatusType,
      mode: (conn.mode as IntegrationMode) ?? PROVIDER_MODES[provider],
      writebackEnabled: false,
      lastCheckedAt: conn.lastCheckedAt?.toISOString(),
      lastSuccessAt: conn.lastSuccessAt?.toISOString(),
      errorCode: conn.lastErrorCode ?? undefined,
      errorMessage: conn.lastErrorMessage ?? undefined,
      configured: conn.status !== "not_configured",
      displayName: conn.displayName ?? DISPLAY_NAMES[provider],
    };
  }

  // No DB record — create a default not_configured entry
  const fallback: IntegrationStatus = {
    provider,
    status: "not_configured",
    mode: PROVIDER_MODES[provider],
    writebackEnabled: false,
    configured: false,
    displayName: DISPLAY_NAMES[provider],
  };
  await syncStatusToDb(fallback);
  return fallback;
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Get status for all integration providers with a summary.
 */
export async function getIntegrationsStatus(): Promise<{
  providers: IntegrationStatus[];
  summary: IntegrationSummary;
}> {
  const providers: IntegrationStatus[] = [];
  let connected = 0;
  let configured = 0;
  let notConfigured = 0;
  let error = 0;

  for (const provider of ALL_PROVIDERS) {
    const status = await getProviderStatus(provider);
    providers.push(status);

    switch (status.status) {
      case "connected":
        connected++;
        configured++;
        break;
      case "configured":
        configured++;
        break;
      case "not_configured":
        notConfigured++;
        break;
      case "error":
      case "timeout":
        error++;
        break;
      default:
        break;
    }
  }

  return {
    providers,
    summary: {
      total: ALL_PROVIDERS.length,
      connected,
      configured,
      notConfigured,
      error,
    },
  };
}

/**
 * Get status for a single provider. Reads from DB first,
 * falls back to creating a default not_configured record.
 */
export async function getProviderStatus(provider: string): Promise<IntegrationStatus> {
  if (!isIntegrationProvider(provider)) {
    return {
      provider: provider as IntegrationProvider,
      status: "not_configured",
      mode: "ai_provider",
      writebackEnabled: false,
      configured: false,
      displayName: provider,
    };
  }

  const adapter = ADAPTERS[provider];
  const liveStatus = await adapter.getStatus();

  // Read persisted state from DB
  const conn = await getConnectionByProvider(provider);
  if (conn) {
    return {
      provider,
      status: conn.status as IntegrationStatusType,
      mode: (conn.mode as IntegrationMode) ?? PROVIDER_MODES[provider],
      writebackEnabled: false,
      lastCheckedAt: conn.lastCheckedAt?.toISOString(),
      lastSuccessAt: conn.lastSuccessAt?.toISOString(),
      errorCode: conn.lastErrorCode ?? undefined,
      errorMessage: conn.lastErrorMessage ?? undefined,
      configured: conn.status !== "not_configured",
      displayName: conn.displayName ?? DISPLAY_NAMES[provider],
    };
  }

  // No DB record — create one from the live adapter result
  await syncStatusToDb(liveStatus);
  return liveStatus;
}

/**
 * Test a provider connection. Writes a run log entry and updates
 * the connection status in the DB.
 */
export async function testProviderConnection(
  provider: string,
  userId?: string,
): Promise<IntegrationStatus> {
  if (!isIntegrationProvider(provider)) {
    const unknownStatus: IntegrationStatus = {
      provider: provider as IntegrationProvider,
      status: "not_configured",
      mode: "ai_provider",
      writebackEnabled: false,
      configured: false,
      displayName: provider,
    };
    await createRunLog({
      provider,
      runType: "test_connection",
      status: "error",
      errorCode: "UNKNOWN_PROVIDER",
      errorMessage: `Unknown provider: ${provider}`,
      createdById: userId,
    });
    return unknownStatus;
  }

  const adapter = ADAPTERS[provider];
  const start = Date.now();
  let result: IntegrationStatus;

  try {
    result = await adapter.testConnection();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    result = {
      provider,
      status: "error",
      mode: PROVIDER_MODES[provider],
      writebackEnabled: false,
      configured: false,
      displayName: DISPLAY_NAMES[provider],
      errorCode: "TEST_FAILED",
      errorMessage: message,
    };
  }

  const latencyMs = Date.now() - start;

  // Write run log (CRITICAL)
  await createRunLog({
    provider,
    runType: "test_connection",
    status: result.status === "connected" ? "success" : result.status === "error" ? "error" : "warning",
    latencyMs,
    errorCode: result.errorCode,
    errorMessage: result.errorMessage,
    createdById: userId,
  });

  // Update connection record in DB
  await upsertConnection(provider, {
    status: result.status,
    displayName: DISPLAY_NAMES[provider],
    mode: PROVIDER_MODES[provider],
    lastCheckedAt: new Date(),
    lastSuccessAt: result.status === "connected" ? new Date() : undefined,
    lastErrorCode: result.errorCode ?? null,
    lastErrorMessage: result.errorMessage ?? null,
  });

  return result;
}

/**
 * Validate a provider's configuration without making external calls.
 */
export async function validateProviderConfig(provider: string): Promise<IntegrationStatus> {
  if (!isIntegrationProvider(provider)) {
    return {
      provider: provider as IntegrationProvider,
      status: "not_configured",
      mode: "ai_provider",
      writebackEnabled: false,
      configured: false,
      displayName: provider,
    };
  }

  const adapter = ADAPTERS[provider];
  const result = await adapter.validateConfig();

  await upsertConnection(provider, {
    status: result.status,
    displayName: DISPLAY_NAMES[provider],
    mode: PROVIDER_MODES[provider],
    lastErrorCode: result.errorCode ?? null,
    lastErrorMessage: result.errorMessage ?? null,
  });

  return result;
}

/**
 * Retrieve integration run logs with optional filters.
 */
export async function getRunLogs(filters?: {
  provider?: string;
  limit?: number;
}): Promise<RunLogEntry[]> {
  const logs = await repoGetRunLogs({
    provider: filters?.provider,
    limit: filters?.limit,
  });

  return logs.map((log) => ({
    id: log.id,
    provider: log.provider,
    runType: log.runType,
    status: log.status,
    latencyMs: log.latencyMs,
    requestId: log.requestId,
    errorCode: log.errorCode,
    errorMessage: log.errorMessage,
    createdById: log.createdById,
    createdAt: log.createdAt.toISOString(),
  }));
}

/**
 * Retrieve external object mappings with optional filters.
 */
export async function getMappings(filters?: {
  provider?: string;
  objectType?: string;
}): Promise<MappingEntry[]> {
  const mappings = await repoGetMappings({
    provider: filters?.provider,
    objectType: filters?.objectType,
  });

  return mappings.map((m) => ({
    id: m.id,
    provider: m.provider,
    externalObjectType: m.externalObjectType,
    externalId: m.externalId,
    externalUrl: m.externalUrl,
    objectType: m.objectType,
    objectId: m.objectId,
    syncStatus: m.syncStatus,
    lastSyncedAt: m.lastSyncedAt?.toISOString() ?? null,
    createdById: m.createdById,
    createdAt: m.createdAt.toISOString(),
  }));
}

/**
 * Attempt a feishu fetch. Always returns not_configured because no
 * actual feishu API integration is implemented yet.
 */
export async function attemptFeishuFetch(): Promise<{ status: string; message: string }> {
  const feishuAppId = process.env.FEISHU_APP_ID;
  const feishuAppSecret = process.env.FEISHU_APP_SECRET;

  if (!feishuAppId || !feishuAppSecret) {
    return { status: "not_configured", message: "飞书应用凭证未配置。请在环境变量中设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET。" };
  }

  return { status: "permission_required", message: "飞书 API 集成尚未实现。当前仅支持链接保存和关联对象。" };
}

/**
 * Attempt a moka sync. Always returns not_configured because no
 * actual moka API integration is implemented yet.
 */
export async function attemptMokaSync(): Promise<{ status: string; message: string }> {
  const mokaApiBaseUrl = process.env.MOKA_API_BASE_URL;
  const mokaClientId = process.env.MOKA_CLIENT_ID;
  const mokaClientSecret = process.env.MOKA_CLIENT_SECRET;

  if (!mokaApiBaseUrl || !mokaClientId || !mokaClientSecret) {
    return { status: "not_configured", message: "Moka API 凭证未配置。请在环境变量中设置 MOKA_API_BASE_URL、MOKA_CLIENT_ID 和 MOKA_CLIENT_SECRET。" };
  }

  return { status: "permission_required", message: "Moka API 集成尚未实现。本系统不写回 Moka，仅可读取岗位、候选人和投递状态用于分析。" };
}

// Re-export repository functions for direct access (raw DB queries)
export { createMapping } from "@/server/services/data-ingestion/integration-repository";
