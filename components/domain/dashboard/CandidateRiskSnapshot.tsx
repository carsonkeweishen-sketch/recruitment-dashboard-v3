/** Candidate Risk Snapshot */

export function CandidateRiskSnapshot({ candidates }: { candidates: Array<Record<string, unknown>> | null }) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">候选人风险概览</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((c, idx) => {
          const labels = Array.isArray(c.riskLabels) ? c.riskLabels : [];
          return (
            <div key={idx} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                {String(c.candidateName ?? "—")}
              </h4>
              <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {String(c.jobTitle ?? "")}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {labels.map((label: string, i: number) => (
                  <span key={i} className="rounded-full bg-[var(--color-warning-light)] px-2 py-0.5 text-xs text-[var(--color-warning)]">
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                行动项：{String(c.openActions ?? 0)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
