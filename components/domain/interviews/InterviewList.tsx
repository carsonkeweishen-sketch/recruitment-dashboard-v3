"use client";

interface InterviewItem {
  id: string;
  round: string;
  status: string;
  scheduledAt: string | null;
  application: {
    id: string;
    stage: string;
    candidate: { id: string; name: string; currentCompany: string; currentTitle: string };
    job: { id: string; title: string; jobCode: string; department: { name: string }; level: string };
  };
  interviewer: { id: string; name: string };
  feedbacks: Array<{
    feedbackQualityScore: number | null;
    qualityLevel: string | null;
  }>;
}

interface Props {
  interviews: InterviewItem[];
  onInterviewClick: (interview: InterviewItem) => void;
}

const ROUND_LABELS: Record<string, string> = {
  hr_initial: "HR 初筛",
  business_first: "业务一面",
  business_second: "业务二面",
  ceo_final: "终面",
  cross_function: "跨职能面",
};

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-gray-50 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "待面试",
  completed: "已完成",
  cancelled: "已取消",
};

const QUALITY_LEVEL_STYLES: Record<string, string> = {
  excellent: "bg-green-50 text-green-700",
  good: "bg-blue-50 text-blue-700",
  needs_improvement: "bg-amber-50 text-amber-700",
  insufficient: "bg-red-50 text-red-700",
};

export function InterviewList({ interviews, onInterviewClick }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                候选人
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                岗位
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                轮次
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                面试官
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                状态
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                质量分
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {interviews.map((interview) => (
              <tr
                key={interview.id}
                onClick={() => onInterviewClick(interview)}
                className="cursor-pointer transition-colors hover:bg-[var(--color-surface-tertiary)]"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--color-text-primary)]">
                    {interview.application.candidate.name}
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">
                    {interview.application.candidate.currentCompany} · {interview.application.candidate.currentTitle}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[var(--color-text-primary)]">
                    {interview.application.job.title}
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">
                    {interview.application.job.jobCode}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                  {ROUND_LABELS[interview.round] || interview.round}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                  {interview.interviewer.name}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[interview.status] || "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {STATUS_LABELS[interview.status] || interview.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {interview.feedbacks.length > 0 && interview.feedbacks[0].feedbackQualityScore != null ? (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        QUALITY_LEVEL_STYLES[interview.feedbacks[0].qualityLevel || ""] || ""
                      }`}
                    >
                      {interview.feedbacks[0].feedbackQualityScore}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--color-text-tertiary)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInterviewClick(interview);
                    }}
                    className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                  >
                    查看
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
