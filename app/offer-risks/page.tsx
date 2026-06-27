"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { AICopilotPanel } from "@/components/domain/ai/AICopilotPanel";

const RISK_VARIANT: Record<string, "danger" | "warning" | "default"> = { urgent: "danger", high: "warning", medium: "default", low: "default" };
const RISK_LABEL: Record<string, string> = { urgent: "紧急", high: "高", medium: "中", low: "低" };
const LABELS: Record<string, string> = { ACTION_CREATED: "创建了行动项", CANDIDATE_CREATED: "创建了候选人档案", APPLICATION_CREATED: "创建了投递记录", INTERVIEW_FEEDBACK_SUBMITTED: "提交了面试反馈", ACTION_RESOLVED: "标记行动项为已解决" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OfferRiskCard({ risk, onClick }: { risk: any; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-border-strong)] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{risk.candidateName ?? "—"}</h3>
          <p className="text-xs text-[var(--color-text-tertiary)]">{risk.jobTitle ?? "—"}</p>
        </div>
        <StatusBadge label={RISK_LABEL[risk.riskLevel] ?? risk.riskLevel} variant={RISK_VARIANT[risk.riskLevel] ?? "default"} />
      </div>
      {risk.summary && <p className="text-sm text-[var(--color-text-secondary)] mb-2 line-clamp-2">{risk.summary}</p>}
      <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
        <span>行动项: {risk.openActions ?? 0}</span>
        {(risk.overdueActions ?? 0) > 0 && <span className="text-[var(--color-danger)]">逾期 {risk.overdueActions}</span>}
        <span className="ml-auto text-[var(--color-text-tertiary)]">{risk.ownerName ?? "—"}</span>
      </div>
      <p className="mt-2 text-xs text-[var(--color-primary)]">→ {risk.suggestedAction ?? "—"}</p>
    </button>
  );
}

type TabKey = "overview" | "risk-factors" | "intent" | "closing" | "actions" | "insights" | "activity";

