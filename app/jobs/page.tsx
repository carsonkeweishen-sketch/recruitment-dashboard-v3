"use client";

import { useEffect, useState, useCallback } from "react";
import { JobFilters } from "@/components/domain/jobs/JobFilters";
import { JobList } from "@/components/domain/jobs/JobList";
import { JobPipelineView } from "@/components/domain/jobs/JobPipelineView";
import { JobOverview } from "@/components/domain/jobs/JobOverview";
import { ErrorState } from "@/components/ui/ErrorState";
import { PermissionDenied } from "@/components/ui/PermissionDenied";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";

interface JobItem {
  id: string;
  jobCode: string | null;
  title: string;
  department: string;
  level: string | null;
  status: string;
  priority: string;
  owner: { name: string } | null;
  businessOwner: { name: string } | null;
  brandLine: string | null;
  totalApplications: number;
  activeApplications: number;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PipelineData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OverviewData = any;

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Pipeline + Overview data for selected job
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // View mode: list | detail
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  const fetchJobs = useCallback(async (activeFilters: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(activeFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      if (res.status === 403) { setError("permission_denied"); setJobs([]); return; }
      if (!data.success) { setError(data.error ?? "加载失败"); setJobs([]); return; }
      setJobs(data.data);
    } catch { setError("网络错误，请稍后重试"); setJobs([]); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchJobs(filters); }, [filters, fetchJobs]);

  // Load pipeline + overview when a job is selected
  useEffect(() => {
    if (!selectedJobId) return;
    let cancelled = false;

    async function loadPipeline() {
      setPipelineLoading(true);
      try {
        const res = await fetch(`/api/jobs/${selectedJobId}/pipeline`);
        const d = await res.json();
        if (!cancelled && d.success) setPipelineData(d.data);
      } catch { /* keep previous */ }
      finally { if (!cancelled) setPipelineLoading(false); }
    }

    async function loadOverview() {
      setOverviewLoading(true);
      try {
        const res = await fetch(`/api/jobs/${selectedJobId}/overview`);
        const d = await res.json();
        if (!cancelled && d.success) setOverviewData(d.data);
      } catch { /* keep previous */ }
      finally { if (!cancelled) setOverviewLoading(false); }
    }

    loadPipeline();
    loadOverview();
    return () => { cancelled = true; };
  }, [selectedJobId]);

  const departments = [...new Set(jobs.map((j) => j.department).filter(Boolean))];
  const brandLines = [...new Set(jobs.map((j) => j.brandLine).filter(Boolean))] as string[];

  const highPriority = jobs.filter((j) => j.priority === "high").length;
  const activeRecruiting = jobs.filter((j) => j.activeApplications > 0).length;
  const totalCandidates = jobs.reduce((sum, j) => sum + j.totalApplications, 0);

  if (error === "permission_denied") return <PermissionDenied message="您没有权限访问岗位管理。请切换角色或联系管理员。" />;
  if (error) return <ErrorState title="加载失败" description={error} onRetry={() => fetchJobs(filters)} />;

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setSelectedJobId(null);
    setPipelineData(null);
    setOverviewData(null);
    setViewMode("list");
  };

  // Detail view: show pipeline + overview for selected job
  if (viewMode === "detail" && selectedJobId) {
    const selectedJob = jobs.find((j) => j.id === selectedJobId);
    return (
      <ProductShell
        title={selectedJob?.title ?? "岗位详情"}
        description={selectedJob ? `${selectedJob.department} · ${selectedJob.level ?? "—"} · ${selectedJob.owner?.name ?? "—"}` : ""}
        actions={
          <button
            onClick={handleBackToList}
            className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
          >
            ← 返回列表
          </button>
        }
      >
        <div className="space-y-8">
          {/* Overview Section */}
          <section>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
              📊 岗位总览
            </h3>
            <JobOverview data={overviewData} loading={overviewLoading} />
          </section>

          {/* Pipeline Section */}
          <section>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
              🔄 招聘管道
            </h3>
            <JobPipelineView data={pipelineData} loading={pipelineLoading} />
          </section>
        </div>
      </ProductShell>
    );
  }

  // List view
  return (
    <ProductShell
      title="岗位"
      description="管理招聘岗位，查看管道进度与流程卡点"
      kpiRow={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="在招岗位" value={jobs.length} href="/jobs" />
          <KpiCard label="高优先级" value={highPriority} trendDirection={highPriority > 3 ? "up" : "flat"} />
          <KpiCard label="招聘中" value={activeRecruiting} />
          <KpiCard label="总候选人" value={totalCandidates} />
        </div>
      }
      filterBar={<JobFilters onFilter={setFilters} departments={departments} brandLines={brandLines} />}
    >
      {loading ? <LoadingSkeleton /> : (
        <JobList jobs={jobs} onSelect={handleSelectJob} />
      )}
    </ProductShell>
  );
}
