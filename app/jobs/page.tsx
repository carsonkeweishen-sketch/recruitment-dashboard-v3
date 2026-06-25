"use client";

import { useEffect, useState, useCallback } from "react";
import { JobKpiCards } from "@/components/domain/jobs/JobKpiCards";
import { JobFilters } from "@/components/domain/jobs/JobFilters";
import { JobList } from "@/components/domain/jobs/JobList";
import { JobDetailDrawer } from "@/components/domain/jobs/JobDetailDrawer";
import { ErrorState } from "@/components/ui/ErrorState";
import { PermissionDenied } from "@/components/ui/PermissionDenied";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

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

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

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

  const departments = [...new Set(jobs.map((j) => j.department).filter(Boolean))];
  const brandLines = [...new Set(jobs.map((j) => j.brandLine).filter(Boolean))] as string[];

  const highPriority = jobs.filter((j) => j.priority === "high").length;
  const activeRecruiting = jobs.filter((j) => j.activeApplications > 0).length;
  const profileComplete = jobs.filter((j) => j.brandLine).length;

  if (error === "permission_denied") return <PermissionDenied message="您没有权限访问岗位管理。请切换角色或联系管理员。" />;
  if (error) return <ErrorState title="加载失败" description={error} onRetry={() => fetchJobs(filters)} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">岗位管理</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">查看岗位 JD、画像、负责人和招聘进展</p>
      </div>

      {!loading && (
        <JobKpiCards total={jobs.length} highPriority={highPriority} activeRecruiting={activeRecruiting} profileComplete={profileComplete} />
      )}

      <JobFilters onFilter={setFilters} departments={departments} brandLines={brandLines} />

      {loading ? <LoadingSkeleton /> : <JobList jobs={jobs} onSelect={setSelectedJobId} />}

      <JobDetailDrawer jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
    </div>
  );
}
