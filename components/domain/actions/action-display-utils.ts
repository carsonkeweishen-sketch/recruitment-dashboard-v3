// Phase 7.4B: Action display utilities

import type { ActionItem } from "./action-types";
import {
  STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS, SOURCE_LABELS,
  STATUS_BADGE_STYLES, PRIORITY_BADGE_STYLES,
} from "./action-copy-map";

const ROUND_LABELS: Record<string, string> = {
  hr_initial: "HR 初筛", business_first: "业务一面",
  business_second: "业务二面", ceo_final: "终面", cross_function: "跨职能面",
};

export function getLinkedContextLabel(action: ActionItem): string {
  const parts: string[] = [];
  if (action.candidate) parts.push(action.candidate.name);
  if (action.job) parts.push(action.job.title);
  if (action.interview) {
    const round = ROUND_LABELS[action.interview.round] || action.interview.round;
    const name = action.interview.interviewer?.name || "";
    parts.push(`${round}${name ? " · " + name : ""}`);
  }
  return parts.join(" · ") || "—";
}

export function isOverdue(action: ActionItem): boolean {
  if (!action.dueAt) return false;
  if (action.status === "resolved" || action.status === "dismissed") return false;
  return new Date(action.dueAt) < new Date();
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
  if (diffH < 1) return "刚刚";
  if (diffH < 24) return `${diffH}小时前`;
  if (diffH < 48) return "昨天";
  return d.toLocaleDateString("zh-CN");
}

export function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN");
}

export { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS, SOURCE_LABELS, STATUS_BADGE_STYLES, PRIORITY_BADGE_STYLES };
