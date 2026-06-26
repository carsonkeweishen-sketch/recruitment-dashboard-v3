"use client";

import type { ActionItem } from "./action-types";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  SOURCE_LABELS,
  STATUS_BADGE_STYLES,
  PRIORITY_BADGE_STYLES,
} from "./action-copy-map";

interface Props {
  actions: ActionItem[];
}

const ROUND_LABELS: Record<string, string> = {
  hr_initial: "HR初筛",
  business_first: "一面",
  business_second: "二面",
  ceo_final: "终面",
  cross_function: "跨职能",
};

function getLinkedContextLabel(action: ActionItem): string {
  const parts: string[] = [];
  if (action.candidate) parts.push(action.candidate.name);
  if (action.job) parts.push(action.job.title);
  if (action.interview) {
    const round = ROUND_LABELS[action.interview.round] || action.interview.round;
    const name = action.interview.interviewer?.name || "";
    parts.push(`${round}${name ? `·${name}` : ""}`);
  }
  return parts.join(" · ") || "—";
}

function isOverdue(action: ActionItem): boolean {
  if (!action.dueAt) return false;
  if (action.status === "resolved" || action.status === "dismissed") return false;
  return new Date(action.dueAt) < new Date();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "刚刚";
  if (diffH < 24) return `${diffH}小时前`;
  if (diffH < 48) return "昨天";
  return d.toLocaleDateString("zh-CN");
}

export function ActionList({ actions }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                行动项
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                分类
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                优先级
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                负责人
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                关联对象
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                来源
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                截止/更新
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {actions.map((action) => {
              const overdue = isOverdue(action);
              return (
                <tr
                  key={action.id}
                  className="transition-colors hover:bg-[var(--color-surface-tertiary)]"
                >
                  {/* Title + Summary */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {action.title}
                    </div>
                    {(action.description || action.sourceSummary) && (
                      <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)] line-clamp-1">
                        {action.description || action.sourceSummary}
                      </div>
                    )}
                  </td>

                  {/* Category Badge */}
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                      {CATEGORY_LABELS[action.category] || action.category}
                    </span>
                  </td>

                  {/* Priority Badge */}
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        PRIORITY_BADGE_STYLES[action.priority] || ""
                      }`}
                    >
                      {PRIORITY_LABELS[action.priority] || action.priority}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_BADGE_STYLES[action.status] || ""
                      }`}
                    >
                      {STATUS_LABELS[action.status] || action.status}
                    </span>
                  </td>

                  {/* Owner */}
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                    {action.owner?.name || "—"}
                  </td>

                  {/* Linked Context */}
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                    {getLinkedContextLabel(action)}
                  </td>

                  {/* Source */}
                  <td className="px-3 py-3 text-xs text-[var(--color-text-tertiary)]">
                    {SOURCE_LABELS[action.sourceType] || action.sourceType}
                  </td>

                  {/* Due/Updated */}
                  <td className="px-4 py-3 text-right text-xs">
                    {action.dueAt && (
                      <div className={overdue ? "font-medium text-red-600" : "text-[var(--color-text-tertiary)]"}>
                        {overdue ? "逾期 " : "截止 "}
                        {formatDate(action.dueAt)}
                      </div>
                    )}
                    <div className="text-[var(--color-text-tertiary)]">
                      {formatDate(action.updatedAt)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
