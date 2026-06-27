"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AIProvenanceBlock({ result }: { result: Record<string, any> | null }) {
  if (!result) return null;
  return (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)] space-y-1">
      <p>生成方式：{result.generatedBy === "llm" ? "AI 辅助建议" : "系统规则提醒"}</p>
      {result.provider && <p>Provider: {String(result.provider)}</p>}
      {result.model && <p>Model: {String(result.model)}</p>}
      {result.promptVersion && <p>Prompt 版本: {String(result.promptVersion)}</p>}
      {result.createdAt && <p>生成时间: {new Date(String(result.createdAt)).toLocaleString("zh-CN")}</p>}
      <p className="text-[var(--color-warning)] mt-1">⚠️ AI 辅助建议，仅供参考</p>
    </div>
  );
}
