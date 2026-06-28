"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// ============================================================================
// Types (extended for Final UI/UX Polish)
// ============================================================================

interface ActionSummary {
  open: number;
  inProgress: number;
  overdue: number;
  resolved: number;
}

interface SystemInsight {
  title: string;
  triggerCondition: string;
  evidence: string[];
  suggestedAction: string;
  generatedBy: string;
}

interface StageMetric {
  stageKey: string;
  label: string;
  count: number;
  conversionRate: number | null;
  dropoffCount: number | null;
  dropoffRate: number | null;
  avgDurationDays: number | null;
  durationThresholdDays: number | null;
  isBottleneck: boolean;
  bottleneckReason?: string;
  actionSummary: ActionSummary;
  systemInsight: SystemInsight | null;
}

interface TopBottleneck {
  stageKey: string;
  stageLabel: string;
  dropoffCount: number | null;
  conversionRate: number | null;
  avgDurationDays: number | null;
  durationThresholdDays: number | null;
  reason: string | null;
  actionSummary: ActionSummary;
  systemInsight: SystemInsight | null;
}

interface FunnelSummary {
  applications: number;
  resumePassRate: number | null;
  feedbackSubmitRate: number | null;
  offerRiskRate: number | null;
  avgStageDurationDays: number | null;
  overdueActionRate: number | null;
  closedCount: number;
  interviewPassCount: number;
  totalCandidates: number;
}

interface JobMetric {
  jobId: string;
  jobTitle: string;
  departmentId: string;
  applications: number;
  screenPassed: number;
  interviewCompleted: number;
  interviewPassed: number;
  offerRisks: number;
  closed: number;
  screenPassRate: number | null;
  interviewPassRate: number | null;
  offerRiskRate: number | null;
}

interface ChannelMetric {
  channel: string;
  applications: number;
  screenPassed: number;
  interviewCompleted: number;
  interviewPassed: number;
  screenPassRate: number | null;
  interviewPassRate: number | null;
}

interface FunnelInsight {
  insightKey: string;
  generatedBy: string;
  severity: "info" | "warning" | "critical";
  triggerCondition: string;
  evidence: string;
  suggestedAction: string;
}

interface ActionImpact {
  total: number;
  open: number;
  overdue: number;
  resolved: number;
  closureRate: number | null;
  perCategory: Record<string, number>;
  overdueList: { id: string; title: string; dueAt: string; priority: string; jobTitle: string | null }[];
}

interface DataQualityWarning {
  field: string;
  message: string;
  severity: string;
}

interface FunnelData {
  summary: FunnelSummary;
  stages: StageMetric[];
  topBottleneck: TopBottleneck | null;
  byJob: JobMetric[];
  byChannel: ChannelMetric[];
  actionImpact: ActionImpact;
  insights: FunnelInsight[];
  dataQualityWarnings: DataQualityWarning[];
  scopeInfo: { role: string; scope: string };
  generatedAt: string;
}

// ============================================================================
// Helpers
// ============================================================================

function fmtRate(r: number | null): string {
  if (r === null || r === undefined) return "---";
  return `${Math.round(r * 100)}%`;
}

function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined) return "---";
  return String(n);
}

function fmtDays(d: number | null): string {
  if (d === null || d === undefined) return "---";
  if (d === 0) return "<1天";
  return `${d.toFixed(1)}天`;
}

const severityVariant: Record<string, "info" | "warning" | "danger" | "default"> = {
  info: "info",
  warning: "warning",
  critical: "danger",
};

const severityColor: Record<string, string> = {
  info: "border-l-[var(--color-primary)]",
  warning: "border-l-[var(--color-warning)]",
  critical: "border-l-[var(--color-danger)]",
};

// ============================================================================
// Main Page
// ============================================================================

