"use client";

import { useState, useEffect, useCallback } from "react";
import { ActionMetricsCards } from "@/components/domain/actions/ActionMetricsCards";
import { ActionFilterBar } from "@/components/domain/actions/ActionFilterBar";
import { ActionList } from "@/components/domain/actions/ActionList";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionDenied } from "@/components/ui/PermissionDenied";
import type { ActionItem, ActionMetrics } from "@/components/domain/actions/action-types";

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [metrics, setMetrics] = useState<ActionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const fetchActions = useCallback(async (filterParams?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterParams) {
        Object.entries(filterParams).forEach(([k, v]) => { if (v) params.set(k, v); });
      }
      const res = await fetch(`/api/actions?${params.toString()}`);
      const data = await res.json();
      if (!data.success) {
        if (res.status === 403 || data.error?.includes("Permission denied")) {
          setPermissionDenied(true);
        } else {
          setError(data.error || "加载失败");
        }
        return;
      }
      setActions(data.actions || []);
      setMetrics(data.metrics || null);
      setPermissionDenied(false);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActions(filters);
  }, [fetchActions, filters]);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  if (loading) return <LoadingSkeleton />;
  if (permissionDenied) return <PermissionDenied />;
  if (error) return <ErrorState title={error} onRetry={() => fetchActions(filters)} />;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">行动中心</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            集中处理招聘过程中的待办、风险跟进和跨角色协同事项
          </p>
        </div>
        <div className="flex gap-2">
          <button
            disabled
            title="将在下一阶段支持创建"
            className="cursor-not-allowed rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-tertiary)]"
          >
            创建 Action
          </button>
          <button
            disabled
            title="将在后续阶段支持规则生成"
            className="cursor-not-allowed rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-tertiary)]"
          >
            生成规则 Action
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && <ActionMetricsCards metrics={metrics} />}

      {/* Filters */}
      <ActionFilterBar filters={filters} onChange={handleFilterChange} />

      {/* Action List */}
      {actions.length === 0 ? (
        <EmptyState
          title="当前没有待处理行动"
          description="招聘流程中的风险跟进、反馈催办和协同事项会出现在这里。"
        />
      ) : (
        <ActionList actions={actions} />
      )}
    </div>
  );
}
