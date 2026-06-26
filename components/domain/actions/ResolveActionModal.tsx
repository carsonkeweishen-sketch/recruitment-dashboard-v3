"use client";

import { useState } from "react";
import type { ActionItem } from "./action-types";
import { resolveAction } from "./action-api";

interface Props {
  action: ActionItem;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResolveActionModal({ action, onClose, onSuccess }: Props) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!note.trim() || note.trim().length < 2) { setError("请填写处理说明"); return; }
    setError("");
    setSubmitting(true);
    try {
      await resolveAction(action.id, note.trim());
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
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">标记为已解决</h2>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)]">✕</button>
        </div>
        <div className="space-y-3 px-6 py-4">
          <div className="rounded-md bg-[var(--color-surface-secondary)] p-3 text-sm text-[var(--color-text-secondary)]">
            {action.title}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">处理说明 <span className="text-red-500">*</span></label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="请说明该行动如何被处理，例如已补充面评、已完成候选人风险追问、业务已确认继续推进。"
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm" />
          </div>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
            解决该行动项仅关闭当前跟进事项，不会自动改变候选人阶段或岗位状态。处理说明会记录在活动时间线中，便于后续复盘。
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
          <button onClick={onClose} className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)]">取消</button>
          <button onClick={handleSubmit} disabled={submitting} className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {submitting ? "提交中..." : "确认解决"}
          </button>
        </div>
      </div>
    </div>
  );
}