export default function RecruitmentFunnelPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");

  // Expanded sections
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [showJobTable, setShowJobTable] = useState(true);
  const [showChannelTable, setShowChannelTable] = useState(true);
  const [showOverdueActions, setShowOverdueActions] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (jobFilter) params.set("jobId", jobFilter);
    if (channelFilter) params.set("channel", channelFilter);

    fetch(`/api/analytics/recruitment-funnel/summary?${params.toString()}`)
      .then((r) => {
        if (r.status === 403) { setPermissionDenied(true); throw new Error("perm"); }
        return r.json();
      })
      .then((d) => {
        if (!d.success) { setError(d.error || "加载失败"); return; }
        setData(d.data);
      })
      .catch((e) => {
        if ((e as Error).message !== "perm") setError("招聘漏斗加载失败");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = () => { fetchData(); };

  // ==========================================================================
  // Permission Denied
  // ==========================================================================
  if (permissionDenied) {
    return (
      <ProductShell title="招聘漏斗" description="暂无权限访问招聘数据漏斗">
        <EmptyState title="暂无权限" description="您当前的权限级别无法查看招聘漏斗分析数据。如需访问请联系管理员。" />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Error
  // ==========================================================================
  if (error && !data) {
    return (
      <ProductShell title="招聘漏斗" description="招聘数据漏斗与转化分析">
        <ErrorState title="加载失败" description={error} onRetry={fetchData} />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Loading
  // ==========================================================================
  if (loading && !data) {
    return (
      <ProductShell title="招聘漏斗" description="招聘数据漏斗与转化分析">
        <LoadingSkeleton />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Empty
  // ==========================================================================
  if (!data || data.stages.length === 0) {
    return (
      <ProductShell title="招聘漏斗" description="招聘数据漏斗与转化分析">
        <EmptyState title="暂无漏斗数据" description="当前没有足够的招聘数据来生成漏斗分析。" />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Main Content
  // ==========================================================================
  const { summary, stages, topBottleneck, byJob, byChannel, actionImpact, insights, dataQualityWarnings, generatedAt } = data;
  const maxStageCount = Math.max(...stages.map((s) => s.count), 1);
  const bottleneckStageKey = topBottleneck?.stageKey || stages.find(s => s.isBottleneck)?.stageKey || null;

  return (
    <ProductShell
      title="招聘漏斗"
      description="从全局、岗位、渠道和阶段视角分析招聘转化、卡点和行动闭环效果 — 管理层30秒看清最大卡点"
      kpiRow={
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <KpiCard label="投递量" value={summary.applications} />
          <KpiCard label="简历通过率" value={fmtRate(summary.resumePassRate)} trendDirection={summary.resumePassRate !== null && summary.resumePassRate >= 0.6 ? "up" : "down"} />
          <KpiCard label="面试转化率" value={fmtRate(stages.find((s) => s.stageKey === "interview_completed")?.conversionRate ?? null)} />
          <KpiCard label="Offer风险率" value={fmtRate(summary.offerRiskRate)} trendDirection="down" />
          <KpiCard label="逾期Action率" value={fmtRate(summary.overdueActionRate)} trendDirection={summary.overdueActionRate !== null && summary.overdueActionRate > 0.3 ? "up" : "down"} />
          <KpiCard label="已关闭" value={summary.closedCount} />
        </div>
      }
      filterBar={
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-tertiary)]">开始日期</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-tertiary)]">结束日期</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-tertiary)]">岗位</label>
            <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
              <option value="">全部岗位</option>
              {byJob.map((j) => <option key={j.jobId} value={j.jobId}>{j.jobTitle}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-tertiary)]">渠道</label>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
              <option value="">全部渠道</option>
              {byChannel.map((c) => <option key={c.channel} value={c.channel}>{c.channel}</option>)}
            </select>
          </div>
          <button onClick={handleFilter}
            className="rounded-lg bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
            筛选
          </button>
          {generatedAt && (
            <span className="text-xs text-[var(--color-text-tertiary)] ml-auto self-end">
              更新于 {new Date(generatedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* P0-1: Top Bottleneck Summary — 首屏最大卡点结论 */}
        {topBottleneck && (
          <div className="rounded-2xl border-2 border-[var(--color-danger)] bg-[var(--color-danger-light)]/10 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">🚨</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge label="当前最大卡点" variant="danger" />
                  <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                    {topBottleneck.stageLabel} — 流失 {fmtNum(topBottleneck.dropoffCount)} 人
                    {topBottleneck.conversionRate !== null && (
                      <span className="text-[var(--color-danger)] ml-2">（转化率仅 {fmtRate(topBottleneck.conversionRate)}）</span>
                    )}
                  </h2>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  {topBottleneck.reason}
                  {topBottleneck.avgDurationDays !== null && (
                    <span> · 平均停留 {fmtDays(topBottleneck.avgDurationDays)}
                      {topBottleneck.durationThresholdDays !== null && (
                        <span className="text-[var(--color-warning)]"> / 阈值 {topBottleneck.durationThresholdDays} 天</span>
                      )}
                    </span>
                  )}
                </p>
                {topBottleneck.systemInsight && (
                  <div className="rounded-xl border border-[var(--color-warning-light)] bg-[var(--color-surface)] p-3 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge label="系统规则提醒" variant="warning" />
                      <span className="text-xs text-[var(--color-text-tertiary)]">generatedBy=system_rule</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-primary)] font-medium">{topBottleneck.systemInsight.triggerCondition}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{topBottleneck.systemInsight.evidence[0]}</p>
                    <p className="text-xs text-[var(--color-primary)] mt-1">建议：{topBottleneck.systemInsight.suggestedAction}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                  <span>Action: 待处理 {topBottleneck.actionSummary.open} · 进行中 {topBottleneck.actionSummary.inProgress} · 逾期 {topBottleneck.actionSummary.overdue} · 已解决 {topBottleneck.actionSummary.resolved}</span>
                  <a href={`/actions?source=funnel&stage=${topBottleneck.stageKey}`} className="text-[var(--color-primary)] hover:underline font-medium">
                    前往 Action Center →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Quality Warnings */}
        {dataQualityWarnings.length > 0 && (
          <div className="rounded-2xl border border-[var(--color-warning-light)] bg-[var(--color-warning-light)]/10 p-4">
            <h3 className="text-sm font-semibold text-[var(--color-warning)] mb-2">数据质量提示</h3>
            <div className="space-y-1">
              {dataQualityWarnings.map((w, i) => (
                <p key={i} className="text-xs text-[var(--color-text-secondary)]">
                  {w.severity === "warning" ? "⚠️" : "ℹ️"} {w.message}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* P0-1+2: Main Funnel with bottleneck highlight + absolute dropoff */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">招聘转化漏斗</h2>
          <div className="space-y-2">
            {stages.map((stage, idx) => {
              const barWidth = maxStageCount > 0 ? (stage.count / maxStageCount) * 100 : 0;
              const isBottleneck = stage.isBottleneck;

              return (
                <div key={stage.stageKey}>
                  <div className={`flex items-center gap-4 ${isBottleneck ? "bg-[var(--color-danger-light)]/10 rounded-lg -mx-2 px-2 py-1" : ""}`}>
                    <div className="w-32 shrink-0 text-right flex items-center justify-end gap-1">
                      {isBottleneck && <StatusBadge label="卡点" variant="danger" />}
                      <span className={`text-sm font-medium ${isBottleneck ? "text-[var(--color-danger)]" : "text-[var(--color-text-primary)]"}`}>{stage.label}</span>
                    </div>
                    <div className="flex-1 relative">
                      <div
                        className="h-9 rounded-lg transition-all duration-500 flex items-center justify-center min-w-[40px]"
                        style={{
                          width: `${Math.max(barWidth, 3)}%`,
                          backgroundColor: isBottleneck ? "var(--color-danger)" :
                            idx < 4 ? "var(--color-primary)" :
                            idx < 7 ? "var(--color-warning)" :
                            "var(--color-text-tertiary)",
                          opacity: isBottleneck ? 1 : 0.85,
                        }}
                      >
                        <span className="text-sm font-bold text-white drop-shadow-sm">{stage.count}</span>
                      </div>
                    </div>
                    <div className="w-40 shrink-0 text-left">
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        转化 {fmtRate(stage.conversionRate)}
                      </span>
                      {stage.dropoffCount !== null && stage.dropoffCount > 0 && (
                        <span className={`text-xs ml-1 ${isBottleneck ? "text-[var(--color-danger)] font-bold" : "text-[var(--color-danger)]"}`}>
                          流失 {stage.dropoffCount} 人
                        </span>
                      )}
                    </div>
                  </div>
                  {stage.dropoffCount !== null && stage.dropoffCount > 0 && idx < stages.length - 1 && (
                    <div className="flex items-center gap-4 ml-32 my-1">
                      <div className="flex-1 flex items-center gap-2">
                        <div className={`h-px flex-1 border-t border-dashed ${isBottleneck ? "border-[var(--color-danger)]" : "border-[var(--color-danger-light)]"}`} />
                        <span className={`text-[10px] font-medium whitespace-nowrap ${isBottleneck ? "text-[var(--color-danger)]" : "text-[var(--color-text-tertiary)]"}`}>
                          ↓{stage.dropoffCount} 人
                        </span>
                        <div className={`h-px flex-1 border-t border-dashed ${isBottleneck ? "border-[var(--color-danger)]" : "border-[var(--color-danger-light)]"}`} />
                      </div>
                      <div className="w-40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottleneck Insights with stage linkage */}
        {insights.length > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">系统洞察与卡点分析</h2>
              <StatusBadge label={`system_rule · ${insights.length}条`} variant="info" />
              <span className="text-[10px] text-[var(--color-text-tertiary)] ml-auto">系统规则：确定性分析</span>
            </div>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.insightKey}
                  className={`rounded-xl border-l-4 p-4 bg-[var(--color-surface-tertiary)] cursor-pointer transition-colors hover:bg-[var(--color-surface-secondary)] ${severityColor[insight.severity] || ""}`}
                  onClick={() => setExpandedInsight(expandedInsight === insight.insightKey ? null : insight.insightKey)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge label={insight.severity === "critical" ? "严重" : insight.severity === "warning" ? "警告" : "提示"} variant={severityVariant[insight.severity] || "default"} />
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{insight.insightKey}</span>
                        {bottleneckStageKey && (
                          <span className="text-[10px] text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-full px-2 py-0.5">
                            关联瓶颈：{stages.find(s => s.stageKey === bottleneckStageKey)?.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">{insight.triggerCondition}</p>
                    </div>
                  </div>
                  {expandedInsight === insight.insightKey && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-2">
                      <div>
                        <span className="text-xs font-medium text-[var(--color-text-tertiary)]">证据：</span>
                        <span className="text-xs text-[var(--color-text-secondary)]">{insight.evidence}</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-[var(--color-text-tertiary)]">建议动作：</span>
                        <span className="text-xs text-[var(--color-primary)]">{insight.suggestedAction}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Comparison + Channel Quality */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Comparison — sorted by risk (worst first) */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">岗位对比（按转化异常排序）</h2>
              <button onClick={() => setShowJobTable(!showJobTable)} className="text-xs text-[var(--color-primary)] hover:underline">
                {showJobTable ? "收起" : "展开"}
              </button>
            </div>
            {showJobTable && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">岗位</th>
                      <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">投递</th>
                      <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">简历通过</th>
                      <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">面试通过</th>
                      <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">Offer风险</th>
                      <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">已关闭</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byJob.map((job, idx) => {
                      const isWorst = idx === 0 && job.applications > 0;
                      return (
                        <tr key={job.jobId} className={`border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-tertiary)] ${isWorst ? "bg-[var(--color-danger-light)]/5" : ""}`}>
                          <td className="py-2 text-[var(--color-text-primary)] font-medium truncate max-w-[120px]">
                            {isWorst && <span className="text-[var(--color-danger)] mr-1">⚠</span>}
                            {job.jobTitle}
                          </td>
                          <td className="py-2 text-right text-[var(--color-text-secondary)]">{job.applications}</td>
                          <td className="py-2 text-right text-[var(--color-text-secondary)]">{fmtRate(job.screenPassRate)}</td>
                          <td className="py-2 text-right text-[var(--color-text-secondary)]">{fmtRate(job.interviewPassRate)}</td>
                          <td className="py-2 text-right">
                            {job.offerRiskRate !== null && job.offerRiskRate > 0.3
                              ? <span className="text-[var(--color-danger)]">{fmtRate(job.offerRiskRate)}</span>
                              : <span className="text-[var(--color-text-secondary)]">{fmtRate(job.offerRiskRate)}</span>
                            }
                          </td>
                          <td className="py-2 text-right text-[var(--color-text-secondary)]">{job.closed}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Channel Quality */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">渠道质量</h2>
              <button onClick={() => setShowChannelTable(!showChannelTable)} className="text-xs text-[var(--color-primary)] hover:underline">
                {showChannelTable ? "收起" : "展开"}
              </button>
            </div>
            {showChannelTable && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-2 font-medium text-[var(--color-text-tertiary)]">渠道</th>
                      <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">投递</th>
                      <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">简历通过</th>
                      <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">面试通过</th>
                      <th className="text-right py-2 font-medium text-[var(--color-text-tertiary)]">质量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byChannel.map((ch) => {
                      const qualityScore = ch.interviewPassRate !== null
                        ? ch.interviewPassRate >= 0.5 ? "高" : ch.interviewPassRate >= 0.25 ? "中" : "低"
                        : "---";
                      return (
                        <tr key={ch.channel} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-tertiary)]">
                          <td className="py-2 text-[var(--color-text-primary)] font-medium">{ch.channel}</td>
                          <td className="py-2 text-right text-[var(--color-text-secondary)]">{ch.applications}</td>
                          <td className="py-2 text-right text-[var(--color-text-secondary)]">{fmtRate(ch.screenPassRate)}</td>
                          <td className="py-2 text-right text-[var(--color-text-secondary)]">{fmtRate(ch.interviewPassRate)}</td>
                          <td className="py-2 text-right">
                            <StatusBadge label={qualityScore} variant={qualityScore === "高" ? "success" : qualityScore === "中" ? "warning" : "default"} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* P0-4: Action Impact with jump to Action Center */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Action 影响分析</h2>
            <div className="flex items-center gap-2">
              <StatusBadge label={`${actionImpact.total} 个Action`} variant="info" />
              {bottleneckStageKey && (
                <a href={`/actions?source=funnel&stage=${bottleneckStageKey}`} className="text-xs text-[var(--color-primary)] hover:underline font-medium">
                  前往 Action Center →
                </a>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-[var(--color-surface-tertiary)]">
              <div className="text-2xl font-bold text-[var(--color-text-primary)]">{actionImpact.open}</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">待处理</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-[var(--color-danger-light)]">
              <div className="text-2xl font-bold text-[var(--color-danger)]">{actionImpact.overdue}</div>
              <div className="text-xs text-[var(--color-danger)]">已逾期</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-[var(--color-success-light)]">
              <div className="text-2xl font-bold text-[var(--color-success)]">{actionImpact.resolved}</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">已关闭</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-[var(--color-surface-tertiary)]">
              <div className="text-2xl font-bold text-[var(--color-text-primary)]">{fmtRate(actionImpact.closureRate)}</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">关闭率</div>
            </div>
          </div>
          <button onClick={() => setShowOverdueActions(!showOverdueActions)} className="text-xs text-[var(--color-primary)] hover:underline">
            {showOverdueActions ? "收起逾期Action" : `查看 ${actionImpact.overdue} 个逾期Action`}
          </button>
          {showOverdueActions && actionImpact.overdueList.length > 0 && (
            <div className="mt-3 space-y-2">
              {actionImpact.overdueList.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3">
                  <div>
                    <p className="text-sm text-[var(--color-text-primary)]">{a.title}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">截止 {a.dueAt ? new Date(a.dueAt).toLocaleDateString("zh-CN") : "---"} · {a.jobTitle || "无关联岗位"}</p>
                  </div>
                  <StatusBadge label={a.priority === "high" ? "高优" : a.priority === "medium" ? "中优" : "低优"} variant={a.priority === "high" ? "danger" : "warning"} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* system_rule vs AI Copilot labels */}
        <div className="rounded-2xl border border-dashed border-[var(--color-primary-light)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center gap-3">
            <span className="text-lg">🤖</span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">AI Copilot — 辅助建议，仅供参考</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                AI Copilot 可基于当前漏斗数据、知识库证据和系统规则洞察，为管理层解释招聘瓶颈原因。
                回答必须基于有权限的 funnel evidence / Knowledge citation，没有证据时提示证据不足。
              </p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge label="system_rule" variant="info" />
                <span className="text-[10px] text-[var(--color-text-tertiary)]">确定性规则 · 不需要 LLM</span>
                <StatusBadge label="AI Copilot" variant="default" />
                <span className="text-[10px] text-[var(--color-text-tertiary)]">辅助建议 · 仅供参考 · 需 evidence/citation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProductShell>
  );
}
