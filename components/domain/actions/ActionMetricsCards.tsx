"use client";

import type { ActionMetrics } from "./action-types";

interface Props {
  metrics: ActionMetrics;
}

export function ActionMetricsCards({ metrics }: Props) {
  const cards = [
    {
      label: "待处理",
      value: metrics.openCount,
      hint: metrics.openCount > 5 ? "需关注" : "正常",
      hintStyle: metrics.openCount > 5 ? "text-amber-600" : "text-green-600",
    },
    {
      label: "逾期",
      value: metrics.overdueCount,
      hint: metrics.overdueCount > 0 ? "优先处理" : "无逾期",
      hintStyle: metrics.overdueCount > 0 ? "text-red-600" : "text-green-600",
    },
    {
      label: "高优先级",
      value: metrics.highPriorityCount,
      hint: "需优先跟进",
      hintStyle: metrics.highPriorityCount > 0 ? "text-amber-600" : "text-gray-400",
    },
    {
      label: "今日到期",
      value: metrics.dueTodayCount,
      hint: "今日截止",
      hintStyle: metrics.dueTodayCount > 0 ? "text-blue-600" : "text-gray-400",
    },
    {
      label: "平均关闭时长",
      value: metrics.avgResolutionHours > 0 ? `${metrics.avgResolutionHours}h` : "—",
      hint: metrics.avgResolutionHours > 0 ? "" : "暂无足够数据",
      hintStyle: "text-gray-400",
    },
    {
      label: "按时关闭率",
      value: metrics.onTimeResolutionRate > 0 ? `${metrics.onTimeResolutionRate}%` : "—",
      hint: metrics.onTimeResolutionRate > 0 ? "" : "暂无足够数据",
      hintStyle: "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {card.label}
          </div>
          <div className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">
            {card.value}
          </div>
          {card.hint && (
            <div className={`mt-1 text-xs ${card.hintStyle}`}>{card.hint}</div>
          )}
        </div>
      ))}
    </div>
  );
}
