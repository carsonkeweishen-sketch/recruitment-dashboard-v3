"use client";

import type { ActionItem } from "./action-types";
import {
  STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS, SOURCE_LABELS,
  isOverdue, formatRelativeDate, formatFullDate,
} from "./action-display-utils";

interface Props { action: ActionItem; }

export function ActionDetailOverview({ action }: Props) {
  const overdue = isOverdue(action);

  return (
    <div className="flex flex-col gap-6">
      {/* Basic Info */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">基础信息</h3>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
          <div className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">{action.title}</div>
          {action.description && (
            <div className="text-sm text-[var(--color-text-secondary)]">{action.description}</div>
          )}
          {!action.description && (
            <div className="text-sm italic text-[var(--color-text-tertiary)]">暂无详细描述</div>
          )}
        </div>
      </section>

      {/* Status & Priority */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">处理状态</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="text-xs text-[var(--color-text-tertiary)]">分类</div>
            <div className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{CATEGORY_LABELS[action.category]}</div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
            <div className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{STATUS_LABELS[action.status]}</div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="text-xs text-[var(--color-text-tertiary)]">优先级</div>
            <div className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{PRIORITY_LABELS[action.priority]}</div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="text-xs text-[var(--color-text-tertiary)]">来源</div>
            <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{SOURCE_LABELS[action.sourceType]}</div>
          </div>
        </div>
      </section>

      {/* Owner & Source */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">责任人与来源</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="text-xs text-[var(--color-text-tertiary)]">负责人</div>
            <div className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{action.owner?.name || "—"}</div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="text-xs text-[var(--color-text-tertiary)]">创建人</div>
            <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{action.createdBy?.name || "—"}</div>
          </div>
        </div>
        {action.sourceSummary && (
          <div className="mt-3 rounded-lg border border-[var(--color-border)] p-3">
            <div className="text-xs text-[var(--color-text-tertiary)]">来源说明</div>
            <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{action.sourceSummary}</div>
          </div>
        )}
      </section>

      {/* Time */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">时间信息</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="text-xs text-[var(--color-text-tertiary)]">截止时间</div>
            <div className={`mt-1 text-sm ${overdue ? "font-medium text-red-600" : "text-[var(--color-text-primary)]"}`}>
              {action.dueAt ? formatFullDate(action.dueAt) : "—"}
              {overdue && <span className="ml-1 text-xs">(逾期)</span>}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
            <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{formatRelativeDate(action.createdAt)}</div>
          </div>
        </div>
      </section>

      {/* Resolution / Dismissal */}
      {(action.resolutionNote || action.dismissedReason) && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {action.resolutionNote ? "处理说明" : "忽略原因"}
          </h3>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
            <div className="text-sm text-[var(--color-text-secondary)]">
              {action.resolutionNote || action.dismissedReason}
            </div>
            <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
              {action.resolvedAt && `处理于 ${formatFullDate(action.resolvedAt)}`}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
