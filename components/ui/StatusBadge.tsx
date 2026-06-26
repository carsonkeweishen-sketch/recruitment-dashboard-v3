/**
 * Status Badge — 统一状态标签组件
 *
 * 4 种语义色变体。参考：Stripe Chip / Rippling Status Badge
 */

import { tokens } from "@/components/ui/design-tokens";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
  success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  info: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
};

interface StatusBadgeProps {
  /** 标签文本 */
  label: string;
  /** 语义变体 */
  variant?: BadgeVariant;
}

export function StatusBadge({
  label,
  variant = "default",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center ${tokens.radius.badge} px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {label}
    </span>
  );
}
