"use client";

interface FeedbackItem {
  id: string;
  decision: string;
  reasonCode: string | null;
  reasonText: string | null;
  reviewer: { id: string; name: string } | null;
  job: { id: string; title: string; jobCode: string | null } | null;
  createdAt: string;
}

const DECISION_LABELS: Record<string, string> = { PASS: "通过", REJECT: "拒绝", HOLD: "待定", REDIRECT: "转推" };
const DECISION_COLORS: Record<string, string> = { PASS: "bg-green-100 text-green-800", REJECT: "bg-red-100 text-red-800", HOLD: "bg-yellow-100 text-yellow-800", REDIRECT: "bg-blue-100 text-blue-800" };
const REASON_LABELS: Record<string, string> = {
  EXPERIENCE_MISMATCH: "经验不匹配",
  CAPABILITY_GAP: "能力不足",
  SENIORITY_MISMATCH: "资历不匹配",
  SALARY_GAP: "薪资差距",
  EXPECTATION_MISMATCH: "期望不匹配",
  COMMUNICATION_GAP: "沟通问题",
  STABILITY_RISK: "稳定性风险",
  CULTURE_MISMATCH: "文化不匹配",
  LOCATION_ISSUE: "地点问题",
  OTHER: "其他",
};

export function BusinessFeedbackTimeline({ feedbacks, loading }: { feedbacks: FeedbackItem[]; loading?: boolean }) {
  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--color-surface-tertiary)]" />)}</div>;
  if (feedbacks.length === 0) return <div className="flex flex-col items-center justify-center py-12 text-center"><div className="mb-3 text-4xl">📋</div><h3 className="text-sm font-medium text-[var(--color-text-primary)]">暂无业务反馈</h3><p className="mt-1 text-sm text-[var(--color-text-secondary)]">该岗位尚未收到业务筛选反馈。</p></div>;

  return (
    <div className="space-y-3">
      {feedbacks.map((f) => (
        <div key={f.id} className="rounded-lg border border-[var(--color-border)] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DECISION_COLORS[f.decision] || "bg-gray-100 text-gray-800"}`}>{DECISION_LABELS[f.decision] || f.decision}</span>
              {f.reasonCode && <span className="text-xs text-[var(--color-text-secondary)]">{REASON_LABELS[f.reasonCode] || f.reasonCode}</span>}
            </div>
            <span className="text-xs text-[var(--color-text-tertiary)]">{new Date(f.createdAt).toLocaleDateString("zh-CN")}</span>
          </div>
          {f.reasonText && <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{f.reasonText}</p>}
          <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
            <span>评审人: {f.reviewer?.name ?? "—"}</span>
            {f.job && <span>岗位: {f.job.title}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
