"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PermissionState } from "@/components/ui/permission-state";
import { JobHealthCard } from "@/components/domain/jobs/JobHealthCard";
import { JobAnalysisDrawer } from "@/components/domain/jobs/JobAnalysisDrawer";
import { AICopilotPanel } from "@/components/domain/ai/AICopilotPanel";

const HEALTH_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "risk", label: "风险" },
  { value: "attention", label: "关注" },
  { value: "healthy", label: "健康" },
];

export default function JobsPage() {
  const [_aiOpen, _setAiOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [healthFilter, setHealthFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    let resStatus = 0;
    fetch("/api/jobs/analysis")
      .then((res) => { resStatus = res.status; return res.json(); })
      .then((d) => {
        if (cancelled) return;
        if (resStatus === 403 || d.error?.includes("权限")) {
          setPermissionDenied(true);
          return;
        }
        if (!d.success) { setError(d.error ?? "加载失败"); return; }
        setJobs(d.data ?? []);
      })
      .catch(() => { if (!cancelled) setError("网络错误"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = jobs.filter((j) => {
    if (healthFilter !== "all" && j.healthLevel !== healthFilter) return false;
    if (search && !String(j.jobTitle ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const riskCount = jobs.filter((j) => j.healthLevel === "risk").length;
  const totalCandidates = jobs.reduce((s: number, j: { totalCandidates?: number }) => s + (j.totalCandidates ?? 0), 0);
  const totalActions = jobs.reduce((s: number, j: { openActions?: number }) => s + (j.openActions ?? 0), 0);

  if (permissionDenied) {
    return (
      <ProductShell title="岗位分析" description="围绕岗位供给、漏斗转化、面试反馈、风险行动项和系统洞察，判断岗位招聘是否健康。">
        <PermissionState description="暂无权限查看岗位分析。如需查看，请联系招聘负责人或管理员。" />
      </ProductShell>
    );
  }

  if (error) {
    return (
      <ProductShell title="岗位分析" description="围绕岗位供给、漏斗转化、面试反馈、风险行动项和系统洞察，判断岗位招聘是否健康。">
        <ErrorState title="岗位分析加载失败" description={error} onRetry={() => window.location.reload()} />
      </ProductShell>
    );
  }

  if (loading) {
    return (
      <ProductShell title="岗位分析" description="围绕岗位供给、漏斗转化、面试反馈、风险行动项和系统洞察，判断岗位招聘是否健康。">
        <LoadingSkeleton />
      </ProductShell>
    );
  }

  return (
    <>
      <ProductShell
        title="岗位分析"
        description="围绕岗位供给、漏斗转化、面试反馈、风险行动项和系统洞察，判断岗位招聘是否健康。"
        kpiRow={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="进行中岗位" value={jobs.length} />
            <KpiCard label="风险岗位" value={riskCount} trendDirection={riskCount > 2 ? "up" : "flat"} />
            <KpiCard label="总候选人" value={totalCandidates} />
            <KpiCard label="待处理行动项" value={totalActions} href="/actions" />
          </div>
        }
        filterBar={
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-[var(--color-border)] p-0.5">
              {HEALTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHealthFilter(opt.value)}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    healthFilter === opt.value
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="搜索岗位..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState title="暂无匹配岗位" description="当前筛选条件下没有匹配的岗位。" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job) => (
              <JobHealthCard key={job.jobId} job={job} onClick={setSelectedJobId} />
            ))}
          </div>
        )}
      
      <button onClick={() => _setAiOpen(true)} className="fixed bottom-4 right-4 z-40 rounded-full bg-[var(--color-primary)] text-white px-4 py-2 shadow-lg text-sm font-medium hover:opacity-90 transition-opacity">AI 助手</button>
      {_aiOpen && <AICopilotPanel objectType="job" objectId={selectedJobId || ""} onClose={() => _setAiOpen(false)} />}
</ProductShell>
      <JobAnalysisDrawer jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
    </>
  );
}
