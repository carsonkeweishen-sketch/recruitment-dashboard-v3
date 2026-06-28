"use client";

import { useState } from "react";

export function CopilotHumanReviewBar({ messageId, reviewStatus }: { messageId: string; reviewStatus: string }) {
  const [status, setStatus] = useState(reviewStatus);
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState("");

  if (status !== "pending") {
    const labels: Record<string, string> = { accepted: "✅ 已接受", edited: "✏️ 已编辑后接受", rejected: "🚫 已忽略" };
    return <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{labels[status] || status}</p>;
  }

  const handleReview = async (newStatus: "accepted" | "edited" | "rejected") => {
    if (newStatus === "edited") {
      setEditing(true);
      return;
    }
    try {
      await fetch(`/api/ai/copilot/messages/${messageId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
    } catch { /* ignore */ }
  };

  const handleSubmitEdit = async () => {
    try {
      await fetch(`/api/ai/copilot/messages/${messageId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "edited", reviewNote: editNote }),
      });
      setStatus("edited");
      setEditing(false);
    } catch { /* ignore */ }
  };

  if (editing) {
    return (
      <div className="mt-2 space-y-1">
        <input
          type="text"
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
          placeholder="编辑备注..."
          className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
        <div className="flex gap-1">
          <button onClick={handleSubmitEdit} className="px-2 py-1 text-xs rounded bg-[var(--color-success)] text-white">确认</button>
          <button onClick={() => setEditing(false)} className="px-2 py-1 text-xs rounded bg-[var(--color-surface-tertiary)]">取消</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex gap-1">
      <button onClick={() => handleReview("accepted")} className="px-2 py-1 text-xs rounded bg-[var(--color-success-light)] text-[var(--color-success)] hover:opacity-80">接受</button>
      <button onClick={() => handleReview("edited")} className="px-2 py-1 text-xs rounded bg-[var(--color-info-light)] text-[var(--color-info)] hover:opacity-80">编辑后接受</button>
      <button onClick={() => handleReview("rejected")} className="px-2 py-1 text-xs rounded bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] hover:opacity-80">忽略</button>
    </div>
  );
}
