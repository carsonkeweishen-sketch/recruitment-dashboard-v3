"use client";

import { useEffect, useState } from "react";
import { ApplicationStageBadge } from "./ApplicationStageBadge";

interface CandidateDetail {
  id: string; name: string; source: string | null; currentCompany: string | null; currentTitle: string | null;
  tags: string[]; resumeSummary: string | null; email: string | null; phone: string | null;
  applicationCount: number; activeApplicationCount: number;
  applications: { id: string; job: { id: string; title: string; jobCode: string | null; department: string | null; level: string | null } | null; stage: string; status: string; source: string | null; fitScore: number | null; owner: { name: string } | null; lastActivityAt: string }[];
  createdAt: string; updatedAt: string;
}

export function CandidateDetailDrawer({ candidateId, onClose }: { candidateId: string | null; onClose: () => void }) {
  const [c, setC] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "applications" | "profile" | "activity">("overview");

  useEffect(() => {
    if (!candidateId) return;
    let cancelled = false;
    async function load() { setLoading(true); try { const r = await fetch(`/api/candidates/${candidateId}`); const d = await r.json(); if (!cancelled) setC(d.data); } catch { if (!cancelled) setC(null); } finally { if (!cancelled) setLoading(false); } }
    load(); return () => { cancelled = true; };
  }, [candidateId]);

  if (!candidateId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">候选人详情</h2>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">✕</button>
        </div>
        {loading && <div className="flex-1 p-5"><div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-surface-tertiary)]" /></div>}
        {!loading && !c && <div className="flex-1 p-5 text-sm text-[var(--color-text-secondary)]">加载失败</div>}
        {c && (
          <>
            <div className="flex border-b border-[var(--color-border)]">
              {(["overview","applications","profile","activity"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium ${tab===t?"border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]":"text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>
                  {t==="overview"?"概览":t==="applications"?"投递":t==="profile"?"档案":"动态"}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-5">
              {tab==="overview" && <OverviewTab c={c} />}
              {tab==="applications" && <ApplicationsTab c={c} />}
              {tab==="profile" && <ProfileTab c={c} />}
              {tab==="activity" && <ActivityTab />}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function OverviewTab({ c }: { c: CandidateDetail }) {
  return (
    <div className="space-y-4">
      <div><h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{c.name}</h3></div>
      <div className="grid grid-cols-2 gap-3">
        <F label="来源" value={c.source} />
        <F label="当前公司" value={c.currentCompany} />
        <F label="当前岗位" value={c.currentTitle} />
        <F label="投递数" value={`${c.applicationCount} (活跃 ${c.activeApplicationCount})`} />
        <F label="手机" value={c.phone} permissionRequired />
        <F label="邮箱" value={c.email} permissionRequired />
        <F label="创建时间" value={c.createdAt ? new Date(c.createdAt).toLocaleDateString("zh-CN") : "—"} />
        <F label="最近更新" value={c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("zh-CN") : "—"} />
      </div>
      {c.tags.length > 0 && <div className="flex flex-wrap gap-1.5">{c.tags.map((t) => <span key={t} className="rounded-full bg-[var(--color-surface-tertiary)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">{t}</span>)}</div>}
    </div>
  );
}
function F({ label, value, permissionRequired }: { label: string; value?: string | null; permissionRequired?: boolean }) {
  const displayValue = permissionRequired && value === null ? "无权限查看" : (value ?? "—");
  return <div><div className="text-xs text-[var(--color-text-tertiary)]">{label}</div><div className={`mt-0.5 text-sm ${permissionRequired && value === null ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text-primary)]"}`}>{displayValue}</div></div>;
}

function ApplicationsTab({ c }: { c: CandidateDetail }) {
  return (
    <div className="space-y-3">
      {c.applications.map((a) => (
        <div key={a.id} className="rounded-lg border border-[var(--color-border)] p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-[var(--color-text-primary)]">{a.job?.title ?? "—"}</div>
            <ApplicationStageBadge stage={a.stage} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)]">
            <div>部门: {a.job?.department ?? "—"}</div>
            <div>职级: {a.job?.level ?? "—"}</div>
            <div>负责人: {a.owner?.name ?? "—"}</div>
            <div>匹配度: {a.fitScore ?? "—"}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileTab({ c }: { c: CandidateDetail }) {
  return (
    <div className="space-y-4">
      <div><div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">简历摘要</div><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{c.resumeSummary ?? "暂无摘要"}</p></div>
      <div><div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">标签</div><div className="mt-2 flex flex-wrap gap-1.5">{c.tags.map((t) => <span key={t} className="rounded-full bg-[var(--color-primary-light)] px-2.5 py-1 text-xs text-[var(--color-primary)]">{t}</span>)}</div></div>
    </div>
  );
}

function ActivityTab() {
  return <div className="flex flex-col items-center justify-center py-12 text-center"><div className="mb-3 text-4xl">📭</div><h3 className="text-sm font-medium text-[var(--color-text-primary)]">暂无候选人动态</h3><p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-xs">后续业务反馈、面试记录、Offer 风险和 AI 分析会沉淀在这里。</p></div>;
}
