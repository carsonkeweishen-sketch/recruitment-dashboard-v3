"use client";

const riskColorMap: Record<string, string> = {
  danger: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
};

const stateColorMap: Record<string, string> = {
  sourcing: "bg-slate-100 text-slate-600",
  screening: "bg-blue-50 text-blue-600",
  interviewing: "bg-amber-50 text-amber-600",
  offering: "bg-purple-50 text-purple-600",
  fulfilled: "bg-emerald-50 text-emerald-600",
  closed: "bg-slate-100 text-slate-400",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function JobList({ jobs, onSelect, loading }: { jobs: any[]; onSelect: (id: string) => void; loading?: boolean }) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--color-surface-tertiary)]" />)}</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 text-4xl">📋</div>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">暂无岗位</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">当前筛选条件下没有匹配的岗位。</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="hidden border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-4 py-2.5 text-xs font-medium text-[var(--color-text-tertiary)] sm:grid sm:grid-cols-16">
        <span className="col-span-3">岗位</span>
        <span className="col-span-2">当前状态</span>
        <span className="col-span-2">风险分诊</span>
        <span className="col-span-2">最近事件</span>
        <span className="col-span-2">候选人</span>
        <span className="col-span-1">行动项</span>
        <span className="col-span-4">卡点原因</span>
      </div>

      {jobs.map((job) => {
        const riskColor = riskColorMap[job.riskColor ?? "success"] ?? riskColorMap.success;
        const stateColor = stateColorMap[job.currentState ?? "sourcing"] ?? stateColorMap.sourcing;

        return (
          <button
            key={job.id}
            onClick={() => onSelect(job.id)}
            className="w-full border-b border-[var(--color-border)] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--color-surface-secondary)] sm:grid sm:grid-cols-16 sm:items-center"
          >
            {/* Job title + dept */}
            <div className="col-span-3 min-w-0">
              <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">{job.title}</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">{job.department}{job.level ? ` · ${job.level}` : ""}</div>
            </div>

            {/* State — Event-driven, from State Machine */}
            <div className="col-span-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stateColor}`}>
                {job.currentStateLabel ?? "渠道寻源"}
              </span>
            </div>

            {/* Risk — from Rule Engine (Transition Validator) */}
            <div className="col-span-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${riskColor}`}>
                {job.riskType !== "pipeline_healthy" && <span className="text-[10px]">⚠</span>}
                {job.riskLabel ?? "流程健康"}
              </span>
            </div>

            {/* Recent Event — from ActivityLog */}
            <div className="col-span-2">
              <div className="text-xs text-[var(--color-text-secondary)]">
                {job.latestEventLabel ?? "—"}
              </div>
              {job.latestEventAt && (
                <div className="text-[10px] text-[var(--color-text-tertiary)]">
                  {new Date(job.latestEventAt).toLocaleDateString("zh-CN")}
                </div>
              )}
            </div>

            {/* Candidates */}
            <div className="col-span-2 text-sm">
              <span className="text-[var(--color-text-primary)] font-medium">{job.totalApplications}</span>
              <span className="text-[var(--color-text-tertiary)] text-xs ml-1">/ {job.activeApplications} 活跃</span>
            </div>

            {/* Actions */}
            <div className="col-span-1 text-sm">
              {(job.openActions ?? 0) > 0 ? (
                <span className="text-[var(--color-danger)] font-medium">{job.openActions} 待办</span>
              ) : (
                <span className="text-[var(--color-text-tertiary)]">—</span>
              )}
            </div>

            {/* Bottleneck Reason — from Rule Engine, with rule ID */}
            <div className="col-span-4 text-xs text-[var(--color-text-secondary)] truncate">
              {job.isBottleneck && job.bottleneckReason ? (
                <span className="text-[var(--color-warning)]">
                  {job.bottleneckReason}
                </span>
              ) : job.riskExplanation ? (
                <span className="text-[var(--color-text-tertiary)]">{job.riskExplanation}</span>
              ) : (
                <span className="text-[var(--color-text-tertiary)]">—</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
