"use client";

/**
 * Phase 8.12 — Unified StatusBadge
 * 统一所有状态、优先级、风险、AI、权限的视觉标签
 * 禁止在各页面自行定义颜色
 */

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "pending" | "ai" | "system_rule" | "default";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  info: "bg-[var(--color-info-light)] text-[var(--color-info)]",
  neutral: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]",
  default: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]",
  pending: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  ai: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  system_rule: "bg-[var(--color-info-light)] text-[var(--color-info)]",
};

export function StatusBadge({ label, variant = "neutral", size = "sm", className = "" }: StatusBadgeProps) {
  const sizeClass = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${VARIANT_STYLES[variant]} ${className}`}>
      {label}
    </span>
  );
}
