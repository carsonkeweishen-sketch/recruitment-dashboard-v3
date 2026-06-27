"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PermissionState } from "@/components/ui/permission-state";
import { CandidateEvaluationCard } from "@/components/domain/candidates/CandidateEvaluationCard";
import { CandidateAnalysisDrawer } from "@/components/domain/candidates/CandidateAnalysisDrawer";
import { AICopilotPanel } from "@/components/domain/ai/AICopilotPanel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CandidateItem = any;

export default function CandidatesPage() {
  const [_aiOpen, _setAiOpen] = useState(false);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/candidates/analysis");
        const d = await res.json();
        if (res.status === 403) { if (!cancelled) setPermissionDenied(true); return; }
        if (!d.success) { if (!cancelled) setError(d.error ?? "加载失败"); return; }
        if (!cancelled) setCandidates(d.data);
      } catch { if (!cancelled) setError("网络错误"); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = search
    ? candidates.filter((c) => String(c.candidateName ?? "").includes(search))
    : candidates;

  const totalCount = candidates.length;
  const highMatchCount = candidates.filter((c) => c.matchLevel === "high").length;
  const riskCount = candidates.filter((c) => c.riskCount > 0).length;
  const gapCount = candidates.filter((c) => c.evidenceGapCount > 0).length;
  const actionCount = candidates.filter((c) => c.openActions > 0).length;

  if (permissionDenied) {
    return (
      <ProductShell title="候选人评估" description="围绕候选人匹配度、面试证据、风险信号和行动闭环，辅助判断候选人是否适配当前岗位。">
        <PermissionState description="暂无权限查看候选人评估。如需查看，请联系招聘负责人或管理员。" />
      </ProductShell>
    );
  }

  if (error) {
    return (
      <ProductShell title="候选人评估" description="围绕候选人匹配度、面试证据、风险信号和行动闭环，辅助判断候选人是否适配当前岗位。">
        <ErrorState title="候选人评估加载失败" description={error} onRetry={() => window.location.reload()} />
      </ProductShell>
    );
  }

  if (loading) {
    return (
      <ProductShell title="候选人评估" description="围绕候选人匹配度、面试证据、风险信号和行动闭环，辅助判断候选人是否适配当前岗位。">
        <LoadingSkeleton />
      </ProductShell>
    );
  }

  if (candidates.length === 0) {
    return (
      <ProductShell title="候选人评估" description="围绕候选人匹配度、面试证据、风险信号和行动闭环，辅助判断候选人是否适配当前岗位。">
        <EmptyState title="暂无候选人数据" description="当前暂无候选人数据可供评估。" />
      </ProductShell>
    );
  }

  return (
    <ProductShell
      title="候选人评估"
      description="围绕候选人匹配度、面试证据、风险信号和行动闭环，辅助判断候选人是否适配当前岗位。"
      kpiRow={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="候选人数" value={totalCount} />
          <KpiCard label="高匹配" value={highMatchCount} />
          <KpiCard label="存在风险" value={riskCount} trendDirection={riskCount > 0 ? "up" : "flat"} />
          <KpiCard label="待补证据" value={gapCount} />
          <KpiCard label="未关闭Action" value={actionCount} href="/actions" />
        </div>
      }
      filterBar={
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="搜索候选人姓名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] w-64"
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <CandidateEvaluationCard
            key={c.candidateId}
            candidate={c}
            onClick={() => setSelectedId(c.candidateId)}
          />
        ))}
      </div>
      <CandidateAnalysisDrawer candidateId={selectedId} onClose={() => setSelectedId(null)} />
    
      <button onClick={() => _setAiOpen(true)} className="fixed bottom-4 right-4 z-40 rounded-full bg-[var(--color-primary)] text-white px-4 py-2 shadow-lg text-sm font-medium hover:opacity-90 transition-opacity">AI 助手</button>
      {_aiOpen && <AICopilotPanel objectType="candidate" objectId={selectedId || ""} onClose={() => _setAiOpen(false)} />}
</ProductShell>
  );
}
