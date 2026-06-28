"use client";

import { useEffect, useState, useCallback } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getStatusDisplay, MODE_LABELS, PROVIDER_GROUPS, getProviderGroup, getProviderGroupLabel, SECURITY_HINT } from "@/server/services/data-ingestion/integration-status-mapper";
import { formatRunLogs, type RawLogEntry, type FormattedLogEntry } from "@/server/services/data-ingestion/run-log-formatter";

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
  adapterType?: string;
  maturityLevel?: string;
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

interface MappingEntry {
  id: string;
  provider: string;
  externalObjectType: string;
  externalId: string | null;
  externalUrl: string | null;
  externalName?: string;
  objectType: string;
  objectId: string | null;
  syncStatus: string;
  lastSyncedAt: string | null;
  createdById: string | null;
  createdAt: string;
  authorized?: boolean;
}

type DetailTab = "overview" | "config" | "run-logs" | "external-mappings" | "technical";

// ============================================================================
// Group Icons (emoji only — no brand logos)
// ============================================================================

const GROUP_ICONS: Record<string, string> = {
  ai_providers: "🤖",
  recruitment_systems: "🔗",
  collaboration_tools: "📄",
};

const PROVIDER_ICONS: Record<string, string> = {
  deepseek: "🤖",
  openai_compatible: "🤖",
  moka: "🔗",
  feishu: "📄",
};

// ============================================================================
// Helpers
// ============================================================================

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

function maskKey(keyPreview?: string): string {
  if (!keyPreview) return "已配置 · 密钥已隐藏";
  if (keyPreview.length <= 8) return keyPreview;
  const prefix = keyPreview.slice(0, 3);
  const suffix = keyPreview.slice(-4);
  return `${prefix}-••••${suffix}`;
}

