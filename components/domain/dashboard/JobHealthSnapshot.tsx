/** Job Health Snapshot */
import { StatusBadge } from "@/components/ui/StatusBadge";

const HEALTH_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  healthy: { label: "健康", variant: "success" },
  attention: { label: "关注", variant: "warning" },
  risk: { label: "风险", variant: "danger" },
};

export function JobHealthSnapshot({ jobs }: { jobs: Array<Record<string, unknown>> | null }) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">岗位健康度</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job, idx) => {
          const health = HEALTH_CONFIG[String(job.healthLevel ?? "healthy")] || HEALTH_CONFIG.healthy;
          return (
            <div key={idx} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {String(job.jobTitle ?? "")}
                </h4>
                <StatusBadge label={health.label} variant={health.variant} />
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                <span>候选人：{String(job.candidateCount ?? 0)}</span>
                <span>行动项：{String(job.openActions ?? 0)}</span>
                {(Number(job.overdueActions) || 0) > 0 && (
                  <span className="text-[var(--color-danger)]">逾期 {String(job.overdueActions)}</span>
                )}
              </div>
              <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                {String(job.ownerName ?? "—")}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
