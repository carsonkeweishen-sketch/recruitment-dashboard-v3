"use client";

import { useState } from "react";
import type { ActionItem } from "./action-types";
import { dismissAction } from "./action-api";

interface Props {
  action: ActionItem;
  onClose: () => void;
  onSuccess: () => void;
}

export function DismissActionModal({ action, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim() || reason.trim().length < 2) { setError("请填写忽略原因"); return; }
    setError("");
    setSubmitting(true);
    try {
      await dismissAction(action.id, reason.trim());
      onSuccess();
    } catch {
      setError("操作失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">忽略此行动</h2>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)]">✕</button>
        </div>
        <div className="space-y-3 px-6 py-4">
          <div className="rounded-md bg-[var(--color-surface-secondary)] p-3 text-sm text-[var(--color-text-secondary)]">
            {action.title}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">忽略原因 <span className="text-red-500">*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="请说明忽略原因，例如该风险已由线下沟通处理、该行动不再适用、关联流程已关闭。"
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm" />
          </div>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
          <button onClick={onClose} className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)]">取消</button>
          <button onClick={handleSubmit} disabled={submitting} className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {submitting ? "提交中..." : "确认忽略"}
          </button>
        </div>
      </div>
    </div>
  );
}
