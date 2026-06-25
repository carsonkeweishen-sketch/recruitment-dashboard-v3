"use client";

interface InterviewItem {
  id: string;
  round: string;
  status: string;
  scheduledAt: string | null;
  application: {
    candidate: { id: string; name: string; currentCompany: string | null; currentTitle: string | null };
    job: { id: string; title: string; jobCode: string | null; department: { name: string } | null };
  };
  interviewer: { id: string; name: string };
  feedbacks: { id: string; overallRecommendation: string | null }[];
}

const ROUND_LABELS: Record<string, string> = { business_first: "业务初试", business_second: "业务复试", ceo_final: "终面", hr_final: "HR终面" };
const STATUS_LABELS: Record<string, string> = { scheduled: "已安排", completed: "已完成", cancelled: "已取消", no_show: "未到场" };

export function InterviewList({ interviews, loading, onSelect }: { interviews: InterviewItem[]; loading?: boolean; onSelect: (id: string) => void }) {
  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--color-surface-tertiary)]" />)}</div>;
  if (interviews.length === 0) return <div className="flex flex-col items-center justify-center py-16 text-center"><div className="mb-3 text-4xl">📋</div><h3 className="text-sm font-medium text-[var(--color-text-primary)]">暂无面试安排</h3><p className="mt-1 text-sm text-[var(--color-text-secondary)]">当前筛选条件下没有匹配的面试记录。</p></div>;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      {interviews.map((iv) => (
        <button key={iv.id} onClick={() => onSelect(iv.id)} className="w-full border-b border-[var(--color-border)] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--color-surface-secondary)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--color-text-primary)]">{iv.application.candidate.name}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">{iv.application.job.title} · {ROUND_LABELS[iv.round] || iv.round}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${iv.status === "completed" ? "bg-green-100 text-green-700" : iv.status === "scheduled" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[iv.status] || iv.status}</span>
              {iv.feedbacks.length > 0 && <span className="text-xs text-green-600">已反馈</span>}
            </div>
          </div>
          <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            面试官: {iv.interviewer.name} · {iv.scheduledAt ? new Date(iv.scheduledAt).toLocaleDateString("zh-CN") : "—"}
          </div>
        </button>
      ))}
    </div>
  );
}
