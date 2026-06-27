"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PermissionState } from "@/components/ui/permission-state";
import { InterviewQualityCard } from "@/components/domain/interview-quality/InterviewQualityCard";
import { InterviewQualityDrawer } from "@/components/domain/interview-quality/InterviewQualityDrawer";

export default function InterviewQualityPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/interview-quality/analysis")
      .then(r => r.json())
      .then(d => { if (d.success) { if (!cancelled) setData(d.data); } else if (d.error?.includes("权限")) setPermissionDenied(true); else setError(d.error || "加载失败"); })
      .catch(() => setError("网络错误"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (permissionDenied) return <ProductShell title="面试质量" description="围绕面试反馈及时性、证据充分度、评分一致性和追问深度，辅助提升招聘判断质量。"><PermissionState /></ProductShell>;
  if (error) return <ProductShell title="面试质量" description="围绕面试反馈及时性、证据充分度、评分一致性和追问深度，辅助提升招聘判断质量。"><ErrorState title="加载失败" description={error} onRetry={() => window.location.reload()} /></ProductShell>;
  if (loading) return <ProductShell title="面试质量" description="围绕面试反馈及时性、证据充分度、评分一致性和追问深度，辅助提升招聘判断质量。"><LoadingSkeleton /></ProductShell>;

  const filtered = search ? data.filter(d => (d.candidateName || "").includes(search) || (d.jobTitle || "").includes(search)) : data;
  const total = data.length;
  const submitted = data.filter(d => d.status === "submitted").length;
  const pending = data.filter(d => d.status === "pending").length;
  const lowQuality = data.filter(d => (d.feedbackQualityScore || 100) < 60).length;
  const lowEvidence = data.filter(d => (d.evidenceScore || 100) < 40).length;

  return (
    <ProductShell
      title="面试质量"
      description="围绕面试反馈及时性、证据充分度、评分一致性和追问深度，辅助提升招聘判断质量。"
      kpiRow={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="面试总数" value={total} />
          <KpiCard label="已提交面评" value={submitted} />
          <KpiCard label="待提交面评" value={pending} trendDirection={pending > 0 ? "up" : "flat"} />
          <KpiCard label="低质量面评" value={lowQuality} trendDirection={lowQuality > 0 ? "up" : "flat"} />
          <KpiCard label="证据不足" value={lowEvidence} />
        </div>
      }
      filterBar={
        <input
          type="text" placeholder="搜索候选人或岗位..." value={search} onChange={e => setSearch(e.target.value)}
          className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] bg-[var(--color-surface)] w-64"
        />
      }
    >
      {filtered.length === 0 ? (
        <EmptyState title="暂无面试质量数据" description={search ? "当前筛选条件下没有匹配的面试记录" : "当面试反馈数据沉淀后，系统会在这里辅助分析面试质量。"} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => <InterviewQualityCard key={item.feedbackId} data={item} onSelect={setSelectedId} />)}
        </div>
      )}
      <InterviewQualityDrawer feedbackId={selectedId} onClose={() => setSelectedId(null)} />
    </ProductShell>
  );
}
