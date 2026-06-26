/**
 * Product Shell — SaaS 产品级页面布局壳
 *
 * 提供统一的 Page Header + KPI Row + Filter Bar + Main Content 结构。
 * 所有模块页面使用此组件包裹，保证视觉一致性。
 *
 * 参考：Linear / Ashby / Stripe Dashboard
 */

import { type ReactNode } from "react";
import { tokens } from "@/components/ui/design-tokens";

interface ProductShellProps {
  /** 页面标题 */
  title: string;
  /** 页面描述（显示在标题下方） */
  description?: string;
  /** 右上角操作区（按钮等） */
  actions?: ReactNode;
  /** KPI 卡片行（通常 4 个 KPI） */
  kpiRow?: ReactNode;
  /** 筛选/搜索栏 */
  filterBar?: ReactNode;
  /** 主内容区 */
  children: ReactNode;
}

export function ProductShell({
  title,
  description,
  actions,
  kpiRow,
  filterBar,
  children,
}: ProductShellProps) {
  return (
    <div className={tokens.spacing.section}>
      {/* Page Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </header>

      {/* KPI Cards Row */}
      {kpiRow && <div className="mt-6">{kpiRow}</div>}

      {/* Filter Bar */}
      {filterBar && <div className="mt-4">{filterBar}</div>}

      {/* Main Content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
