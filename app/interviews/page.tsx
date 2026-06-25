"use client";

import { useEffect, useState, useCallback } from "react";
import { InterviewList } from "@/components/domain/interviews/InterviewList";
import { InterviewDetailDrawer } from "@/components/domain/interviews/InterviewDetailDrawer";
import { ErrorState } from "@/components/ui/ErrorState";
import { PermissionDenied } from "@/components/ui/PermissionDenied";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

interface InterviewItem {
  id: string;
  round: string;
  status: string;
  scheduledAt: string | null;
  application: {
    candidate: { id: string; name: string; currentCompany: string | null; currentTitle: string | null };
    job: { id: string; title: string; jobCode: string | null; department: { name: string } | null };
  };
  interviewer: { id: string; name: string };
  feedbacks: { id: string; overallRecommendation: string | null }[];
}

interface Metrics {
  totalInterviews: number;
  feedbackSubmittedCount: number;
  feedbackPendingCount: number;
  feedbackOnTimeRate: number;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const fetchInterviews = useCallback(async (f: Record<string, string>) => {
    setLoading(true); setError(null);
    try {
      const p = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => { if (v) p.set(k, v); });
      const r = await fetch(`/api/interviews?${p}`);
      const d = await r.json();
      if (r.status === 403) { setError("permission_denied"); setInterviews([]); return; }
      if (!d.success) { setError(d.error ?? "加载失败"); setInterviews([]); return; }
      setInterviews(d.interviews);
      setMetrics(d.metrics);
    } catch { setError("网络错误"); setInterviews([]); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchInterviews(filters); }, [filters, fetchInterviews]);

  if (error === "permission_denied") return <PermissionDenied message="您没有权限访问面试管理。" />;
  if (error) return <ErrorState title="加载失败" description={error} onRetry={() => fetchInterviews(filters)} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">面试管理</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">查看面试安排、反馈质量、候选人表现风险和面试官反馈情况</p>
      </div>

      {/* KPI Cards */}
      {metrics && !loading && (
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="面试总数" value={metrics.totalInterviews} />
          <KpiCard label="已反馈" value={metrics.feedbackSubmittedCount} />
          <KpiCard label="待反馈" value={metrics.feedbackPendingCount} />
          <KpiCard label="及时反馈率" value={`${(metrics.feedbackOnTimeRate * 100).toFixed(0)}%`} />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <select onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]">
          <option value="">全部状态</option>
          <option value="scheduled">已安排</option>
          <option value="completed">已完成</option>
        </select>
        <button onClick={() => setFilters({})} className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]">清除筛选</button>
      </div>

      {loading ? <LoadingSkeleton /> : <InterviewList interviews={interviews} onSelect={setSelectedId} />}
      <InterviewDetailDrawer interviewId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="text-xs text-[var(--color-text-tertiary)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}
