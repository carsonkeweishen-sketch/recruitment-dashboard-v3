"use client";

import { useState } from "react";

export function CandidateFilters({ onFilter, sources }: { onFilter: (f: Record<string, string>) => void; sources: string[] }) {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [stage, setStage] = useState("");

  function apply() { onFilter({ search, source, stage }); }
  function clear() { setSearch(""); setSource(""); setStage(""); onFilter({}); }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input type="text" placeholder="搜索姓名/公司/岗位..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key==="Enter" && apply()} className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none" />
      <select value={source} onChange={(e) => { setSource(e.target.value); apply(); }} className="rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text-secondary)]"><option value="">全部来源</option>{sources.map((s) => <option key={s} value={s}>{s}</option>)}</select>
      <select value={stage} onChange={(e) => { setStage(e.target.value); apply(); }} className="rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text-secondary)]"><option value="">全部阶段</option><option value="sourced">入库</option><option value="hr_screen">HR筛选</option><option value="business_screen">业务筛选</option><option value="first_interview">初试</option><option value="second_interview">复试</option><option value="final_interview">终面</option></select>
      <button onClick={clear} className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">清除筛选</button>
    </div>
  );
}
