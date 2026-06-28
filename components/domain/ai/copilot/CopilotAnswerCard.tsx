"use client";

export function CopilotAnswerCard({ provider, model, promptVersion }: { provider?: string; model?: string; promptVersion?: string }) {
  return (
    <div className="mt-2 pt-2 border-t border-[var(--color-border-light)]">
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
        <span className="px-1.5 py-0.5 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium">AI 辅助建议</span>
        {provider && <span>· {provider}</span>}
        {model && <span>· {model}</span>}
        {promptVersion && <span className="font-mono">· {promptVersion}</span>}
      </div>
      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">⚠️ AI 辅助建议，仅供参考，不构成录用/淘汰决策依据。</p>
    </div>
  );
}
