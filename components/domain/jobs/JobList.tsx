"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";

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
  updatedAt: string;
}

interface JobListProps {
  jobs: JobItem[];
  onSelect: (id: string) => void;
  loading?: boolean;
}

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  open: "success",
  paused: "warning",
  closed: "default",
};

const priorityVariant: Record<string, "danger" | "warning" | "default"> = {
  high: "danger",
  normal: "default",
  low: "default",
};

export function JobList({ jobs, onSelect, loading }: JobListProps) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--color-surface-tertiary)]" />)}</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 text-4xl">📋</div>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">暂无岗位</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">当前筛选条件下没有匹配的岗位。</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="hidden border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-4 py-2.5 text-xs font-medium text-[var(--color-text-tertiary)] sm:grid sm:grid-cols-12">
        <span className="col-span-3">岗位</span>
        <span className="col-span-2">部门 / 职级</span>
        <span className="col-span-1">状态</span>
        <span className="col-span-1">优先级</span>
        <span className="col-span-2">负责人</span>
        <span className="col-span-1">候选人</span>
        <span className="col-span-2">业务线</span>
      </div>

      {/* Rows */}
      {jobs.map((job) => (
        <button
          key={job.id}
          onClick={() => onSelect(job.id)}
          className="w-full border-b border-[var(--color-border)] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--color-surface-secondary)] sm:grid sm:grid-cols-12 sm:items-center"
        >
          <div className="col-span-3">
            <div className="text-sm font-medium text-[var(--color-text-primary)]">{job.title}</div>
            {job.jobCode && <div className="text-xs text-[var(--color-text-tertiary)]">{job.jobCode}</div>}
          </div>
          <div className="col-span-2 text-sm text-[var(--color-text-secondary)]">
            <div>{job.department}</div>
            {job.level && <div className="text-xs text-[var(--color-text-tertiary)]">{job.level}</div>}
          </div>
          <div className="col-span-1"><StatusBadge label={job.status === "open" ? "在招" : job.status} variant={statusVariant[job.status] ?? "default"} /></div>
          <div className="col-span-1"><StatusBadge label={job.priority === "high" ? "高" : job.priority === "normal" ? "普通" : "低"} variant={priorityVariant[job.priority] ?? "default"} /></div>
          <div className="col-span-2 text-sm text-[var(--color-text-secondary)]">
            <div>{job.owner?.name ?? "—"}</div>
            {job.businessOwner && <div className="text-xs text-[var(--color-text-tertiary)]">{job.businessOwner.name}</div>}
          </div>
          <div className="col-span-1 text-sm text-[var(--color-text-primary)]">{job.totalApplications}</div>
          <div className="col-span-2 text-xs text-[var(--color-text-tertiary)]">{job.brandLine ?? "—"}</div>
        </button>
      ))}
    </div>
  );
}
