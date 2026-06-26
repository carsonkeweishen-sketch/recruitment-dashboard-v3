/**
 * KPI Card — 招聘数据核心指标卡片
 *
 * 每个卡片包含：标签 + 数值 + 趋势箭头。
 * 点击卡片可跳转到对应列表页。
 *
 * 参考：Tremor MetricCard / Panda Design System
 */

import Link from "next/link";
import { tokens, componentStyles } from "@/components/ui/design-tokens";

type TrendDirection = "up" | "down" | "flat";

interface KpiCardProps {
  /** KPI 标签（如 "待处理事项"） */
  label: string;
  /** KPI 数值（如 "5"） */
  value: string | number;
  /** 趋势对比文字（如 "比上周+2"） */
  trendLabel?: string;
  /** 趋势方向 */
  trendDirection?: TrendDirection;
  /** 点击跳转链接 */
  href?: string;
}

const trendConfig: Record<
  TrendDirection,
  { arrow: string; color: string }
> = {
  up: {
    arrow: "↑",
    color:
      "text-[var(--color-success)]",
  },
  down: {
    arrow: "↓",
    color:
      "text-[var(--color-danger)]",
  },
  flat: {
    arrow: "→",
    color:
      "text-[var(--color-text-tertiary)]",
  },
};

export function KpiCard({
  label,
  value,
  trendLabel,
  trendDirection = "flat",
  href,
}: KpiCardProps) {
  const trend = trendConfig[trendDirection];

  const cardContent = (
    <div
      className={`${componentStyles.card} ${tokens.spacing.compact} ${
        href ? "hover:border-[var(--color-border-strong)] transition-colors" : ""
      }`}
    >
      <div className={componentStyles.kpiLabel}>{label}</div>
      <div className={`mt-1 ${componentStyles.kpiValue}`}>{value}</div>
      {trendLabel && (
        <div className={`mt-1 flex items-center gap-1 text-xs ${trend.color}`}>
          <span className="font-medium">{trend.arrow}</span>
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
