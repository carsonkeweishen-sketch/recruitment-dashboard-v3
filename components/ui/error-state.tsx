/**
 * Error State — 统一错误状态组件
 *
 * 展示错误信息和重试入口。禁止暴露技术细节。
 * 参考：Stripe Error State / Vercel Error Page
 */

import { type ReactNode } from "react";
import { componentStyles } from "@/components/ui/design-tokens";

interface ErrorStateProps {
  /** 图标 */
  icon?: string;
  /** 错误标题 */
  title?: string;
  /** 错误描述 */
  description?: string;
  /** 重试回调 */
  onRetry?: () => void;
  /** 额外操作 */
  children?: ReactNode;
}

export function ErrorState({
  icon = "⚠️",
  title = "加载失败",
  description = "请稍后重试或联系管理员",
  onRetry,
  children,
}: ErrorStateProps) {
  return (
    <div className={`${componentStyles.card} flex flex-col items-center justify-center py-16 text-center px-6`}>
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-sm">
        {description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          重试
        </button>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
