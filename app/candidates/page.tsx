"use client";

import { useEffect, useState, useCallback } from "react";
import { CandidateKpiCards } from "@/components/domain/candidates/CandidateKpiCards";
import { CandidateFilters } from "@/components/domain/candidates/CandidateFilters";
import { CandidateList } from "@/components/domain/candidates/CandidateList";
import { CandidateDetailDrawer } from "@/components/domain/candidates/CandidateDetailDrawer";
import { ErrorState } from "@/components/ui/ErrorState";
import { PermissionDenied } from "@/components/ui/PermissionDenied";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

interface CandidateItem { id: string; name: string; source: string | null; currentCompany: string | null; currentTitle: string | null; tags: string[]; applicationCount: number; latestApplicationStage: string | null; latestJobTitle: string | null; updatedAt: string; createdAt: string; }

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const fetchCandidates = useCallback(async (f: Record<string, string>) => {
    setLoading(true); setError(null);
    try { const p = new URLSearchParams(); Object.entries(f).forEach(([k,v]) => { if(v) p.set(k,v); }); const r = await fetch(`/api/candidates?${p}`); const d = await r.json(); if(r.status===403){setError("permission_denied");setCandidates([]);return;} if(!d.success){setError(d.error??"加载失败");setCandidates([]);return;} setCandidates(d.data); }
    catch { setError("网络错误"); setCandidates([]); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchCandidates(filters); }, [filters, fetchCandidates]);

  const sources = [...new Set(candidates.map((c) => c.source).filter(Boolean))] as string[];
  const active = candidates.filter((c) => c.latestApplicationStage && !["hired","rejected","withdrawn","closed"].includes(c.latestApplicationStage)).length;
  const multiJob = candidates.filter((c) => c.applicationCount > 1).length;
  const recent = candidates.filter((c) => { const d = new Date(c.createdAt); const week = new Date(); week.setDate(week.getDate()-7); return d >= week; }).length;

  if (error === "permission_denied") return <PermissionDenied message="您没有权限访问候选人库。" />;
  if (error) return <ErrorState title="加载失败" description={error} onRetry={() => fetchCandidates(filters)} />;

  return (
    <div className="space-y-6">
      <div><h2 className="text-lg font-semibold text-[var(--color-text-primary)]">候选人库</h2><p className="mt-1 text-sm text-[var(--color-text-secondary)]">查看候选人档案、投递岗位和当前推进阶段</p></div>
      {!loading && <CandidateKpiCards total={candidates.length} active={active} multiJob={multiJob} recent={recent} />}
      <CandidateFilters onFilter={setFilters} sources={sources} />
      {loading ? <LoadingSkeleton /> : <CandidateList candidates={candidates} onSelect={setSelectedId} />}
      <CandidateDetailDrawer candidateId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
