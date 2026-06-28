"use client";

interface ContextRef {
  refType: string;
  refId: string;
  sourceLabel: string;
  excerpt: string;
}

export function CopilotCitationList({ citations }: { citations: ContextRef[] }) {
  return (
    <div className="mt-2 pt-2 border-t border-[var(--color-border-light)]">
      <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">📎 引用证据（{citations.length}）</p>
      <div className="space-y-1">
        {citations.slice(0, 5).map((cite, i) => (
          <div key={i} className="text-xs text-[var(--color-text-tertiary)] flex items-start gap-1">
            <span className="shrink-0">[{i + 1}]</span>
            <span className="truncate">{cite.sourceLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
