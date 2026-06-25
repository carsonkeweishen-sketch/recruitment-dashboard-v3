"use client";

import { ApplicationStageBadge } from "./ApplicationStageBadge";

interface CandidateItem {
  id: string;
  name: string;
  source: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  tags: string[];
  applicationCount: number;
  latestApplicationStage: string | null;
  latestJobTitle: string | null;
  updatedAt: string;
}

export function CandidateList({ candidates, onSelect, loading }: { candidates: CandidateItem[]; onSelect: (id: string) => void; loading?: boolean }) {
  if (loading) return <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-[var(--color-surface-tertiary)]" />)}</div>;
  if (candidates.length === 0) return <div className="flex flex-col items-center justify-center py-16 text-center"><div className="mb-3 text-4xl">👥</div><h3 className="text-sm font-medium text-[var(--color-text-primary)]">暂无候选人</h3><p className="mt-1 text-sm text-[var(--color-text-secondary)]">当前筛选条件下没有匹配的候选人。</p></div>;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="hidden border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-4 py-2.5 text-xs font-medium text-[var(--color-text-tertiary)] sm:grid sm:grid-cols-12">
        <span className="col-span-3">候选人</span>
        <span className="col-span-2">当前公司/岗位</span>
        <span className="col-span-1">来源</span>
        <span className="col-span-2">最新投递</span>
        <span className="col-span-1">阶段</span>
        <span className="col-span-1">投递数</span>
        <span className="col-span-2">标签</span>
      </div>
      {candidates.map((c) => (
        <button key={c.id} onClick={() => onSelect(c.id)} className="w-full border-b border-[var(--color-border)] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--color-surface-secondary)] sm:grid sm:grid-cols-12 sm:items-center">
          <div className="col-span-3"><div className="text-sm font-medium text-[var(--color-text-primary)]">{c.name}</div></div>
          <div className="col-span-2 text-sm text-[var(--color-text-secondary)]"><div>{c.currentCompany ?? "—"}</div><div className="text-xs text-[var(--color-text-tertiary)]">{c.currentTitle ?? ""}</div></div>
          <div className="col-span-1 text-sm text-[var(--color-text-secondary)]">{c.source ?? "—"}</div>
          <div className="col-span-2 text-sm text-[var(--color-text-primary)]">{c.latestJobTitle ?? "—"}</div>
          <div className="col-span-1">{c.latestApplicationStage ? <ApplicationStageBadge stage={c.latestApplicationStage} /> : <span className="text-xs text-[var(--color-text-tertiary)]">—</span>}</div>
          <div className="col-span-1 text-sm text-[var(--color-text-primary)]">{c.applicationCount}</div>
          <div className="col-span-2 flex flex-wrap gap-1">{c.tags.slice(0, 3).map((t) => <span key={t} className="rounded bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 text-xs text-[var(--color-text-secondary)]">{t}</span>)}</div>
        </button>
      ))}
    </div>
  );
}
