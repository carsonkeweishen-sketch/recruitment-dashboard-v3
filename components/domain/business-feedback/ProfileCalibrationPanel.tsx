"use client";

interface CalibrationItem {
  id: string;
  sourceFeedbackIds: string[];
  calibrationReason: string | null;
  status: string;
  confirmedAt: string | null;
  createdAt: string;
}

export function ProfileCalibrationPanel({ calibrations, loading, onConfirm }: { calibrations: CalibrationItem[]; loading?: boolean; onConfirm?: (id: string) => void }) {
  if (loading) return <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--color-surface-tertiary)]" />)}</div>;
  if (calibrations.length === 0) return <div className="flex flex-col items-center justify-center py-8 text-center"><div className="mb-2 text-3xl">🎯</div><p className="text-sm text-[var(--color-text-secondary)]">暂无画像校准记录</p></div>;

  return (
    <div className="space-y-2">
      {calibrations.map((c) => (
        <div key={c.id} className="rounded-lg border border-[var(--color-border)] p-3">
          <div className="flex items-center justify-between">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
              {c.status === "confirmed" ? "已确认" : "草稿"}
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">{new Date(c.createdAt).toLocaleDateString("zh-CN")}</span>
          </div>
          {c.calibrationReason && <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{c.calibrationReason}</p>}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
            <span>来源: {c.sourceFeedbackIds.length} 条反馈</span>
            {c.confirmedAt && <span>确认时间: {new Date(c.confirmedAt).toLocaleDateString("zh-CN")}</span>}
          </div>
          {c.status === "draft" && onConfirm && (
            <button onClick={() => onConfirm(c.id)} className="mt-2 rounded-md border border-[var(--color-primary)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors">确认校准</button>
          )}
        </div>
      ))}
    </div>
  );
}
