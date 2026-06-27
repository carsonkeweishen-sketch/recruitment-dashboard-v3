"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onSelect: (id: string) => void;
}

const QUALITY_LABELS: Record<string, string> = { good: "良好", needs_improvement: "需改进", insufficient: "证据不足" };
const QUALITY_VARIANT: Record<string, "success" | "warning" | "danger"> = { good: "success", needs_improvement: "warning", insufficient: "danger" };

export function InterviewQualityCard({ data, onSelect }: Props) {
  const isOverdue = data.isOverdue;
  const qualityLevel = data.qualityLevel || "needs_improvement";

  return (
    <button
      onClick={() => onSelect(data.feedbackId)}
      className="w-full text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-border-strong)] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {data.candidateName}
            </h4>
            <StatusBadge label={data.status === "submitted" ? "已提交" : "待提交"} variant={data.status === "submitted" ? "success" : "warning"} />
            {isOverdue && <StatusBadge label="逾期" variant="danger" />}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {data.jobTitle} · {data.round || "—"} · {data.interviewerName || "—"}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-[var(--color-text-primary)] font-medium">质量分: {data.feedbackQualityScore ?? "—"}</span>
            <span className="text-[var(--color-text-secondary)]">证据分: {data.evidenceScore ?? "—"}</span>
            <StatusBadge label={QUALITY_LABELS[qualityLevel] || qualityLevel} variant={QUALITY_VARIANT[qualityLevel] || "default"} />
          </div>
          {data.recommendation && (
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">推荐: {data.recommendation}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {data.openActions > 0 && (
              <span className="text-xs text-[var(--color-danger)]">{data.openActions} 行动项</span>
            )}
            {data.evidenceGaps?.length > 0 && (
              <span className="text-xs text-[var(--color-warning)]">{data.evidenceGaps.length} 证据缺口</span>
            )}
          </div>
          <p className="mt-1 text-xs text-[var(--color-primary)]">{data.suggestedAction}</p>
        </div>
      </div>
    </button>
  );
}
