"use client";

export function AIHumanReviewControls({ insightId, onReview }: { insightId: string | null; onReview: (status: string, note?: string) => void }) {
  if (!insightId) return null;
  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
      <button onClick={() => onReview("accepted")} className="rounded-full bg-[var(--color-success)] text-white px-3 py-1 text-xs font-medium hover:opacity-90">接受</button>
      <button onClick={() => { const note = prompt("编辑建议"); onReview("edited", note || undefined); }} className="rounded-full bg-[var(--color-warning)] text-white px-3 py-1 text-xs font-medium hover:opacity-90">编辑</button>
      <button onClick={() => onReview("rejected")} className="rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] px-3 py-1 text-xs font-medium hover:opacity-90">忽略</button>
    </div>
  );
}
