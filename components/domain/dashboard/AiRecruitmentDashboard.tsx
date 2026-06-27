/**
 * AI 招聘洞察看板 — 主页面组件
 * Phase 8.1: AI Recruitment Insight Dashboard v1
 *
 * 基于真实招聘数据 + 系统规则提醒生成可解释洞察。
 * 不接 OpenAI，不伪造 LLM 调用。
 */

"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { PermissionState } from "@/components/ui/permission-state";
import { EmptyState } from "@/components/ui/EmptyState";
import { AiHealthSummary } from "@/components/domain/dashboard/AiHealthSummary";
import { DashboardMetricGrid } from "@/components/domain/dashboard/DashboardMetricGrid";
import { RiskInsightCard } from "@/components/domain/dashboard/RiskInsightCard";
import { RiskRadarPanel } from "@/components/domain/dashboard/RiskRadarPanel";
import { PriorityActionsPanel } from "@/components/domain/dashboard/PriorityActionsPanel";
import { JobHealthSnapshot } from "@/components/domain/dashboard/JobHealthSnapshot";
import { CandidateRiskSnapshot } from "@/components/domain/dashboard/CandidateRiskSnapshot";
import { RecentActivityPanel } from "@/components/domain/dashboard/RecentActivityPanel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DashboardData = any;

const DASHBOARD_TITLE = "AI 招聘洞察看板";
const DASHBOARD_DESC =
  "基于招聘过程数据，辅助识别招聘风险、流程卡点和优先处理事项。系统仅提供辅助洞察，不替代 HR 或业务做录用、淘汰和阶段推进决策。";

export function AiRecruitmentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard/ai");
        const d = await res.json();
        if (res.status === 403) {
          if (!cancelled) setPermissionDenied(true);
          return;
        }
        if (!d.success) {
          if (!cancelled) setError(d.error ?? "加载失败");
          return;
        }
        if (!cancelled) setData(d.data);
      } catch {
        if (!cancelled) setError("网络错误，请稍后重试");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (permissionDenied) {
    return (
      <ProductShell title={DASHBOARD_TITLE} description={DASHBOARD_DESC}>
        <PermissionState description="暂无权限查看招聘洞察。当前账号没有访问该范围招聘数据的权限。如需查看，请联系招聘负责人或管理员。" />
      </ProductShell>
    );
  }

  if (error) {
    return (
      <ProductShell title={DASHBOARD_TITLE} description={DASHBOARD_DESC}>
        <ErrorState title="招聘洞察加载失败" description={error} onRetry={() => window.location.reload()} />
      </ProductShell>
    );
  }

  if (loading) {
    return (
      <ProductShell title={DASHBOARD_TITLE} description={DASHBOARD_DESC}>
        <LoadingSkeleton />
      </ProductShell>
    );
  }

  if (!data) {
    return (
      <ProductShell title={DASHBOARD_TITLE} description={DASHBOARD_DESC}>
        <EmptyState
          title="当前暂无足够招聘数据生成洞察"
          description="当岗位、候选人、面试反馈和行动项数据沉淀后，系统会在这里辅助识别招聘风险和优先处理事项。"
        />
      </ProductShell>
    );
  }

  const hasAnyData =
    (data.metrics?.openActionCount ?? 0) > 0 ||
    (data.metrics?.activeJobCount ?? 0) > 0 ||
    (data.metrics?.activeCandidateCount ?? 0) > 0;

  if (!hasAnyData) {
    return (
      <ProductShell title={DASHBOARD_TITLE} description={DASHBOARD_DESC}>
        <EmptyState
          title="当前暂无足够招聘数据生成洞察"
          description="当岗位、候选人、面试反馈和行动项数据沉淀后，系统会在这里辅助识别招聘风险和优先处理事项。"
        />
      </ProductShell>
    );
  }

  return (
    <ProductShell
      title="AI 招聘洞察看板"
      description="基于招聘过程数据，辅助识别招聘风险、流程卡点和优先处理事项。"
    >
      <div className="space-y-6">
        {/* 1. AI Health Summary */}
        <AiHealthSummary data={data.healthSummary} />

        {/* 2. KPI Cards */}
        <DashboardMetricGrid metrics={data.metrics} />

        {/* 3. Risk Insights */}
        {data.insights?.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              风险洞察
            </h3>
            <div className="space-y-3">
              {data.insights.map((insight: Record<string, unknown>, idx: number) => (
                <RiskInsightCard key={(insight.id as string) || idx} insight={insight} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Risk Radar + Priority Actions (side by side on large screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskRadarPanel items={data.riskRadar} />
          <PriorityActionsPanel actions={data.priorityActions} />
        </div>

        {/* 5. Job Health Snapshot */}
        {data.jobHealth?.length > 0 && (
          <JobHealthSnapshot jobs={data.jobHealth} />
        )}

        {/* 6. Candidate Risk Snapshot */}
        {data.candidateRisk?.length > 0 && (
          <CandidateRiskSnapshot candidates={data.candidateRisk} />
        )}

        {/* 7. Recent Activity */}
        <RecentActivityPanel activities={data.recentActivity} />
      </div>
    </ProductShell>
  );
}
