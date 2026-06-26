/**
 * Modal Shell — 统一的弹窗容器
 *
 * 居中弹出，一次只处理一个动作。支持 ESC 关闭、提交 loading、错误展示。
 * 参考：Stripe Modal / Greenhouse Form Modal
 */

"use client";

import { useEffect, useCallback, type ReactNode } from "react";
// design-tokens used via CSS variables in className strings

type ModalWidth = "sm" | "md" | "lg";

const widthMap: Record<ModalWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

interface ModalShellProps {
  /** Modal 标题 */
  title: string;
  /** 关闭回调 */
  onClose: () => void;
  /** 主内容区 */
  children: ReactNode;
  /** 底部操作区 */
  footer?: ReactNode;
  /** Modal 宽度 */
  width?: ModalWidth;
  /** 是否禁止 ESC 和点击遮罩关闭（有未保存内容时） */
  disableClose?: boolean;
}

export function ModalShell({
  title,
  onClose,
  children,
  footer,
  width = "md",
  disableClose = false,
}: ModalShellProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableClose) onClose();
    },
    [onClose, disableClose]
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-[10vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30"
        onClick={disableClose ? undefined : onClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full ${widthMap[width]} rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={disableClose}
            className="rounded-md p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-30"
            aria-label="关闭"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
