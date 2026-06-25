"use client";

import { useState } from "react";

interface Props {
  jobId: string;
  jobTitle: string;
  applicationId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DECISIONS = [
  { value: "PASS", label: "通过" },
  { value: "REJECT", label: "拒绝" },
  { value: "HOLD", label: "待定" },
  { value: "REDIRECT", label: "转推" },
];

const REASONS = [
  { value: "EXPERIENCE_MISMATCH", label: "经验不匹配" },
  { value: "CAPABILITY_GAP", label: "能力不足" },
  { value: "SENIORITY_MISMATCH", label: "资历不匹配" },
  { value: "SALARY_GAP", label: "薪资差距" },
  { value: "EXPECTATION_MISMATCH", label: "期望不匹配" },
  { value: "COMMUNICATION_GAP", label: "沟通问题" },
  { value: "STABILITY_RISK", label: "稳定性风险" },
  { value: "CULTURE_MISMATCH", label: "文化不匹配" },
  { value: "LOCATION_ISSUE", label: "地点问题" },
  { value: "OTHER", label: "其他" },
];

export function BusinessFeedbackFormModal({ jobId, jobTitle, applicationId, onClose, onSuccess }: Props) {
  const [decision, setDecision] = useState("REJECT");
  const [reasonCode, setReasonCode] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!decision) { setError("请选择决策"); return; }
    setSubmitting(true); setError(null);
    try {
      const r = await fetch("/api/business-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, applicationId, decision, reasonCode: reasonCode || undefined, reasonText: reasonText || undefined }),
      });
      const d = await r.json();
      if (!d.success) { setError(d.error || "提交失败"); return; }
      onSuccess();
    } catch { setError("网络错误"); }
    finally { setSubmitting(false); }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">业务筛选反馈</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">岗位: {jobTitle}</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">决策</label>
            <div className="mt-1 flex gap-2">
              {DECISIONS.map((d) => (
                <button key={d.value} onClick={() => setDecision(d.value)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${decision === d.value ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"}`}>{d.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">拒绝原因</label>
            <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)]">
              <option value="">请选择原因（可选）</option>
              {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">补充说明</label>
            <textarea value={reasonText} onChange={(e) => setReasonText(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] resize-none" placeholder="可选，补充具体原因..." />
          </div>

          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]">取消</button>
          <button onClick={handleSubmit} disabled={submitting} className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">{submitting ? "提交中..." : "提交反馈"}</button>
        </div>
      </div>
    </>
  );
}
