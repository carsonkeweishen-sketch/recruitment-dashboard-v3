"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// ============================================================================
// Types
// ============================================================================

interface ProviderStatus {
  provider: string;
  status: string;
  mode: string;
  writebackEnabled: boolean;
  configured: boolean;
  displayName: string;
  lastCheckedAt?: string;
  lastSuccessAt?: string;
  errorCode?: string;
  errorMessage?: string;
  maskedKeyPreview?: string;
  secretStorage?: string;
  lastRotatedAt?: string;
}

interface IntegrationSummary {
  total: number;
  connected: number;
  configured: number;
  notConfigured: number;
  error: number;
}

interface IntegrationData {
  providers: ProviderStatus[];
  summary: IntegrationSummary;
}

interface RunLogEntry {
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

interface MappingEntry {
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

type DetailTab = "overview" | "config-health" | "run-logs" | "external-mappings" | "boundary";

// ============================================================================
// Helpers
// ============================================================================

const PROVIDER_ICONS: Record<string, string> = {
  deepseek: "🤖",
  openai_compatible: "🧠",
  feishu: "📄",
  moka: "📋",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
  not_configured: { label: "未配置", variant: "default" },
  configured: { label: "已配置", variant: "info" },
  connected: { label: "已连接", variant: "success" },
  permission_required: { label: "需要授权", variant: "warning" },
  readonly: { label: "只读", variant: "info" },
  error: { label: "错误", variant: "danger" },
  timeout: { label: "超时", variant: "warning" },
};

const MODE_LABELS: Record<string, string> = {
  ai_provider: "AI Provider",
  document_provider: "文档 Provider",
  ats_provider: "ATS Provider",
};

function fmtTime(ts?: string): string {
  if (!ts) return "---";
  return new Date(ts).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtMs(ms: number | null): string {
  if (ms === null || ms === undefined) return "---";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const RUN_TYPE_LABELS: Record<string, string> = {
  test_connection: "连接测试",
  sync: "数据同步",
  fetch: "数据拉取",
  validate: "配置校验",
};

const SYNC_STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
  synced: { label: "已同步", variant: "success" },
  pending: { label: "待同步", variant: "warning" },
  failed: { label: "失败", variant: "danger" },
  unknown: { label: "未知", variant: "default" },
};

// ============================================================================
// Main Page
// ============================================================================

export default function IntegrationsPage() {
  const [data, setData] = useState<IntegrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Detail drawer state
  const [selectedProvider, setSelectedProvider] = useState<ProviderStatus | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [runLogs, setRunLogs] = useState<RunLogEntry[]>([]);
  const [mappings, setMappings] = useState<MappingEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch integration status on mount
  const fetchData = () => {
    setLoading(true);
    setError(null);
    fetch("/api/integrations/status")
      .then((r) => {
        if (r.status === 403) { setPermissionDenied(true); throw new Error("perm"); }
        return r.json();
      })
      .then((d) => {
        if (!d.success) { setError(d.error || "加载失败"); return; }
        setData(d.data);
      })
      .catch((e) => {
        if ((e as Error).message !== "perm") setError("集成中心加载失败");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch logs and mappings when detail drawer opens
  const openDetailDrawer = (provider: ProviderStatus) => {
    setSelectedProvider(provider);
    setDetailTab("overview");
    setDetailLoading(true);

    Promise.all([
      fetch(`/api/integrations/logs?provider=${provider.provider}&limit=20`)
        .then((r) => r.json())
        .then((d) => d.success ? setRunLogs(d.data || []) : setRunLogs([]))
        .catch(() => setRunLogs([])),
      fetch(`/api/integrations/mappings?provider=${provider.provider}`)
        .then((r) => r.json())
        .then((d) => d.success ? setMappings(d.data || []) : setMappings([]))
        .catch(() => setMappings([])),
    ]).finally(() => setDetailLoading(false));
  };

  const closeDetailDrawer = () => {
    setSelectedProvider(null);
    setRunLogs([]);
    setMappings([]);
  };

  // Action: test connection
  const handleTestConnection = (provider: string) => {
    setActionLoading(provider);
    fetch(`/api/integrations/${provider}/test`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          // Refresh data after test
          fetchData();
        }
      })
      .catch(() => {})
      .finally(() => setActionLoading(null));
  };

  // ==========================================================================
  // Permission Denied
  // ==========================================================================
  if (permissionDenied) {
    return (
      <ProductShell title="集成中心" description="暂无权限访问集成中心">
        <EmptyState title="暂无权限" description="暂无权限访问集成中心。如需访问请联系管理员。" />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Error
  // ==========================================================================
  if (error && !data) {
    return (
      <ProductShell title="集成中心" description="统一管理 AI Provider、飞书、Moka 和外部对象映射状态">
        <ErrorState title="加载失败" description={error} onRetry={fetchData} />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Loading
  // ==========================================================================
  if (loading && !data) {
    return (
      <ProductShell title="集成中心" description="统一管理 AI Provider、飞书、Moka 和外部对象映射状态">
        <LoadingSkeleton />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Empty
  // ==========================================================================
  if (!data || data.providers.length === 0) {
    return (
      <ProductShell title="集成中心" description="统一管理 AI Provider、飞书、Moka 和外部对象映射状态">
        <EmptyState title="暂无集成配置" description="当前没有可用的集成提供商。" />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Main Content
  // ==========================================================================
  const { providers, summary } = data;

  // Compute KPI values
  const configuredCount = providers.filter((p) => p.status === "configured" || p.status === "connected").length;
  const notConfiguredCount = providers.filter((p) => p.status === "not_configured").length;
  const errorCount = providers.filter((p) => p.status === "error" || p.status === "timeout").length;

  // Find most recent lastCheckedAt
  const timestamps = providers
    .map((p) => p.lastCheckedAt)
    .filter(Boolean) as string[];
  const mostRecentCheck = timestamps.length > 0
    ? timestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    : null;

  return (
    <ProductShell
      title="集成中心"
      description="统一管理 AI Provider、飞书、Moka 和外部对象映射状态"
      kpiRow={
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <KpiCard label="已配置" value={configuredCount} trendDirection={configuredCount > 0 ? "up" : "flat"} />
          <KpiCard label="未配置" value={notConfiguredCount} trendDirection={notConfiguredCount > 0 ? "down" : "flat"} />
          <KpiCard label="错误" value={errorCount} trendDirection={errorCount > 0 ? "up" : "flat"} />
          <KpiCard label="最近检查" value={mostRecentCheck ? fmtTime(mostRecentCheck) : "---"} />
          <KpiCard label="外部映射数" value={String(mappings.length || summary.total)} />
          <KpiCard label="总提供商" value={summary.total} />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Provider Cards Grid */}
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">集成提供商</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => {
              const statusCfg = STATUS_CONFIG[provider.status] || STATUS_CONFIG.not_configured;
              const icon = PROVIDER_ICONS[provider.provider] || "🔌";
              const modeLabel = MODE_LABELS[provider.mode] || provider.mode;

              return (
                <div
                  key={provider.provider}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openDetailDrawer(provider)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{provider.displayName}</h3>
                        <p className="text-xs text-[var(--color-text-tertiary)]">{provider.provider}</p>
                      </div>
                    </div>
                    <StatusBadge label={statusCfg.label} variant={statusCfg.variant} />
                  </div>

                  {/* Mode & Writeback */}
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge label={modeLabel} variant="info" />
                    {!provider.writebackEnabled && (provider.provider === "feishu" || provider.provider === "moka") && (
                      <StatusBadge label="writebackEnabled=false" variant="warning" />
                    )}
                  </div>

                  {/* Last checked */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      最近检查: {fmtTime(provider.lastCheckedAt)}
                    </span>
                    {provider.lastSuccessAt && (
                      <span className="text-xs text-[var(--color-success)]">· 最后成功: {fmtTime(provider.lastSuccessAt)}</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleTestConnection(provider.provider)}
                      disabled={actionLoading === provider.provider}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] transition-colors disabled:opacity-50"
                    >
                      {actionLoading === provider.provider ? "检查中..." : "检查连接"}
                    </button>
                    <button
                      onClick={() => { openDetailDrawer(provider); setDetailTab("run-logs"); }}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
                    >
                      查看日志
                    </button>
                    <button
                      onClick={() => { openDetailDrawer(provider); setDetailTab("external-mappings"); }}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
                    >
                      查看映射
                    </button>
                  </div>

                  {/* Error message if any */}
                  {provider.errorMessage && (
                    <div className="mt-3 rounded-lg border border-[var(--color-danger-light)] bg-[var(--color-danger-light)]/10 p-2">
                      <p className="text-xs text-[var(--color-danger)]">{provider.errorCode && <span className="font-medium">{provider.errorCode}: </span>}{provider.errorMessage}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ====================================================================
          Integration Detail Drawer
          ==================================================================== */}
      {selectedProvider && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={closeDetailDrawer}
          />

          {/* Drawer Panel */}
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl overflow-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{PROVIDER_ICONS[selectedProvider.provider] || "🔌"}</span>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{selectedProvider.displayName}</h2>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{selectedProvider.provider}</p>
                  </div>
                </div>
                <button
                  onClick={closeDetailDrawer}
                  className="rounded-lg p-2 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Tab bar */}
              <div className="flex items-center gap-1 mt-4 border-b border-[var(--color-border)] -mb-px">
                {[
                  { key: "overview" as DetailTab, label: "概览" },
                  { key: "config-health" as DetailTab, label: "配置健康" },
                  { key: "run-logs" as DetailTab, label: "运行日志" },
                  { key: "external-mappings" as DetailTab, label: "外部映射" },
                  { key: "boundary" as DetailTab, label: "边界" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      detailTab === tab.key
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Content */}
            <div className="px-6 py-4">
              {detailLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  {/* Overview Tab */}
                  {detailTab === "overview" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
                          <div className="text-xs text-[var(--color-text-tertiary)] mb-1">状态</div>
                          <StatusBadge
                            label={STATUS_CONFIG[selectedProvider.status]?.label || selectedProvider.status}
                            variant={STATUS_CONFIG[selectedProvider.status]?.variant || "default"}
                          />
                        </div>
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
                          <div className="text-xs text-[var(--color-text-tertiary)] mb-1">模式</div>
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">
                            {MODE_LABELS[selectedProvider.mode] || selectedProvider.mode}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
                          <div className="text-xs text-[var(--color-text-tertiary)] mb-1">已配置</div>
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">
                            {selectedProvider.configured ? "是" : "否"}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
                          <div className="text-xs text-[var(--color-text-tertiary)] mb-1">写回</div>
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">
                            {selectedProvider.writebackEnabled ? "已启用" : "已禁用"}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-tertiary)]">最近检查</span>
                          <span className="text-[var(--color-text-primary)]">{fmtTime(selectedProvider.lastCheckedAt)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-tertiary)]">最后成功</span>
                          <span className="text-[var(--color-text-primary)]">{fmtTime(selectedProvider.lastSuccessAt)}</span>
                        </div>
                        {selectedProvider.errorCode && (
                          <div className="flex justify-between text-sm">
                            <span className="text-[var(--color-text-tertiary)]">错误码</span>
                            <span className="text-[var(--color-danger)] font-medium">{selectedProvider.errorCode}</span>
                          </div>
                        )}
                        {selectedProvider.errorMessage && (
                          <div className="flex justify-between text-sm">
                            <span className="text-[var(--color-text-tertiary)]">错误信息</span>
                            <span className="text-[var(--color-danger)] text-right max-w-[60%]">{selectedProvider.errorMessage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Config Health Tab */}
                  {detailTab === "config-health" && (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-tertiary)]">配置状态</span>
                          <span className="text-[var(--color-text-primary)] font-medium">
                            {selectedProvider.configured ? "已配置" : "未配置"}
                          </span>
                        </div>
                        {selectedProvider.maskedKeyPreview && (
                          <div className="flex justify-between text-sm">
                            <span className="text-[var(--color-text-tertiary)]">密钥预览</span>
                            <span className="text-[var(--color-text-primary)] font-mono text-xs">
                              {selectedProvider.maskedKeyPreview}
                            </span>
                          </div>
                        )}
                        {selectedProvider.secretStorage && (
                          <div className="flex justify-between text-sm">
                            <span className="text-[var(--color-text-tertiary)]">密钥存储</span>
                            <span className="text-[var(--color-text-primary)] font-mono text-xs">
                              {selectedProvider.secretStorage}
                            </span>
                          </div>
                        )}
                        {selectedProvider.lastRotatedAt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-[var(--color-text-tertiary)]">最后轮换</span>
                            <span className="text-[var(--color-text-primary)]">{fmtTime(selectedProvider.lastRotatedAt)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-tertiary)]">Provider Key</span>
                          <span className="text-[var(--color-text-primary)] font-mono text-xs">{selectedProvider.provider}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-tertiary)]">模式</span>
                          <span className="text-[var(--color-text-primary)]">{MODE_LABELS[selectedProvider.mode] || selectedProvider.mode}</span>
                        </div>
                      </div>

                      {!selectedProvider.configured && (
                        <div className="rounded-lg border border-[var(--color-warning-light)] bg-[var(--color-warning-light)]/10 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusBadge label="提示" variant="warning" />
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            此 Provider 尚未配置。请在环境变量中设置相应的 API Key 或凭证。
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Run Logs Tab */}
                  {detailTab === "run-logs" && (
                    <div>
                      {runLogs.length === 0 ? (
                        <EmptyState title="暂无运行日志" description="该 Provider 暂无运行日志记录。" />
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-[var(--color-border)]">
                                <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">类型</th>
                                <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">状态</th>
                                <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">延迟</th>
                                <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">错误码</th>
                                <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">时间</th>
                              </tr>
                            </thead>
                            <tbody>
                              {runLogs.map((log) => {
                                const logStatusCfg = log.status === "success"
                                  ? { label: "成功", variant: "success" as const }
                                  : log.status === "error"
                                  ? { label: "失败", variant: "danger" as const }
                                  : { label: log.status, variant: "warning" as const };

                                return (
                                  <tr key={log.id} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-tertiary)]">
                                    <td className="py-2 text-[var(--color-text-primary)]">{RUN_TYPE_LABELS[log.runType] || log.runType}</td>
                                    <td className="py-2">
                                      <StatusBadge label={logStatusCfg.label} variant={logStatusCfg.variant} />
                                    </td>
                                    <td className="py-2 text-right text-[var(--color-text-secondary)]">{fmtMs(log.latencyMs)}</td>
                                    <td className="py-2 text-[var(--color-text-secondary)]">{log.errorCode || "---"}</td>
                                    <td className="py-2 text-right text-[var(--color-text-tertiary)] whitespace-nowrap">{fmtTime(log.createdAt)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* External Mappings Tab */}
                  {detailTab === "external-mappings" && (
                    <div>
                      {mappings.length === 0 ? (
                        <EmptyState title="暂无外部映射" description="该 Provider 暂无外部对象映射记录。" />
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-[var(--color-border)]">
                                <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">外部类型</th>
                                <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">外部URL</th>
                                <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">对象类型</th>
                                <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">对象ID</th>
                                <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">同步状态</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mappings.map((m) => {
                                const syncCfg = SYNC_STATUS_CONFIG[m.syncStatus] || SYNC_STATUS_CONFIG.unknown;
                                return (
                                  <tr key={m.id} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-tertiary)]">
                                    <td className="py-2 text-[var(--color-text-primary)]">{m.externalObjectType}</td>
                                    <td className="py-2 text-[var(--color-text-secondary)] max-w-[150px] truncate">
                                      {m.externalUrl ? (
                                        <a href={m.externalUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline truncate block">
                                          {m.externalUrl}
                                        </a>
                                      ) : "---"}
                                    </td>
                                    <td className="py-2 text-[var(--color-text-primary)]">{m.objectType}</td>
                                    <td className="py-2 text-[var(--color-text-secondary)]">{m.objectId || "---"}</td>
                                    <td className="py-2">
                                      <StatusBadge label={syncCfg.label} variant={syncCfg.variant} />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Boundary Tab */}
                  {detailTab === "boundary" && (
                    <div className="space-y-4">
                      <div className="rounded-lg border-2 border-[var(--color-warning-light)] bg-[var(--color-warning-light)]/10 p-5">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl shrink-0">🚧</span>
                          <div>
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">系统边界说明</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                              本系统只做分析和风险提示，不写回外部系统。writebackEnabled=false
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">当前 Provider 边界</h4>

                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-tertiary)]">Provider</span>
                          <span className="text-[var(--color-text-primary)]">{selectedProvider.displayName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-tertiary)]">模式</span>
                          <span className="text-[var(--color-text-primary)]">{MODE_LABELS[selectedProvider.mode] || selectedProvider.mode}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-tertiary)]">写回</span>
                          <span className="text-[var(--color-danger)] font-medium">已禁用</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-tertiary)]">数据方向</span>
                          <span className="text-[var(--color-text-primary)]">只读（从外部读取，不写回）</span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">职责范围</h4>
                        <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--color-success)] mt-0.5">✓</span>
                            <span>读取外部系统数据用于招聘分析和风险识别</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--color-success)] mt-0.5">✓</span>
                            <span>基于分析结果生成风险提示和行动建议</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--color-success)] mt-0.5">✓</span>
                            <span>管理外部对象映射关系（链接/关联）</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--color-danger)] mt-0.5">✗</span>
                            <span>不回写候选人状态到外部 ATS 系统</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--color-danger)] mt-0.5">✗</span>
                            <span>不修改飞书文档内容</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--color-danger)] mt-0.5">✗</span>
                            <span>不创建/修改外部系统的面试或评价记录</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </ProductShell>
  );
}
