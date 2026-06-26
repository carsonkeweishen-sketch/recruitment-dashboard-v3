/**
 * Empty State — 空状态组件
 *
 * 当数据为空时展示，提供清晰的引导操作。
 * 禁止使用 "暂无数据" 这类无信息量的文案。
 *
 * 参考：Stripe Empty State / Untitled UI
 */

import { type ReactNode } from "react";
import { componentStyles } from "@/components/ui/design-tokens";

interface EmptyStateProps {
  /** 图标（emoji 或 SVG），默认 📭 */
  icon?: string;
  /** 标题 */
  title?: string;
  /** 描述文案 */
  description?: string;
  /** 操作按钮/链接 */
  action?: ReactNode;
}

export function EmptyState({
  icon = "📭",
  title = "暂无内容",
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={`${componentStyles.card} flex flex-col items-center justify-center py-16 text-center px-6`}>
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
