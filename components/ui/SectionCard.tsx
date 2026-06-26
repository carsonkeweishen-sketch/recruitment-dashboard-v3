/**
 * Section Card — 统一内容区块卡片
 *
 * 参考：Tremor Card / Airtable Section
 */

import { type ReactNode } from "react";
import { tokens, componentStyles } from "@/components/ui/design-tokens";

interface SectionCardProps {
  /** 卡片标题 */
  title?: string;
  /** 内容 */
  children: ReactNode;
  /** 额外 class */
  className?: string;
}

export function SectionCard({
  title,
  children,
  className,
}: SectionCardProps) {
  return (
    <div className={`${componentStyles.card} ${tokens.spacing.card} ${className ?? ""}`}>
      {title && (
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
