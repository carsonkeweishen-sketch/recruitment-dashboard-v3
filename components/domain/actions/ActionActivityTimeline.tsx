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

export function ActionActivityTimeline({ action }: Props) {
  const activity = action.activity;

  // No activity data
  if (!activity || activity.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-sm text-[var(--color-text-tertiary)]">暂无操作记录</div>
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
        const detail = entry.detail
          ? typeof entry.detail === "string"
            ? entry.detail
            : JSON.stringify(entry.detail)
          : null;

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
              <div className="text-sm font-medium text-[var(--color-text-primary)]">
                {label}
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">
                {time} · {actorName}
              </div>
              {detail && (
                <div className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-3">
                  {detail}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
