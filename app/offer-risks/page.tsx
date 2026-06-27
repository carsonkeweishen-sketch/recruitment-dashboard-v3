"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PermissionState } from "@/components/ui/permission-state";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const RISK_VARIANT: Record<string, "danger" | "warning" | "default"> = { urgent: "danger", high: "warning", medium: "default", low: "default" };
const RISK_LABEL: Record<string, string> = { urgent: "紧急", high: "高", medium: "中", low: "低" };

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

export default function OfferRisksPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [drawerData, setDrawerData] = useState<any>(null);

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

  if (permissionDenied) return <ProductShell title="Offer 风险" description="围绕候选人意向、薪酬预期、竞品机会、入职时间和未关闭行动项，辅助识别 Offer 成交风险。"><PermissionState description="暂无权限查看 Offer 风险分析" /></ProductShell>;
  if (error) return <ProductShell title="Offer 风险" description="围绕候选人意向、薪酬预期、竞品机会、入职时间和未关闭行动项，辅助识别 Offer 成交风险。"><ErrorState title="加载失败" description={error} onRetry={() => window.location.reload()} /></ProductShell>;
  if (loading) return <ProductShell title="Offer 风险" description="围绕候选人意向、薪酬预期、竞品机会、入职时间和未关闭行动项，辅助识别 Offer 成交风险。"><LoadingSkeleton /></ProductShell>;
  if (!data || data.length === 0) return <ProductShell title="Offer 风险" description="围绕候选人意向、薪酬预期、竞品机会、入职时间和未关闭行动项，辅助识别 Offer 成交风险。"><EmptyState title="暂无 Offer 风险数据" description="当候选人进入 Offer 阶段后，系统会在这里辅助识别成交风险。" /></ProductShell>;

  const urgent = data.filter(d => d.riskLevel === "urgent").length;
  const high = data.filter(d => d.riskLevel === "high").length;
  const totalActions = data.reduce((s, d) => s + (d.openActions || 0), 0);
  const totalOverdue = data.reduce((s, d) => s + (d.overdueActions || 0), 0);

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
            <OfferRiskCard key={i} risk={risk} onClick={() => setDrawerData(risk)} />
          ))}
        </div>
        {drawerData && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20" onClick={() => setDrawerData(null)} />
            <div className="relative w-full max-w-lg bg-[var(--color-surface)] h-full overflow-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Offer 风险详情</h2>
                <button onClick={() => setDrawerData(null)} className="text-sm text-[var(--color-text-tertiary)]">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <StatusBadge label={RISK_LABEL[drawerData.riskLevel]} variant={RISK_VARIANT[drawerData.riskLevel]} />
                  <h3 className="text-sm font-semibold mt-2">{drawerData.candidateName} · {drawerData.jobTitle}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">{drawerData.summary}</p>
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)] space-y-1">
                  <p>行动项: {drawerData.openActions} | 逾期: {drawerData.overdueActions}</p>
                  <p>负责人: {drawerData.ownerName}</p>
                  <p className="text-[var(--color-primary)]">→ {drawerData.suggestedAction}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProductShell>
  );
}
