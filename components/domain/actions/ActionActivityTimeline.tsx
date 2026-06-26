"use client";

import type { ActionItem } from "./action-types";
import { formatRelativeDate } from "./action-display-utils";

interface Props { action: ActionItem; }

const ACTION_LABELS: Record<string, string> = {
  ACTION_CREATED: "创建",
  ACTION_RESOLVED: "已解决",
  ACTION_DISMISSED: "已忽略",
  ACTION_UPDATED: "已更新",
  ACTION_GENERATED_BY_RULE: "规则生成",
};

function formatActivityDetail(action: string, detail: Record<string, unknown> | null): string | null {
  if (!detail) return null;

  // ACTION_CREATED: show source summary or category description
  if (action === "ACTION_CREATED") {
    if (detail.sourceSummary) return detail.sourceSummary as string;
    if (detail.category) {
      const catLabels: Record<string, string> = {
        feedback_followup: "反馈催办",
        interview_followup: "面试跟进",
        candidate_risk_followup: "候选人风险追问",
        job_calibration: "岗位画像校准",
        business_feedback: "业务反馈补充",
        offer_risk: "Offer 风险跟进",
        process_blocker: "流程卡点处理",
        data_quality: "数据质量修正",
        manual: "手动创建",
      };
      return `分类：${catLabels[detail.category as string] || detail.category}`;
    }
    return null;
  }

  // ACTION_RESOLVED: show resolution note
  if (action === "ACTION_RESOLVED" && detail.resolutionNote) {
    return `处理说明：${detail.resolutionNote}`;
  }

  // ACTION_DISMISSED: show dismissed reason
  if (action === "ACTION_DISMISSED" && detail.dismissedReason) {
    return `忽略原因：${detail.dismissedReason}`;
  }

  return null;
}

export function ActionActivityTimeline({ action }: Props) {
  const activity = action.activity;

  // No activity data
  if (!activity || activity.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-sm font-medium text-[var(--color-text-secondary)]">暂无操作记录</div>
        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">创建、解决或忽略操作后会在此展示时间线</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {activity.map((entry, i) => {
        const isLast = i === activity.length - 1;
        const label = ACTION_LABELS[entry.action] || entry.action;
        const time = formatRelativeDate(entry.createdAt);
        const actorName = entry.actor?.name || "系统";
        const detailText = formatActivityDetail(entry.action, entry.detail as Record<string, unknown> | null);

        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isLast
                    ? "bg-[var(--color-primary)]"
                    : "bg-[var(--color-border)]"
                }`}
              />
              {!isLast && (
                <div className="w-px flex-1 bg-[var(--color-border)]" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {label}
                </span>
                <span className="rounded bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                  {entry.action}
                </span>
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">
                {time} · {actorName}
              </div>
              {detailText && (
                <div className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)] line-clamp-3">
                  {detailText}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
