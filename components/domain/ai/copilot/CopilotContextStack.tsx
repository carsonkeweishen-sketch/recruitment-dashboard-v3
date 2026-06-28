"use client";

interface ContextRef {
  refType: string;
  refId: string;
  sourceLabel: string;
  excerpt: string;
  hasEvidence: boolean;
}

export function CopilotContextStack({ sources }: { sources: ContextRef[] }) {
  if (sources.length === 0) {
    return <p className="text-xs text-[var(--color-text-tertiary)] mt-2">暂无可用上下文来源</p>;
  }
  return (
    <div className="mt-2 space-y-1">
      {sources.map((src, i) => (
        <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded bg-[var(--color-surface-tertiary)]">
          <span className="text-xs shrink-0 mt-0.5">{src.hasEvidence ? "✅" : "⚠️"}</span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--color-text-secondary)] truncate">{src.sourceLabel}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-2">{src.excerpt?.substring(0, 100)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
