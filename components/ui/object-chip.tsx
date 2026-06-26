/**
 * Object Chip — 招聘对象标签（岗位/候选人/面试官）
 *
 * 用于在列表、卡片中展示关联的业务对象。
 *
 * 参考：Rippling Employee Chip / Greenhouse Object Tag
 */

import Link from "next/link";
// design-tokens used via CSS variables in className strings

type ObjectType = "job" | "candidate" | "interview" | "interviewer" | "department";

interface ObjectChipProps {
  /** 对象类型 */
  type: ObjectType;
  /** 显示文本 */
  label: string;
  /** 可选的跳转链接 */
  href?: string;
  /** 可选的副标题（如职级/部门） */
  subtitle?: string;
}

const typeConfig: Record<ObjectType, { icon: string; color: string }> = {
  job: { icon: "💼", color: "text-[var(--color-primary)]" },
  candidate: { icon: "👤", color: "text-[var(--color-text-primary)]" },
  interview: { icon: "💬", color: "text-[var(--color-warning)]" },
  interviewer: { icon: "🎯", color: "text-[var(--color-success)]" },
  department: { icon: "🏢", color: "text-[var(--color-text-secondary)]" },
};

export function ObjectChip({
  type,
  label,
  href,
  subtitle,
}: ObjectChipProps) {
  const config = typeConfig[type];

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-sm transition-colors ${
        href ? "hover:border-[var(--color-border-strong)] cursor-pointer" : ""
      }`}
    >
      <span className="text-xs">{config.icon}</span>
      <span className={`font-medium ${config.color}`}>{label}</span>
      {subtitle && (
        <span className="text-xs text-[var(--color-text-tertiary)]">
          {subtitle}
        </span>
      )}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
