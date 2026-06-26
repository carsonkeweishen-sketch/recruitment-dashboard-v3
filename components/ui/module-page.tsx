/**
 * Module Page — 模块页面标准壳
 *
 * 用于未完成模块的空状态占位页面，提供成熟、专业的"模块建设中"展示。
 * 禁止使用 "Coming soon!!!" / "TODO" / "测试模块" 等文案。
 *
 * 参考：Stripe / Vercel 的空模块展示
 */

import { type ReactNode } from "react";
import { tokens, componentStyles } from "@/components/ui/design-tokens";

interface ModulePageProps {
  /** 模块名称 */
  title: string;
  /** 模块描述 */
  description: string;
  /** 模块图标（emoji 或 SVG） */
  icon?: string;
  /** 当前阶段标签 */
  phase?: string;
  /** 预期交付阶段 */
  expectedPhase?: string;
  /** 额外的操作按钮 */
  children?: ReactNode;
}

export function ModulePage({
  title,
  description,
  icon = "📦",
  phase,
  expectedPhase,
  children,
}: ModulePageProps) {
  return (
    <div className={tokens.spacing.section}>
      {/* Page Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-2xl">
            {description}
          </p>
        </div>
        {phase && (
          <span className="shrink-0 inline-flex items-center rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
            {phase}
          </span>
        )}
      </header>

      {/* Module Placeholder */}
      <div className={`mt-8 ${componentStyles.card} p-12`}>
        <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="mb-4 text-5xl">{icon}</div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            该模块正在接入招聘数据。当前可先通过{" "}
            <strong className="text-[var(--color-text-primary)]">
              AI 决策看板
            </strong>{" "}
            和{" "}
            <strong className="text-[var(--color-text-primary)]">
              风险行动中心
            </strong>{" "}
            查看核心招聘风险与待处理事项。
          </p>
          {expectedPhase && (
            <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
              预计交付：{expectedPhase}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>
  );
}
