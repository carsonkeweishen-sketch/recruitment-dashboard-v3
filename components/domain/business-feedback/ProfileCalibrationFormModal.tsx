"use client";

import { useState } from "react";

interface FeedbackOption { id: string; decision: string; reasonCode: string | null; createdAt: string; }

interface Props {
  jobId: string;
  jobTitle: string;
  feedbackOptions: FeedbackOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ProfileCalibrationFormModal({ jobId, jobTitle, feedbackOptions, onClose, onSuccess }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectFeedbacks = feedbackOptions.filter((f) => f.decision === "REJECT");

  function toggleId(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function handleSubmit() {
    if (selectedIds.length === 0) { setError("请至少选择一条来源反馈"); return; }
    setSubmitting(true); setError(null);
    try {
      const r = await fetch(`/api/jobs/${jobId}/profile-calibrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceFeedbackIds: selectedIds, calibrationReason: reason || undefined }),
      });
      const d = await r.json();
      if (!d.success) { setError(d.error || "创建失败"); return; }
      onSuccess();
    } catch { setError("网络错误"); }
    finally { setSubmitting(false); }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">创建画像校准草稿</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">岗位: {jobTitle}</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">来源反馈（至少选1条拒绝反馈）</label>
            <div className="mt-1 max-h-40 overflow-auto space-y-1">
              {rejectFeedbacks.length === 0 && <p className="text-sm text-[var(--color-text-tertiary)]">暂无可选拒绝反馈</p>}
              {rejectFeedbacks.map((f) => (
                <label key={f.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--color-surface-secondary)] cursor-pointer">
                  <input type="checkbox" checked={selectedIds.includes(f.id)} onChange={() => toggleId(f.id)} className="rounded" />
                  <span className="text-[var(--color-text-primary)]">{f.reasonCode || "未分类"}</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">{new Date(f.createdAt).toLocaleDateString("zh-CN")}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">校准原因</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] resize-none" placeholder="例如：连续候选人因目标公司经验不足被拒，建议提高 targetCompanies 权重" />
          </div>

          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]">取消</button>
          <button onClick={handleSubmit} disabled={submitting} className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">{submitting ? "创建中..." : "创建草稿"}</button>
        </div>
      </div>
    </>
  );
}
