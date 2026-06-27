"use client";
import { useState } from "react";

export function AINotConfiguredState() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
      <p className="text-lg mb-2">⚙️</p>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">AI Provider 未配置</h3>
      <p className="text-sm text-[var(--color-text-secondary)] mt-2">系统规则提醒仍可使用；配置 Provider 后可生成 AI 辅助建议。</p>
    </div>
  );
}
