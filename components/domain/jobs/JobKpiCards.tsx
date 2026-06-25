"use client";

interface JobKpiCardsProps {
  total: number;
  highPriority: number;
  activeRecruiting: number;
  profileComplete: number;
}

export function JobKpiCards({ total, highPriority, activeRecruiting, profileComplete }: JobKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <KpiCard label="在招岗位" value={total} subtitle="当前开放岗位数" />
      <KpiCard label="高优先级" value={highPriority} subtitle="需优先推进" highlight />
      <KpiCard label="推进中" value={activeRecruiting} subtitle="有活跃候选人" />
      <KpiCard label="画像完整" value={profileComplete} subtitle="JD/画像已配置" />
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
