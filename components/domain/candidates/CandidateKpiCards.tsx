"use client";

export function CandidateKpiCards({ total, active, multiJob, recent }: { total: number; active: number; multiJob: number; recent: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <KpiCard label="候选人总数" value={total} subtitle="当前候选人库" />
      <KpiCard label="推进中" value={active} subtitle="有活跃投递" highlight />
      <KpiCard label="多岗位投递" value={multiJob} subtitle="可转推其他岗位" />
      <KpiCard label="近7天新增" value={recent} subtitle="最近入库" />
    </div>
  );
}

function KpiCard({ label, value, subtitle, highlight }: { label: string; value: number; subtitle: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-[var(--color-warning)] bg-[var(--color-warning-light)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}>
      <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${highlight ? "text-[var(--color-warning)]" : "text-[var(--color-text-primary)]"}`}>{value}</div>
      <div className="mt-1 text-xs text-[var(--color-text-secondary)]">{subtitle}</div>
    </div>
  );
}
