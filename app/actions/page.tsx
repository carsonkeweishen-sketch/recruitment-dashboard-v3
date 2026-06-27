"use client";

import { useState, useEffect, useCallback } from "react";
import { ActionMetricsCards } from "@/components/domain/actions/ActionMetricsCards";
import { ActionFilterBar } from "@/components/domain/actions/ActionFilterBar";
import { ActionList } from "@/components/domain/actions/ActionList";
import { ActionDetailDrawer } from "@/components/domain/actions/ActionDetailDrawer";
import { CreateActionModal } from "@/components/domain/actions/CreateActionModal";
import { ResolveActionModal } from "@/components/domain/actions/ResolveActionModal";
import { DismissActionModal } from "@/components/domain/actions/DismissActionModal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionDenied } from "@/components/ui/PermissionDenied";
import type { ActionItem, ActionMetrics } from "@/components/domain/actions/action-types";
import { AICopilotPanel } from "@/components/domain/ai/AICopilotPanel";

export default function ActionsPage() {
  const [_aiOpen, _setAiOpen] = useState(false);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [metrics, setMetrics] = useState<ActionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<ActionItem | null>(null);
  const [dismissTarget, setDismissTarget] = useState<ActionItem | null>(null);
  const [toast, setToast] = useState("");

  const fetchActions = useCallback(async (filterParams?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterParams) Object.entries(filterParams).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`/api/actions?${params.toString()}`);
      const data = await res.json();
      if (!data.success) {
        if (res.status === 403 || data.error?.includes("Permission denied")) { setPermissionDenied(true); }
        else { setError(data.error || "加载失败"); }
        return;
      }
      setActions(data.actions || []);
      setMetrics(data.metrics || null);
      setPermissionDenied(false);
    } catch { setError("网络错误，请稍后重试"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActions(filters);
  }, [fetchActions, filters]);

  const refresh = () => fetchActions(filters);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleResolveSuccess = () => {
    setResolveTarget(null); setSelectedId(null); refresh(); showToast("行动项已标记为已解决，处理说明已记录");
  };
  const handleDismissSuccess = () => {
    setDismissTarget(null); setSelectedId(null); refresh(); showToast("行动项已忽略，忽略原因已记录");
  };
  const handleCreateSuccess = () => {
    setShowCreate(false); refresh(); showToast("行动项已创建，已分配负责人");
  };

  if (loading) return <LoadingSkeleton />;
  if (permissionDenied) return <PermissionDenied />;
  if (error) return <ErrorState title={error} onRetry={() => fetchActions(filters)} />;

  return (
    <div className="flex flex-col gap-6 p-6">
      {toast && (
        <div className="fixed right-6 top-6 z-[100] rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">招聘风险行动中心</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">集中跟进反馈催办、候选人风险、Offer 风险、流程卡点等招聘关键事项</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreate(true)} className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">
            新建行动项
          </button>
          <button disabled title="将在后续阶段支持规则生成" className="cursor-not-allowed rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-tertiary)]">
            规则生成
          </button>
        </div>
      </div>

      {metrics && <ActionMetricsCards metrics={metrics} />}
      <ActionFilterBar filters={filters} onChange={setFilters} />

      {actions.length === 0 ? (
        <EmptyState title="当前没有待处理行动" description="招聘流程中的风险跟进、反馈催办和协同事项会出现在这里。" />
      ) : (
        <ActionList actions={actions} onActionClick={(id) => setSelectedId(id)} />
      )}

      {selectedId && (
        <ActionDetailDrawer
          actionId={selectedId}
          onClose={() => setSelectedId(null)}
          onResolve={(a) => setResolveTarget(a)}
          onDismiss={(a) => setDismissTarget(a)}
          onRefresh={refresh}
        />
      )}

      {showCreate && <CreateActionModal onClose={() => setShowCreate(false)} onSuccess={handleCreateSuccess} />}
      {resolveTarget && <ResolveActionModal action={resolveTarget} onClose={() => setResolveTarget(null)} onSuccess={handleResolveSuccess} />}
      {dismissTarget && <DismissActionModal action={dismissTarget} onClose={() => setDismissTarget(null)} onSuccess={handleDismissSuccess} />}
    </div>
  );
}
