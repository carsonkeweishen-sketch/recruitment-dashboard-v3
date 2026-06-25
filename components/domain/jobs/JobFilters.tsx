"use client";

import { useState } from "react";

interface JobFiltersProps {
  onFilter: (filters: Record<string, string>) => void;
  departments: string[];
  brandLines: string[];
}

export function JobFilters({ onFilter, departments, brandLines }: JobFiltersProps) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [brandLine, setBrandLine] = useState("");

  function apply() {
    onFilter({ search, department, status, priority, brandLine });
  }

  function clear() {
    setSearch(""); setDepartment(""); setStatus(""); setPriority(""); setBrandLine("");
    onFilter({});
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text" placeholder="搜索岗位名称..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
        className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none"
      />
      <select value={department} onChange={(e) => { setDepartment(e.target.value); apply(); }} className="rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text-secondary)]">
        <option value="">全部部门</option>
        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select value={status} onChange={(e) => { setStatus(e.target.value); apply(); }} className="rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text-secondary)]">
        <option value="">全部状态</option>
        <option value="open">在招</option>
        <option value="paused">暂停</option>
        <option value="closed">关闭</option>
      </select>
      <select value={priority} onChange={(e) => { setPriority(e.target.value); apply(); }} className="rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text-secondary)]">
        <option value="">全部优先级</option>
        <option value="high">高</option>
        <option value="normal">普通</option>
        <option value="low">低</option>
      </select>
      <select value={brandLine} onChange={(e) => { setBrandLine(e.target.value); apply(); }} className="rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text-secondary)]">
        <option value="">全部业务线</option>
        {brandLines.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>
      <button onClick={clear} className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">清除筛选</button>
    </div>
  );
}
