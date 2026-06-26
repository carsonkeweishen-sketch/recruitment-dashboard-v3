"use client";

import type { ActionItem } from "./action-types";

interface Props { action: ActionItem; }

export function ActionLinkedContextPanel({ action }: Props) {
  const hasContext = action.job || action.candidate || action.application || action.interview;
  if (!hasContext) {
    return (
      <div className="py-12 text-center text-sm text-[var(--color-text-tertiary)]">
        暂无关联信息
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {action.job && (
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">关联岗位</div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{action.job.title}</div>
          <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{action.job.jobCode}</div>
        </div>
      )}
      {action.candidate && (
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">关联候选人</div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{action.candidate.name}</div>
        </div>
      )}
      {action.application && (
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">关联投递</div>
          <div className="text-sm text-[var(--color-text-primary)]">阶段：{action.application.stage}</div>
          {action.application.candidate && (
            <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">候选人：{action.application.candidate.name}</div>
          )}
        </div>
      )}
      {action.interview && (
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">关联面试</div>
          <div className="text-sm text-[var(--color-text-primary)]">轮次：{action.interview.round}</div>
          {action.interview.interviewer && (
            <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">面试官：{action.interview.interviewer.name}</div>
          )}
        </div>
      )}
    </div>
  );
}
