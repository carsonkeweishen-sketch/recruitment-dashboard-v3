"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";

const HEALTH_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  healthy: "success",
  attention: "warning",
  risk: "danger",
};

const HEALTH_LABELS: Record<string, string> = {
  healthy: "健康",
  attention: "关注",
  risk: "风险",
};

interface JobHealthCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job: Record<string, any>;
  onClick: (id: string) => void;
}

export function JobHealthCard({ job, onClick }: JobHealthCardProps) {
  const healthLevel: string = job.healthLevel ?? "healthy";
  const riskLabels: string[] = Array.isArray(job.riskLabels) ? job.riskLabels : [];

  return (
    <button
      onClick={() => onClick(job.jobId)}
      className="w-full text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-border-strong)] transition-colors"
    >
      {/* Header: title + health badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {job.jobTitle ?? "—"}
          </h3>
          {job.department && (
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{job.department}</p>
          )}
        </div>
        <StatusBadge
          label={HEALTH_LABELS[healthLevel] ?? "健康"}
          variant={HEALTH_VARIANT[healthLevel] ?? "success"}
        />
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div>
          <span className="text-[var(--color-text-primary)] font-medium">{job.totalCandidates ?? 0}</span>
          <span className="text-[var(--color-text-tertiary)] ml-1">候选人</span>
        </div>
        <div>
          <span className="text-[var(--color-text-primary)] font-medium">{job.activeCandidates ?? 0}</span>
          <span className="text-[var(--color-text-tertiary)] ml-1">活跃</span>
        </div>
        <div>
          <span className="text-[var(--color-text-primary)] font-medium">{job.openActions ?? 0}</span>
          <span className="text-[var(--color-text-tertiary)] ml-1">行动项</span>
        </div>
        {(job.overdueActions ?? 0) > 0 && (
          <div>
            <span className="text-[var(--color-danger)] font-medium">{job.overdueActions}</span>
            <span className="text-[var(--color-danger)] ml-1 text-[10px]">逾期</span>
          </div>
        )}
      </div>

      {/* Risk labels */}
      {riskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {riskLabels.map((label: string, i: number) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-[var(--color-warning-light)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-warning)]"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Suggested action */}
      {job.suggestedAction && (
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1 truncate">
          → {job.suggestedAction}
        </p>
      )}

      {/* Owner info */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)]">
        {job.ownerName ? <span>{job.ownerName}</span> : null}
        {job.businessOwnerName ? <span>{job.businessOwnerName}</span> : null}
      </div>
    </button>
  );
}
