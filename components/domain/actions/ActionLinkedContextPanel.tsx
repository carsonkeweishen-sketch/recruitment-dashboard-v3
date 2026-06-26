"use client";

import type { ActionItem } from "./action-types";

interface Props { action: ActionItem; }

const STAGE_LABELS: Record<string, string> = {
  sourced: "已筛选",
  hr_screen: "HR 初筛",
  business_screen: "业务筛选",
  first_interview: "一面",
  second_interview: "二面",
  ceo_final: "终面",
  offer_risk: "Offer 风险",
  offered: "已发 Offer",
};

const ROUND_LABELS: Record<string, string> = {
  hr_initial: "HR 初筛",
  business_first: "业务一面",
  business_second: "业务二面",
  ceo_final: "终面",
  cross_function: "跨职能面",
};

export function ActionLinkedContextPanel({ action }: Props) {
  const hasContext = action.job || action.candidate || action.application || action.interview;
  if (!hasContext) {
    return (
      <div className="py-12 text-center">
        <div className="text-sm font-medium text-[var(--color-text-secondary)]">暂无关联信息</div>
        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">此行动为手动创建，未关联具体岗位或候选人</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {action.job && (
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">关联岗位</div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{action.job.title}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
            <span>{action.job.jobCode}</span>
          </div>
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
          <div className="text-sm text-[var(--color-text-primary)]">
            阶段：{STAGE_LABELS[action.application.stage] || action.application.stage}
          </div>
          {action.application.candidate && (
            <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
              候选人：{action.application.candidate.name}
            </div>
          )}
          {action.application.job && (
            <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
              岗位：{action.application.job.title}
            </div>
          )}
        </div>
      )}
      {action.interview && (
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">关联面试</div>
          <div className="text-sm text-[var(--color-text-primary)]">
            轮次：{ROUND_LABELS[action.interview.round] || action.interview.round}
          </div>
          {action.interview.interviewer && (
            <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
              面试官：{action.interview.interviewer.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
