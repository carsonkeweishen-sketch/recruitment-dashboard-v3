/**
 * Drawer Shell — 统一的详情抽屉容器
 *
 * 右侧滑入，支持 ESC 关闭、点击遮罩关闭、Tabs、底部 Action Bar。
 * 参考：Linear Side Panel / Greenhouse Detail Drawer
 */

"use client";

import { useEffect, useCallback, type ReactNode } from "react";
// design-tokens used via CSS variables in className strings

type DrawerWidth = "sm" | "md" | "lg";

const widthMap: Record<DrawerWidth, string> = {
  sm: "w-[480px]",
  md: "w-[640px]",
  lg: "w-[720px]",
};

interface DrawerShellProps {
  /** Drawer 标题 */
  title?: string;
  /** 右上角状态标签 */
  statusBadge?: ReactNode;
  /** Drawer 宽度 */
  width?: DrawerWidth;
  /** 关闭回调 */
  onClose: () => void;
  /** 主内容区 */
  children: ReactNode;
  /** 底部操作栏 */
  footer?: ReactNode;
  /** 是否禁止点击遮罩关闭（如未保存内容） */
  disableBackdropClose?: boolean;
}

export function DrawerShell({
  title,
  statusBadge,
  width = "md",
  onClose,
  children,
  footer,
  disableBackdropClose = false,
}: DrawerShellProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30"
        onClick={disableBackdropClose ? undefined : onClose}
      />

      {/* Drawer */}
      <div
        className={`relative z-50 flex h-full ${widthMap[width]} flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg`}
      >
        {/* Header */}
        {(title || statusBadge) && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
            <div className="flex items-center gap-3 min-w-0">
              {title && (
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] truncate">
                  {title}
                </h2>
              )}
              {statusBadge}
            </div>
            <button
              onClick={onClose}
              className="ml-4 shrink-0 rounded-md p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label="关闭"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer Action Bar */}
        {footer && (
          <div className="sticky bottom-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
