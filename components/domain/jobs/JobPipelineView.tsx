/**
 * Job Pipeline View — 水平阶段管道视图
 *
 * Sourced → Screening → Interview → Offer → Hired
 * 每阶段显示人数/转化率/卡点标记。
 * 参考：Ashby Pipeline / Greenhouse Stage View
 */

"use client";

// design-tokens used via CSS variables in className strings

interface StageInfo {
  stage: string;
  label: string;
  count: number;
  conversionFromPrev: number | null;
  isBottleneck: boolean;
  bottleneckReason: string | null;
}

interface PipelineData {
  jobId: string;
  jobTitle: string;
  totalCandidates: number;
  activeCandidates: number;
  hiredCount: number;
  stages: StageInfo[];
  bottleneckCount: number;
  openActions: number;
}

export function JobPipelineView({ data, loading }: { data: PipelineData | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/3 rounded bg-[var(--color-surface-tertiary)]" />
        <div className="h-16 rounded-xl bg-[var(--color-surface-tertiary)]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-sm text-[var(--color-text-secondary)] py-8 text-center">
        暂无管道数据
      </div>
    );
  }

  const stages = data.stages;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--color-text-secondary)]">
          共 <strong className="text-[var(--color-text-primary)]">{data.totalCandidates}</strong> 位候选人
          · 活跃 <strong className="text-[var(--color-text-primary)]">{data.activeCandidates}</strong>
          · 已入职 <strong className="text-[var(--color-success)]">{data.hiredCount}</strong>
        </span>
        {data.bottleneckCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-danger-light)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-danger)]">
            ⚠ {data.bottleneckCount} 个卡点
          </span>
        )}
      </div>

      {/* Pipeline stages */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 min-w-[800px]">
          {stages.map((stage, idx) => {
            const isActive = stage.count > 0;

            return (
              <div key={stage.stage} className="flex-1 min-w-0">
                {/* Stage card */}
                <div
                  className={`rounded-xl border p-3 text-center transition-colors ${
                    stage.isBottleneck
                      ? "border-[var(--color-danger)] bg-[var(--color-danger-light)]"
                      : isActive
                        ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-secondary)] opacity-60"
                  }`}
                >
                  <div className="text-xs text-[var(--color-text-tertiary)] mb-1">
                    {stage.label}
                  </div>
                  <div className={`text-xl font-semibold ${
                    stage.isBottleneck
                      ? "text-[var(--color-danger)]"
                      : isActive
                        ? "text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-tertiary)]"
                  }`}>
                    {stage.count}
                  </div>
                  {idx > 0 && stage.conversionFromPrev !== null && (
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {stage.conversionFromPrev}% →
                    </div>
                  )}
                </div>

                {/* Bottleneck indicator */}
                {stage.isBottleneck && stage.bottleneckReason && (
                  <div className="mt-1.5 rounded-lg bg-[var(--color-danger-light)] px-2 py-1 text-xs text-[var(--color-danger)]">
                    {stage.bottleneckReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action link */}
      {data.openActions > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--color-text-secondary)]">
            关联行动项：
          </span>
          <a
            href={`/actions?jobId=${data.jobId}`}
            className="text-[var(--color-primary)] hover:underline font-medium"
          >
            {data.openActions} 个待处理 →
          </a>
        </div>
      )}
    </div>
  );
}