export default function OfferRisksPage() {
  const [_aiOpen, _setAiOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/offer-risks/analysis")
      .then(r => r.json())
      .then(d => { if (!cancelled) { if (d.success) setData(d.data); else setError(d.error); } })
      .catch(() => { if (!cancelled) setError("加载失败"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const openDrawer = (riskId: string) => {
    setSelectedId(riskId);
    setDetailLoading(true);
    setTab("overview");
    fetch(`/api/offer-risks/${riskId}/analysis`)
      .then(r => r.json())
      .then(d => { setDetail(d.data || d); setDetailLoading(false); });
  };

  if (error) return <ProductShell title="Offer 风险" description="围绕候选人意向、薪酬预期、竞品机会、入职时间和未关闭行动项，辅助识别 Offer 成交风险。"><ErrorState title="加载失败" description={error} onRetry={() => window.location.reload()} /></ProductShell>;
  if (loading) return <ProductShell title="Offer 风险" description="围绕候选人意向、薪酬预期、竞品机会、入职时间和未关闭行动项，辅助识别 Offer 成交风险。"><LoadingSkeleton /></ProductShell>;
  if (!data || data.length === 0) return <ProductShell title="Offer 风险" description="围绕候选人意向、薪酬预期、竞品机会、入职时间和未关闭行动项，辅助识别 Offer 成交风险。"><EmptyState title="暂无 Offer 风险数据" description="当候选人进入 Offer 阶段后，系统会在这里辅助识别成交风险。" /></ProductShell>;

  const urgent = data.filter(d => d.riskLevel === "urgent").length;
  const high = data.filter(d => d.riskLevel === "high").length;
  const totalActions = data.reduce((s, d) => s + (d.openActions || 0), 0);
  const totalOverdue = data.reduce((s, d) => s + (d.overdueActions || 0), 0);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "overview", label: "概览" }, { key: "risk-factors", label: "风险因素" },
    { key: "intent", label: "意向" }, { key: "closing", label: "Closing" },
    { key: "actions", label: "行动" }, { key: "insights", label: "洞察" }, { key: "activity", label: "动态" },
  ];

  return (
    <ProductShell title="Offer 风险" description="围绕候选人意向、薪酬预期、竞品机会、入职时间和未关闭行动项，辅助识别 Offer 成交风险。">
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="风险总数" value={String(data.length)} />
          <KpiCard label="高风险/紧急" value={String(urgent + high)} />
          <KpiCard label="未关闭行动项" value={String(totalActions)} href="/actions?category=offer_risk" />
          <KpiCard label="逾期行动项" value={String(totalOverdue)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((risk, i) => (
            <OfferRiskCard key={i} risk={risk} onClick={() => openDrawer(risk.id)} />
          ))}
        </div>
      </div>

      {selectedId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedId(null)} />
          <div className="relative w-full max-w-lg bg-[var(--color-surface)] h-full overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Offer 风险详情</h2>
              <button onClick={() => setSelectedId(null)} className="text-sm text-[var(--color-text-tertiary)]">✕</button>
            </div>
            {detailLoading ? <LoadingSkeleton /> : detail ? (
              <>
                <div className="flex border-b border-[var(--color-border)] -mx-6 px-6 mb-4 overflow-x-auto">
                  {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2.5 text-sm font-medium transition-colors border-b-2 shrink-0 ${tab === t.key ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}>{t.label}</button>
                  ))}
                </div>
                {tab === "overview" && (
                  <div className="space-y-4" data-drawer-tab="overview">
                    <div><StatusBadge label={RISK_LABEL[detail.riskLevel]} variant={RISK_VARIANT[detail.riskLevel]} /><h3 className="text-sm font-semibold mt-2">{detail.candidateName} · {detail.jobTitle}</h3><p className="text-sm text-[var(--color-text-secondary)] mt-1">{detail.summary}</p></div>
                    <div className="text-xs text-[var(--color-text-tertiary)] space-y-1"><p>状态: {detail.status} | 负责人: {detail.ownerName}</p><p>风险类型: {detail.riskType}</p><p className="text-[var(--color-primary)]">→ {detail.suggestedAction}</p></div>
                  </div>
                )}
                {tab === "risk-factors" && (
                  <div className="space-y-3" data-drawer-tab="risk-factors">
                    {(detail.riskFactors || []).map((rf: Record<string,unknown>, i: number) => (
                      <div key={i} className="rounded-xl border border-[var(--color-border)] p-4" data-insight-card="true">
                        <div className="flex items-center gap-2 mb-1"><StatusBadge label={String(rf.riskLevel ?? "medium")} variant={RISK_VARIANT[String(rf.riskLevel)] ?? "default"} /><span className="text-xs text-[var(--color-text-tertiary)]" data-provenance="system_rule">生成方式：系统规则提醒</span></div>
                        <h4 className="text-sm font-semibold">{String(rf.title ?? "")}</h4><p className="text-sm text-[var(--color-text-secondary)]">{String(rf.summary ?? "")}</p>
                        <p className="mt-2 text-xs text-[var(--color-primary)]" data-suggested-action="true">→ {String(rf.suggestedFollowUp ?? "")}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">触发条件：{String(rf.triggerCondition ?? "")}</p>
                      </div>
                    ))}
                  </div>
                )}
                {tab === "intent" && <div className="space-y-3" data-drawer-tab="intent"><p className="text-sm text-[var(--color-text-secondary)]">候选人意向数据将通过面试反馈和风险信号综合分析。</p></div>}
                {tab === "closing" && (
                  <div className="space-y-3" data-drawer-tab="closing">
                    {(detail.closingPlan || []).map((cp: Record<string,unknown>, i: number) => (
                      <div key={i} className="rounded-xl border border-[var(--color-border)] p-4">
                        <h4 className="text-sm font-semibold">Closing 目标</h4><p className="text-sm text-[var(--color-text-secondary)]">{String(cp.closingGoal ?? "")}</p>
                        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">建议重点: {String(cp.suggestedFocus ?? "")}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">业务需补充: {String(cp.businessNeed ?? "")}</p>
                      </div>
                    ))}
                  </div>
                )}
                {tab === "actions" && (
                  <div className="space-y-2" data-drawer-tab="actions">
                    {(detail.actions || []).map((a: Record<string,unknown>, i: number) => (
                      <div key={i} className="rounded-xl border border-[var(--color-border)] p-3"><p className="text-sm font-medium">{String(a.title ?? "")}</p><div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]"><span>{String(a.priority ?? "")}</span><span>{String(a.status ?? "")}</span><span>{String(a.ownerName ?? "—")}</span></div></div>
                    ))}
                    {(!detail.actions || detail.actions.length === 0) && <p className="text-sm text-[var(--color-text-secondary)]">暂无关联行动项</p>}
                  </div>
                )}
                {tab === "insights" && (
                  <div className="space-y-3" data-drawer-tab="insights">
                    {(detail.insights || []).map((ins: Record<string,unknown>, i: number) => (
                      <div key={i} className="rounded-xl border border-[var(--color-border)] p-4" data-insight-card="true">
                        <div className="flex items-center gap-2 mb-1"><StatusBadge label={String(ins.category ?? "")} variant="warning" /><span className="text-xs text-[var(--color-text-tertiary)]" data-provenance="system_rule">生成方式：系统规则提醒</span></div>
                        <h4 className="text-sm font-semibold">{String(ins.title ?? "")}</h4><p className="text-sm text-[var(--color-text-secondary)]">{String(ins.summary ?? "")}</p>
                        <p className="mt-2 text-xs text-[var(--color-primary)]" data-suggested-action="true">→ {String(ins.suggestedAction ?? "")}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">触发条件：{String(ins.triggerCondition ?? "")}</p>
                      </div>
                    ))}
                    {(!detail.insights || detail.insights.length === 0) && <p className="text-sm text-[var(--color-text-secondary)]">暂无系统洞察</p>}
                  </div>
                )}
                {tab === "activity" && (
                  <div className="space-y-2" data-drawer-tab="activity">
                    {(detail.activity || []).map((a: Record<string,unknown>, i: number) => {
                      const actionLabel = LABELS[String(a.action ?? "")] || String(a.action);
                      return <div key={i} className="rounded-xl border border-[var(--color-border)] p-3"><p className="text-sm"><span className="font-medium">{String(a.actorName ?? "系统")}</span> {actionLabel}</p><p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{new Date(String(a.createdAt ?? "")).toLocaleString("zh-CN")}</p></div>;
                    })}
                    {(!detail.activity || detail.activity.length === 0) && <p className="text-sm text-[var(--color-text-secondary)]">暂无动态</p>}
                  </div>
                )}
              </>
            ) : <p className="text-sm text-[var(--color-text-secondary)]">加载失败</p>}
          </div>
        </div>
      )}
    
      <button onClick={() => _setAiOpen(true)} className="fixed bottom-4 right-4 z-40 rounded-full bg-[var(--color-primary)] text-white px-4 py-2 shadow-lg text-sm font-medium hover:opacity-90 transition-opacity">AI 助手</button>
      {_aiOpen && <AICopilotPanel objectType="offer_risk" objectId={selectedId || ""} onClose={() => _setAiOpen(false)} />}
</ProductShell>
  );
}
