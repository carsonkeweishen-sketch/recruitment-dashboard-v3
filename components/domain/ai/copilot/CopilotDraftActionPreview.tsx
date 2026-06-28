"use client";

import { useState } from "react";

interface DraftAction {
  id: string;
  title: string;
  description: string;
  status: string;
}

export function CopilotDraftActionPreview({ drafts }: { drafts: DraftAction[] }) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState("");

  const handleConfirm = async (draftId: string) => {
    if (!ownerId.trim()) { alert("请输入责任人 ID"); return; }
    try {
      const res = await fetch(`/api/ai/copilot/draft-action/${draftId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId }),
      });
      const d = await res.json();
      if (d.success) {
        alert("行动项已创建");
        setConfirmingId(null);
        setOwnerId("");
      } else {
        alert(d.error || "确认失败");
      }
    } catch { alert("网络错误"); }
  };

  return (
    <div className="mt-2 pt-2 border-t border-[var(--color-border-light)]">
      <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">📋 行动草稿（仅草稿，需人工确认）</p>
      {drafts.map((draft) => (
        <div key={draft.id} className="mt-1 p-2 rounded bg-[var(--color-surface-tertiary)]">
          <p className="text-xs font-medium text-[var(--color-text-primary)]">{draft.title}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{draft.description}</p>
          {draft.status === "draft" && (
            <>
              {confirmingId === draft.id ? (
                <div className="mt-1 space-y-1">
                  <input
                    type="text"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    placeholder="责任人 ID"
                    className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                  <div className="flex gap-1">
                    <button onClick={() => handleConfirm(draft.id)} className="px-2 py-1 text-xs rounded bg-[var(--color-success)] text-white">确认创建</button>
                    <button onClick={() => setConfirmingId(null)} className="px-2 py-1 text-xs rounded bg-[var(--color-surface-tertiary)]">取消</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmingId(draft.id)} className="mt-1 px-2 py-1 text-xs rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:opacity-80">
                  确认创建行动项
                </button>
              )}
            </>
          )}
          {draft.status === "confirmed" && <p className="text-xs text-[var(--color-success)] mt-1">✅ 已确认</p>}
        </div>
      ))}
    </div>
  );
}
