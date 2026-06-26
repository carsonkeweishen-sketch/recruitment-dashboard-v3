/**
 * Permission State — 统一权限拒绝状态组件
 *
 * 展示权限不足信息。禁止泄露对象存在性、对象数量、内部 ID。
 * 参考：Stripe Permission Denied / Linear Restricted Access
 */

import { type ReactNode } from "react";
import { componentStyles } from "@/components/ui/design-tokens";

interface PermissionStateProps {
  /** 图标 */
  icon?: string;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 返回操作 */
  children?: ReactNode;
}

export function PermissionState({
  icon = "🔒",
  title = "权限不足",
  description = "您没有权限访问此页面。如需访问请联系管理员。",
  children,
}: PermissionStateProps) {
  return (
    <div className={`${componentStyles.card} flex flex-col items-center justify-center py-16 text-center px-6`}>
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-sm">
        {description}
      </p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
