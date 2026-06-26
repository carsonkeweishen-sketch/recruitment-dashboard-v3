"use client";

import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "./action-copy-map";

interface Props {
  filters: Record<string, string>;
  onChange: (filters: Record<string, string>) => void;
}

const STATUS_OPTIONS = ["all", "open", "in_progress", "blocked", "resolved", "dismissed"];
const PRIORITY_OPTIONS = ["all", "low", "medium", "high", "urgent"];
const CATEGORY_OPTIONS = [
  "all",
  "feedback_followup",
  "interview_followup",
  "candidate_risk_followup",
  "job_calibration",
  "business_feedback",
  "offer_risk",
  "process_blocker",
  "data_quality",
  "manual",
];

function SegmentedControl({
  label,
  options,
  value,
  labels,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  labels: Record<string, string>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-[var(--color-text-tertiary)]">{label}</span>
      <div className="flex rounded-lg border border-[var(--color-border)] p-0.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
              value === opt
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {opt === "all" ? "全部" : (labels[opt] || opt)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ActionFilterBar({ filters, onChange }: Props) {
  const setFilter = (key: string, value: string) => {
    const next = { ...filters };
    if (value === "all" || !value) {
      delete next[key];
    } else {
      next[key] = value;
    }
    onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SegmentedControl
        label="状态"
        options={STATUS_OPTIONS}
        value={filters.status || "all"}
        labels={STATUS_LABELS}
        onChange={(v) => setFilter("status", v)}
      />
      <SegmentedControl
        label="优先级"
        options={PRIORITY_OPTIONS}
        value={filters.priority || "all"}
        labels={PRIORITY_LABELS}
        onChange={(v) => setFilter("priority", v)}
      />
      <SegmentedControl
        label="分类"
        options={CATEGORY_OPTIONS}
        value={filters.category || "all"}
        labels={CATEGORY_LABELS}
        onChange={(v) => setFilter("category", v)}
      />
      <label className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-tertiary)]">
        <input
          type="checkbox"
          checked={filters.overdueOnly === "true"}
          onChange={(e) => setFilter("overdueOnly", e.target.checked ? "true" : "")}
          className="rounded border-[var(--color-border)]"
        />
        只看逾期
      </label>
    </div>
  );
}