const SEVERITY_BADGE_VARIANT: Record<string, "success" | "warning" | "danger" | "info"> = {
  ok: "success",
  warning: "warning",
  error: "danger",
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
  const [runLogs, setRunLogs] = useState<FormattedLogEntry[]>([]);
  const [mappings, setMappings] = useState<MappingEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch integration status on mount
  const fetchData = useCallback(() => {
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
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch logs and mappings when detail drawer opens
  const openDetailDrawer = useCallback((provider: ProviderStatus) => {
    setSelectedProvider(provider);
    setDetailTab("overview");
    setDetailLoading(true);

    Promise.all([
      fetch(`/api/integrations/logs?provider=${provider.provider}&limit=20`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data?.length > 0) {
            setRunLogs(formatRunLogs(d.data as RawLogEntry[]));
          } else {
            setRunLogs([]);
          }
        })
        .catch(() => setRunLogs([])),
      fetch(`/api/integrations/mappings?provider=${provider.provider}`)
        .then((r) => r.json())
        .then((d) => d.success ? setMappings(d.data || []) : setMappings([]))
        .catch(() => setMappings([])),
    ]).finally(() => setDetailLoading(false));
  }, []);

  const closeDetailDrawer = useCallback(() => {
    setSelectedProvider(null);
    setRunLogs([]);
    setMappings([]);
  }, []);

  // Action: test connection
  const handleTestConnection = useCallback((provider: string) => {
    setActionLoading(provider);
    fetch(`/api/integrations/${provider}/test`, { method: "POST" })
      .then((r) => r.json())
      .then(() => fetchData())
      .catch(() => {})
      .finally(() => setActionLoading(null));
  }, [fetchData]);

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
      <ProductShell title="集成中心" description="统一管理 AI Provider、飞书、Moka 的连接状态与边界">
        <ErrorState title="加载失败" description={error} onRetry={fetchData} />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Loading
  // ==========================================================================
  if (loading && !data) {
    return (
      <ProductShell title="集成中心" description="统一管理 AI Provider、飞书、Moka 的连接状态与边界">
        <LoadingSkeleton />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Empty
  // ==========================================================================
  if (!data || data.providers.length === 0) {
    return (
      <ProductShell title="集成中心" description="统一管理 AI Provider、飞书、Moka 的连接状态与边界">
        <EmptyState title="暂无集成配置" description="当前没有可用的集成提供商。" />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Main Content
  // ==========================================================================
  const { providers, summary } = data;

  const configuredCount = providers.filter((p) => p.status === "configured" || p.status === "connected").length;
  const notConfiguredCount = providers.filter((p) => p.status === "not_configured").length;
  const errorCount = providers.filter((p) => p.status === "error" || p.status === "timeout").length;

  const timestamps = providers.map((p) => p.lastCheckedAt).filter(Boolean) as string[];
  const mostRecentCheck = timestamps.length > 0
    ? timestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    : null;

  // Group providers by PROVIDER_GROUPS
  const groupEntries = Object.entries(PROVIDER_GROUPS).map(([groupKey, group]) => {
    const groupProviders = providers.filter((p) => group.providers.includes(p.provider));
    return { groupKey, label: group.label, icon: GROUP_ICONS[groupKey] || "📦", providers: groupProviders };
  }).filter((g) => g.providers.length > 0);

  return (
    <ProductShell
      title="集成中心"
      description="统一管理 AI Provider、飞书、Moka 的连接状态与边界"
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
      <div className="space-y-8">
        {/* P1-6: Security Hint Banner */}
        <div className="rounded-xl border border-[var(--color-info-light)] bg-[var(--color-info-light)]/20 px-4 py-3 flex items-start gap-3">
          <span className="text-lg shrink-0 mt-0.5">🔒</span>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {SECURITY_HINT}
          </p>
        </div>

        {/* Provider Group Sections */}
        {groupEntries.map((group) => (
          <div key={group.groupKey}>
            {/* P1-1: Group Section Header */}
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--color-border-light)]">
              <span className="text-lg">{group.icon}</span>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{group.label}</h2>
              <span className="text-xs text-[var(--color-text-tertiary)] ml-auto">
                {group.providers.length} 个提供商
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.providers.map((provider) => (
                <ProviderCard
                  key={provider.provider}
                  provider={provider}
                  actionLoading={actionLoading}
                  onOpenDetail={(p) => { openDetailDrawer(p); }}
                  onOpenLogs={(p) => { openDetailDrawer(p); setDetailTab("run-logs"); }}
                  onOpenMappings={(p) => { openDetailDrawer(p); setDetailTab("external-mappings"); }}
                  onTestConnection={handleTestConnection}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ====================================================================
          Detail Drawer
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
                    <p className="text-xs text-[var(--color-text-tertiary)]">{getProviderGroupLabel(selectedProvider.provider)}</p>
                  </div>
                </div>
                <button
                  onClick={closeDetailDrawer}
                  className="rounded-lg p-2 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                  aria-label="关闭"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Tab bar */}
              <div className="flex items-center gap-1 mt-4 border-b border-[var(--color-border)] -mb-px overflow-x-auto">
                {[
                  { key: "overview" as DetailTab, label: "概览" },
                  { key: "config" as DetailTab, label: "配置详情" },
                  { key: "run-logs" as DetailTab, label: "运行日志" },
                  { key: "external-mappings" as DetailTab, label: "外部映射" },
                  { key: "technical" as DetailTab, label: "技术说明" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    className={`shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
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
                  {/* Tab: 概览 */}
                  {detailTab === "overview" && (
                    <DrawerOverviewTab provider={selectedProvider} />
                  )}

                  {/* Tab: 配置详情 */}
                  {detailTab === "config" && (
                    <DrawerConfigTab provider={selectedProvider} />
                  )}

                  {/* Tab: 运行日志 */}
                  {detailTab === "run-logs" && (
                    <DrawerRunLogsTab logs={runLogs} provider={selectedProvider} />
                  )}

                  {/* Tab: 外部映射 */}
                  {detailTab === "external-mappings" && (
                    <DrawerMappingsTab mappings={mappings} provider={selectedProvider} />
                  )}

                  {/* Tab: 技术说明 */}
                  {detailTab === "technical" && (
                    <DrawerTechnicalTab provider={selectedProvider} />
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

// ============================================================================
// ProviderCard Component
// ============================================================================

interface ProviderCardProps {
  provider: ProviderStatus;
  actionLoading: string | null;
  onOpenDetail: (p: ProviderStatus) => void;
  onOpenLogs: (p: ProviderStatus) => void;
  onOpenMappings: (p: ProviderStatus) => void;
  onTestConnection: (provider: string) => void;
}

function ProviderCard({
  provider,
  actionLoading,
  onOpenDetail,
  onOpenLogs,
  onOpenMappings,
  onTestConnection,
}: ProviderCardProps) {
  const statusDisplay = getStatusDisplay(provider.status);
  const icon = PROVIDER_ICONS[provider.provider] || "🔌";
  const modeLabel = MODE_LABELS[provider.mode] || provider.mode;
  const isWritebackDisabled = !provider.writebackEnabled && (provider.provider === "feishu" || provider.provider === "moka");

  return (
    <div
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onOpenDetail(provider)}
    >
      {/* Header: icon + name + status badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{provider.displayName}</h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">{getProviderGroupLabel(provider.provider)}</p>
          </div>
        </div>
        {/* P0-1: Status badge with correct color from mapper */}
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0"
          style={{ backgroundColor: statusDisplay.bgColor, color: statusDisplay.color }}
        >
          <span>{statusDisplay.icon}</span>
          <span>{statusDisplay.shortLabel}</span>
        </span>
      </div>

      {/* P0-2: Mode in human Chinese + writeback badge */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="inline-flex items-center rounded-md bg-[var(--color-primary-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
          {modeLabel}
        </span>
        {isWritebackDisabled && (
          <span className="inline-flex items-center rounded-md bg-[var(--color-info-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-info)]">
            不写回外部系统
          </span>
        )}
      </div>

      {/* P0-4: AI Copilot config link */}
      {provider.provider === "deepseek" && provider.status === "not_configured" && (
        <div className="mb-3">
          <a
            href="/integrations?provider=deepseek"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
          >
            <span>前往配置 AI Provider</span>
            <span>→</span>
          </a>
        </div>
      )}

      {/* Last checked timestamp */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-[var(--color-text-tertiary)]">
          最近检查: {fmtTime(provider.lastCheckedAt)}
        </span>
        {provider.lastSuccessAt && (
          <span className="text-xs text-[var(--color-success)]">
            · 最后成功: {fmtTime(provider.lastSuccessAt)}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onTestConnection(provider.provider)}
          disabled={actionLoading === provider.provider}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] transition-colors disabled:opacity-50"
        >
          {actionLoading === provider.provider ? "检查中..." : "检查连接"}
        </button>
        <button
          onClick={() => onOpenLogs(provider)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
        >
          查看日志
        </button>
        <button
          onClick={() => onOpenDetail(provider)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
        >
          查看详情
        </button>
      </div>

      {/* P1-5: Error/Timeout states — human readable, no stack traces */}
      {provider.status === "error" && (
        <div className="mt-3 rounded-lg border border-[var(--color-danger-light)] bg-[var(--color-danger-light)]/10 p-2">
          <p className="text-xs text-[var(--color-danger)]">
            连接异常，请检查凭据或稍后重试
          </p>
        </div>
      )}
      {provider.status === "timeout" && (
        <div className="mt-3 rounded-lg border border-[var(--color-warning-light)] bg-[var(--color-warning-light)]/10 p-2">
          <p className="text-xs text-[var(--color-warning)]">
            连接超时 · 稍后重试
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Drawer Tab: 概览
// ============================================================================

function DrawerOverviewTab({ provider }: { provider: ProviderStatus }) {
  const statusDisplay = getStatusDisplay(provider.status);
  const modeLabel = MODE_LABELS[provider.mode] || provider.mode;

  return (
    <div className="space-y-4">
      {/* Status overview grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
          <div className="text-xs text-[var(--color-text-tertiary)] mb-1">状态</div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: statusDisplay.color }}>{statusDisplay.icon}</span>
            <span className="text-sm font-medium" style={{ color: statusDisplay.color }}>
              {statusDisplay.shortLabel}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">{statusDisplay.helpText}</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
          <div className="text-xs text-[var(--color-text-tertiary)] mb-1">模式</div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{modeLabel}</div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
          <div className="text-xs text-[var(--color-text-tertiary)] mb-1">已配置</div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">
            {provider.configured ? "是" : "否"}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
          <div className="text-xs text-[var(--color-text-tertiary)] mb-1">写回</div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">
            {provider.writebackEnabled ? "已启用" : "已禁用"}
          </div>
        </div>
      </div>

      {/* Timeline info */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-tertiary)]">最近检查</span>
          <span className="text-[var(--color-text-primary)]">{fmtTime(provider.lastCheckedAt)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-tertiary)]">最后成功</span>
          <span className="text-[var(--color-text-primary)]">{fmtTime(provider.lastSuccessAt)}</span>
        </div>
      </div>

      {/* P1-5: Error info — human readable */}
      {(provider.status === "error" || provider.status === "timeout") && (
        <div className="rounded-lg border border-[var(--color-danger-light)] bg-[var(--color-danger-light)]/10 p-4">
          <h4 className="text-sm font-medium text-[var(--color-danger)] mb-1">
            {provider.status === "error" ? "连接异常" : "连接超时"}
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {provider.status === "error"
              ? "连接异常，请检查凭据或稍后重试"
              : "连接超时 · 稍后重试"}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Drawer Tab: 配置详情
// ============================================================================

function DrawerConfigTab({ provider }: { provider: ProviderStatus }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-tertiary)]">配置状态</span>
          <span className="text-[var(--color-text-primary)] font-medium">
            {provider.configured ? "已配置" : "未配置"}
          </span>
        </div>

        {/* P1-2: Masked key preview */}
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-tertiary)]">密钥</span>
          <span className="text-[var(--color-text-primary)] font-mono text-xs">
            {maskKey(provider.maskedKeyPreview)}
          </span>
        </div>

        {provider.secretStorage && (
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-tertiary)]">存储方式</span>
            <span className="text-[var(--color-text-primary)] font-mono text-xs">
              {provider.secretStorage}
            </span>
          </div>
        )}

        {provider.lastRotatedAt && (
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-tertiary)]">最后轮换</span>
            <span className="text-[var(--color-text-primary)]">{fmtTime(provider.lastRotatedAt)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-tertiary)]">Provider Key</span>
          <span className="text-[var(--color-text-primary)] font-mono text-xs">{provider.provider}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-tertiary)]">模式</span>
          <span className="text-[var(--color-text-primary)]">{MODE_LABELS[provider.mode] || provider.mode}</span>
        </div>
      </div>

      {/* P1-6: Security hint in config tab */}
      <div className="rounded-lg border border-[var(--color-info-light)] bg-[var(--color-info-light)]/20 px-4 py-3 flex items-start gap-2">
        <span className="text-sm shrink-0">🔒</span>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{SECURITY_HINT}</p>
      </div>

      {/* Not configured warning */}
      {!provider.configured && (
        <div className="rounded-lg border border-[var(--color-warning-light)] bg-[var(--color-warning-light)]/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">⚠️</span>
            <span className="text-xs font-medium text-[var(--color-warning)]">提示</span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            此 Provider 尚未配置。请在环境变量中设置相应的 API Key 或凭证。
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Drawer Tab: 运行日志
// ============================================================================

function DrawerRunLogsTab({ logs, provider }: { logs: FormattedLogEntry[]; provider: ProviderStatus }) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="暂无运行日志"
        description={`${provider.displayName} 暂无运行日志记录。`}
      />
    );
  }

  // P0-3: Display at least 3 readable log entries with action/result/detail/severity
  const displayLogs = logs.slice(0, Math.max(logs.length, 3));

  return (
    <div className="space-y-3">
      {displayLogs.map((log) => {
        const variant = SEVERITY_BADGE_VARIANT[log.severity] || "info";
        const bgClass =
          variant === "success" ? "bg-[var(--color-success-light)]" :
          variant === "warning" ? "bg-[var(--color-warning-light)]" :
          variant === "danger" ? "bg-[var(--color-danger-light)]" :
          "bg-[var(--color-info-light)]";
        const textClass =
          variant === "success" ? "text-[var(--color-success)]" :
          variant === "warning" ? "text-[var(--color-warning)]" :
          variant === "danger" ? "text-[var(--color-danger)]" :
          "text-[var(--color-info)]";

        return (
          <div
            key={log.id}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            {/* Header: action + severity */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{log.action}</span>
                <span className="text-xs text-[var(--color-text-tertiary)] ml-2">
                  {log.displayName}
                </span>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bgClass} ${textClass} shrink-0`}>
                {log.severity === "ok" ? "✓" : log.severity === "warning" ? "⚠" : "✗"}
              </span>
            </div>

            {/* Result (human readable) */}
            <p className="text-sm text-[var(--color-text-primary)] mb-1">{log.result}</p>

            {/* Detail */}
            {log.detail && (
              <p className="text-xs text-[var(--color-text-secondary)]">{log.detail}</p>
            )}

            {/* Timestamp */}
            <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
              {fmtTime(log.timestamp)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Drawer Tab: 外部映射
// ============================================================================

function DrawerMappingsTab({ mappings, provider }: { mappings: MappingEntry[]; provider: ProviderStatus }) {
  if (mappings.length === 0) {
    return (
      <EmptyState
        icon="🔗"
        title="暂无外部映射"
        description={`${provider.displayName} 暂无外部对象映射记录。`}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">外部对象</th>
            <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">对象类型</th>
            <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">对象名称</th>
            <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">同步状态</th>
            <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">最后同步</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((m) => {
            // P1-4: Show object names/types, not raw IDs
            const isUnauthorized = m.authorized === false;
            const displayName = isUnauthorized
              ? "无权限查看"
              : (m.externalName || m.externalObjectType);

            const syncLabel =
              m.syncStatus === "synced" ? "已同步" :
              m.syncStatus === "pending" ? "待同步" :
              m.syncStatus === "failed" ? "失败" : "未知";

            const syncColor =
              m.syncStatus === "synced" ? "var(--color-success)" :
              m.syncStatus === "pending" ? "var(--color-warning)" :
              m.syncStatus === "failed" ? "var(--color-danger)" :
              "var(--color-text-tertiary)";

            const syncBg =
              m.syncStatus === "synced" ? "var(--color-success-light)" :
              m.syncStatus === "pending" ? "var(--color-warning-light)" :
              m.syncStatus === "failed" ? "var(--color-danger-light)" :
              "var(--color-surface-secondary)";

            return (
              <tr key={m.id} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-tertiary)]">
                <td className="py-2">
                  <span className={isUnauthorized ? "text-[var(--color-text-tertiary)] italic" : "text-[var(--color-text-primary)]"}>
                    {displayName}
                  </span>
                </td>
                <td className="py-2 text-[var(--color-text-secondary)]">{m.objectType}</td>
                <td className="py-2">
                  {m.objectId ? (
                    <span className="text-[var(--color-text-primary)] font-mono text-xs">{m.objectId}</span>
                  ) : (
                    <span className="text-[var(--color-text-tertiary)]">---</span>
                  )}
                </td>
                <td className="py-2">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: syncBg, color: syncColor }}
                  >
                    {syncLabel}
                  </span>
                </td>
                <td className="py-2 text-right text-[var(--color-text-tertiary)] whitespace-nowrap">
                  {fmtTime(m.lastSyncedAt ?? undefined)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Drawer Tab: 技术说明 (engineering details hidden here)
// ============================================================================

function DrawerTechnicalTab({ provider }: { provider: ProviderStatus }) {
  return (
    <div className="space-y-4">
      {/* P0-2: Technical details hidden in this tab */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Adapter 信息</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-tertiary)]">Provider Key</span>
            <span className="text-[var(--color-text-primary)] font-mono text-xs">{provider.provider}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-tertiary)]">Adapter Type</span>
            <span className="text-[var(--color-text-primary)] font-mono text-xs">
              {provider.adapterType || "readonly_adapter_contract"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-tertiary)]">Writeback Enabled</span>
            <span className={`text-sm font-mono text-xs ${provider.writebackEnabled ? "text-[var(--color-success)]" : "text-[var(--color-text-tertiary)]"}`}>
              {String(provider.writebackEnabled)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-tertiary)]">Maturity Ladder</span>
            <span className="text-[var(--color-text-primary)] font-mono text-xs">
              {provider.maturityLevel || "L0"}
            </span>
          </div>
        </div>
      </div>

      {/* Boundary / system constraints */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">系统边界</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-tertiary)]">数据方向</span>
            <span className="text-[var(--color-text-primary)]">只读（从外部读取，不写回）</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-tertiary)]">模式</span>
            <span className="text-[var(--color-text-primary)]">{MODE_LABELS[provider.mode] || provider.mode}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-tertiary)]">写回</span>
            <span className={`text-sm font-mono text-xs ${provider.writebackEnabled ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
              {provider.writebackEnabled ? "true" : "false"}
            </span>
          </div>
        </div>
      </div>

      {/* Responsibility scope */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">职责范围</h4>
        <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-success)] mt-0.5 shrink-0">✓</span>
            <span>读取外部系统数据用于招聘分析和风险识别</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-success)] mt-0.5 shrink-0">✓</span>
            <span>基于分析结果生成风险提示和行动建议</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-success)] mt-0.5 shrink-0">✓</span>
            <span>管理外部对象映射关系（链接/关联）</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-danger)] mt-0.5 shrink-0">✗</span>
            <span>不回写候选人状态到外部 ATS 系统</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-danger)] mt-0.5 shrink-0">✗</span>
            <span>不修改飞书文档内容</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-danger)] mt-0.5 shrink-0">✗</span>
            <span>不创建/修改外部系统的面试或评价记录</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
