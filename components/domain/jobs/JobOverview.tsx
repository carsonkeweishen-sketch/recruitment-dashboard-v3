/**
 * Job Overview Card — 岗位总览卡片
 *
 * 显示招聘人数/进度/成功率/风险标签。
 * 参考：Ashby Job Header / Greenhouse Job Dashboard
 */

"use client";

import { componentStyles } from "@/components/ui/design-tokens";
import { KpiCard } from "@/components/ui/kpi-card";

interface RiskSignal {
  type: string;
  label: string;
  detail: string;
}

interface CandidateMapItem {
  candidateId: string;
  candidateName: string;
  stage: string;
  status: string;
  isStuck: boolean;
}

interface OverviewData {
  jobId: string;
  jobTitle: string;
  jobCode: string | null;
  department: string | null;
  owner: string | null;
  businessOwner: string | null;
  headcount: number;
  totalCandidates: number;
  activeCandidates: number;
  hiredCount: number;
  successRate: number;
  progressRate: number;
  risks: RiskSignal[];
  openActions: number;
  candidateMapping: CandidateMapItem[];
}

const STAGE_LABELS: Record<string, string> = {
  sourced: "入库", hr_screen: "HR筛选", business_screen: "业务筛选",
  first_interview: "初试", second_interview: "复试", final_interview: "终面",
  offer_risk: "Offer风险", pre_onboarding: "入职前", hired: "已入职",
  rejected: "已淘汰", withdrawn: "退出", closed: "已关闭",
};

export function JobOverview({ data, loading }: { data: OverviewData | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/2 rounded bg-[var(--color-surface-tertiary)]" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 rounded-xl bg-[var(--color-surface-tertiary)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-sm text-[var(--color-text-secondary)] py-8 text-center">暂无数据</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="编制进度"
          value={`${data.totalCandidates}/${data.headcount}`}
          trendLabel={`完成率 ${data.progressRate}%`}
          trendDirection={data.progressRate >= 100 ? "up" : data.progressRate >= 50 ? "flat" : "down"}
        />
        <KpiCard
          label="已入职"
          value={data.hiredCount}
          trendLabel={`成功率 ${data.successRate}%`}
          trendDirection={data.successRate >= 50 ? "up" : "flat"}
        />
        <KpiCard
          label="活跃候选人"
          value={data.activeCandidates}
          trendDirection="flat"
        />
        <KpiCard
          label="待处理行动项"
          value={data.openActions}
          trendDirection={data.openActions > 3 ? "up" : "flat"}
          href={`/actions?jobId=${data.jobId}`}
        />
      </div>

      {/* Risk Signals */}
      {data.risks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            系统规则提醒
          </h4>
          <div className="space-y-2">
            {data.risks.map((risk) => (
              <div
                key={risk.type}
                className="flex items-start gap-3 rounded-xl border border-[var(--color-warning-light)] bg-[var(--color-warning-light)] px-4 py-3"
              >
                <span className="mt-0.5 text-sm">⚠️</span>
                <div>
                  <div className="text-sm font-medium text-[var(--color-warning)]">
                    {risk.label}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {risk.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Mapping */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">
          候选人分布（{data.candidateMapping.length} 人）
        </h4>
        {data.candidateMapping.length === 0 ? (
          <div className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
            暂无候选人
          </div>
        ) : (
          <div className={`${componentStyles.card} overflow-hidden`}>
            <div className="divide-y divide-[var(--color-border)]">
              {data.candidateMapping.map((c) => (
                <div
                  key={c.candidateId}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-secondary)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {c.candidateName}
                    </span>
                    <span className="shrink-0 rounded-full bg-[var(--color-surface-tertiary)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
                      {STAGE_LABELS[c.stage] || c.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.isStuck && (
                      <span className="rounded-full bg-[var(--color-danger-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-danger)]">
                        卡点
                      </span>
                    )}
                    <span className={`w-2 h-2 rounded-full ${
                      c.status === "active" ? "bg-emerald-500" :
                      c.status === "hired" ? "bg-blue-500" :
                      "bg-slate-300"
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
