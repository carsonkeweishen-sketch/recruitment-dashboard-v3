"use client";

import type { ActionItem } from "./action-types";
import { formatRelativeDate } from "./action-display-utils";

interface Props { action: ActionItem; }

export function ActionActivityTimeline({ action }: Props) {
  const events: Array<{ label: string; time: string; detail: string }> = [];

  events.push({
    label: "创建",
    time: formatRelativeDate(action.createdAt),
    detail: `由 ${action.createdBy?.name || "系统"} 创建`,
  });

  if (action.status === "resolved" && action.resolvedAt) {
    events.push({
      label: "已解决",
      time: formatRelativeDate(action.resolvedAt),
      detail: action.resolutionNote || "已标记为已解决",
    });
  }

  if (action.status === "dismissed" && action.resolvedAt) {
    events.push({
      label: "已忽略",
      time: formatRelativeDate(action.resolvedAt),
      detail: action.dismissedReason || "已忽略此行动",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((ev, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`h-2.5 w-2.5 rounded-full ${
              i === events.length - 1 ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
            }`} />
            {i < events.length - 1 && <div className="w-px flex-1 bg-[var(--color-border)]" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="text-sm font-medium text-[var(--color-text-primary)]">{ev.label}</div>
            <div className="text-xs text-[var(--color-text-tertiary)]">{ev.time}</div>
            {ev.detail && <div className="mt-1 text-xs text-[var(--color-text-secondary)]">{ev.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
