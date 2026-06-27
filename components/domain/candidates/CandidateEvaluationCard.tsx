"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";

const MATCH_LABELS: Record<string, string> = {
  high: "高匹配",
  medium: "中等匹配",
  low: "低匹配",
  pending: "待评估",
};

const MATCH_VARIANTS: Record<string, "success" | "warning" | "danger" | "default"> = {
  high: "success",
  medium: "warning",
  low: "danger",
  pending: "default",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CandidateEvaluationCard({ candidate, onClick }: { candidate: any; onClick: () => void }) {
  const matchLabel = MATCH_LABELS[candidate.matchLevel ?? "pending"] ?? "待评估";
  const matchVariant = MATCH_VARIANTS[candidate.matchLevel ?? "pending"] ?? "default";

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-border-strong)] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {candidate.candidateName ?? "—"}
          </h3>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            {candidate.jobTitle ?? "—"} · {candidate.stage ?? "—"}
          </p>
        </div>
        <StatusBadge label={matchLabel} variant={matchVariant} />
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-3 text-xs">
        {candidate.riskCount > 0 ? (
          <span className="rounded-full bg-[var(--color-danger-light)] px-2 py-0.5 text-[var(--color-danger)] font-medium">
            {candidate.riskCount} 风险
          </span>
        ) : (
          <span className="text-[var(--color-text-tertiary)]">无风险</span>
        )}

        <span className="text-[var(--color-text-tertiary)]">
          证据: <span className="text-[var(--color-text-primary)] font-medium">{candidate.evidenceCount ?? 0}</span>
        </span>

        {candidate.openActions > 0 ? (
          <span className="text-[var(--color-danger)] font-medium">{candidate.openActions} 待办</span>
        ) : (
          <span className="text-[var(--color-text-tertiary)]">0 待办</span>
        )}

        {candidate.canTransfer ? (
          <span className="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[var(--color-primary)] text-xs">
            可转推
          </span>
        ) : null}
      </div>

      {/* Suggested action */}
      <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-secondary)]">
          → {candidate.suggestedAction ?? "正常推进中"}
        </p>
      </div>
    </button>
  );
}
