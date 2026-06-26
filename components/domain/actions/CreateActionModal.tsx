"use client";

import { useState } from "react";
import { createAction } from "./action-api";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "./action-display-utils";

const CATEGORIES = Object.keys(CATEGORY_LABELS);
const PRIORITIES = Object.keys(PRIORITY_LABELS);

interface Props {
      /* noop */
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateActionModal({ onClose, onSuccess }: Props) {
      /* noop */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("manual");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
      /* noop */
    if (!title.trim()) { setError("请输入行动项标题"); return; }
    setError("");
    setSubmitting(true);
    try {
      /* noop */
      await createAction({ title: title.trim(), description: description.trim() || undefined, category, priority, sourceType: "manual" });
      onSuccess();
    } catch {
      setError("操作失败，请稍后重试");
    } finally {
      /* noop */
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">新建行动项</h2>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)]">✕</button>
        </div>
        <div className="space-y-4 px-6 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">标题 <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="请输入行动标题" className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">描述</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="可选描述" className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">分类</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">优先级</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm">
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
          </div>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
          <button onClick={onClose} className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)]">取消</button>
          <button onClick={handleSubmit} disabled={submitting} className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {submitting ? "创建中..." : "创建"}
          </button>
        </div>
      </div>
    </div>
  );
}
