"use client";

import React from "react";
import { DetailDrawer } from "@/components/ui/DetailDrawer";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface InterviewData {
  id: string;
  round: string;
  status: string;
  scheduledAt: string | null;
  completedAt: string | null;
  application: {
    id: string;
    stage: string;
    candidate: { id: string; name: string; currentCompany: string; currentTitle: string };
    job: { id: string; title: string; jobCode: string; department: { name: string }; level: string };
  };
  interviewer: { id: string; name: string };
  feedbacks: Array<{
    id: string;
    overallRecommendation: string | null;
    scores: Record<string, number> | null;
    evidenceText: string | null;
    riskNotes: string | null;
    feedbackQualityScore: number | null;
    qualityLevel: string | null;
    riskSignals: unknown;
    submittedAt: string | null;
  }>;
}

interface Props {
  interview: InterviewData;
  onClose: () => void;
  onSubmitFeedback: () => void;
}

const ROUND_LABELS: Record<string, string> = {
  hr_initial: "HR 初筛",
  business_first: "业务一面",
  business_second: "业务二面",
  ceo_final: "终面",
  cross_function: "跨职能面",
};

const DIMENSION_LABELS: Record<string, string> = {
  role_competency: "岗位胜任力",
  business_understanding: "业务理解",
  problem_solving: "问题解决",
  communication: "沟通表达",
  ownership_collaboration: "责任心与协同",
  motivation_stability: "动机与稳定性",
};

const RECOMMENDATION_STYLES: Record<string, string> = {
  STRONG_HIRE: "bg-green-100 text-green-800",
  HIRE: "bg-green-50 text-green-700",
  HOLD: "bg-amber-50 text-amber-700",
  NO_HIRE: "bg-red-50 text-red-700",
  STRONG_NO_HIRE: "bg-red-100 text-red-800",
};

const QUALITY_STYLES: Record<string, string> = {
  excellent: "text-green-600",
  good: "text-blue-600",
  needs_improvement: "text-amber-600",
  insufficient: "text-red-600",
};

export function InterviewDetailDrawer({ interview, onClose, onSubmitFeedback }: Props): React.ReactElement {
  const hasFeedback = interview.feedbacks.length > 0;
  const feedback = hasFeedback ? interview.feedbacks[0] : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const riskList: any[] = (feedback?.riskSignals && Array.isArray(feedback.riskSignals))
    ? feedback.riskSignals
    : [];

  const renderContent = (): React.ReactNode => (
    <div className="flex flex-col gap-6">
      {/* Overview */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">概览</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">候选人</div>
            <div className="font-medium text-[var(--color-text-primary)]">
              {interview.application.candidate.name}
            </div>
            <div className="text-xs text-[var(--color-text-tertiary)]">
              {interview.application.candidate.currentCompany} · {interview.application.candidate.currentTitle}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">岗位</div>
            <div className="font-medium text-[var(--color-text-primary)]">
              {interview.application.job.title}
            </div>
            <div className="text-xs text-[var(--color-text-tertiary)]">
              {interview.application.job.department.name} · {interview.application.job.level}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">面试轮次</div>
            <div className="text-sm text-[var(--color-text-primary)]">
              {ROUND_LABELS[interview.round] || interview.round}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">面试官</div>
            <div className="text-sm text-[var(--color-text-primary)]">
              {interview.interviewer.name}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
            <StatusBadge label={interview.status === "completed" ? "已完成" : "待面试"} variant={interview.status === "completed" ? "success" : "default"} />
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">面试时间</div>
            <div className="text-sm text-[var(--color-text-primary)]">
              {interview.scheduledAt
                ? new Date(interview.scheduledAt).toLocaleDateString("zh-CN")
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Feedback */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">结构化反馈</h3>
          {!hasFeedback && (
            <button
              onClick={onSubmitFeedback}
              className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              提交反馈
            </button>
          )}
        </div>
        {!hasFeedback ? (
          <div className="py-8 text-center">
            <div className="text-sm text-[var(--color-text-tertiary)]">尚未提交面试反馈</div>
            <button
              onClick={onSubmitFeedback}
              className="mt-3 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              提交反馈
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {feedback!.scores && (
              <div>
                <div className="mb-2 text-xs font-medium text-[var(--color-text-tertiary)]">六维度评分</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
                    const score = (feedback!.scores as Record<string, number>)[key];
                    return (
                      <div key={key} className="flex items-center justify-between rounded-md bg-[var(--color-surface-secondary)] px-3 py-2">
                        <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {score != null ? `${score}/5` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {feedback!.overallRecommendation && (
              <div>
                <div className="mb-1 text-xs font-medium text-[var(--color-text-tertiary)]">推荐结论</div>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${RECOMMENDATION_STYLES[feedback!.overallRecommendation] || ""}`}>
                  {feedback!.overallRecommendation}
                </span>
              </div>
            )}
            {feedback!.evidenceText && (
              <div>
                <div className="mb-1 text-xs font-medium text-[var(--color-text-tertiary)]">面试证据</div>
                <div className="rounded-md bg-[var(--color-surface-secondary)] p-3 text-sm text-[var(--color-text-secondary)]">
                  {feedback!.evidenceText}
                </div>
              </div>
            )}
            {feedback!.riskNotes && (
              <div>
                <div className="mb-1 text-xs font-medium text-[var(--color-text-tertiary)]">风险记录</div>
                <div className="rounded-md bg-[var(--color-warning-light)] p-3 text-sm text-[var(--color-text-secondary)]">
                  {feedback!.riskNotes}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quality */}
      {feedback && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">反馈质量</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${QUALITY_STYLES[feedback.qualityLevel || ""] || ""}`}>
                {feedback.feedbackQualityScore ?? "—"}
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">质量分</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-[var(--color-text-primary)]">
                {feedback.qualityLevel === "excellent" && "优秀"}
                {feedback.qualityLevel === "good" && "良好"}
                {feedback.qualityLevel === "needs_improvement" && "待提升"}
                {feedback.qualityLevel === "insufficient" && "不足"}
                {!feedback.qualityLevel && "—"}
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">质量等级</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[var(--color-text-tertiary)]">
                {feedback.submittedAt
                  ? new Date(feedback.submittedAt).toLocaleDateString("zh-CN")
                  : "—"}
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">提交时间</div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Signals */}
      {riskList.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">面试表现偏差风险</h3>
          <div className="flex flex-col gap-3">
            {riskList.map((signal: { riskType: string; riskLevel: string; reason: string; suggestedFollowUpQuestions?: string[] }, i: number) => (
              <div
                key={i}
                className={`rounded-md border p-3 ${
                  signal.riskLevel === "high"
                    ? "border-red-200 bg-red-50"
                    : signal.riskLevel === "medium"
                    ? "border-amber-200 bg-amber-50"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    signal.riskLevel === "high" ? "bg-red-200 text-red-800"
                    : signal.riskLevel === "medium" ? "bg-amber-200 text-amber-800"
                    : "bg-blue-200 text-blue-800"
                  }`}>
                    {signal.riskLevel === "high" ? "高" : signal.riskLevel === "medium" ? "中" : "低"}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{signal.riskType}</span>
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-secondary)]">{signal.reason}</div>
                {signal.suggestedFollowUpQuestions && signal.suggestedFollowUpQuestions.length > 0 && (
                  <div className="mt-2 border-t border-[var(--color-border)] pt-2">
                    <div className="text-xs font-medium text-[var(--color-text-tertiary)]">建议追问：</div>
                    {signal.suggestedFollowUpQuestions.map((q: string, j: number) => (
                      <div key={j} className="text-xs text-[var(--color-text-secondary)]">· {q}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">活动</h3>
        <div className="text-xs text-[var(--color-text-tertiary)]">
          {feedback?.submittedAt
            ? `面试反馈于 ${new Date(feedback.submittedAt).toLocaleString("zh-CN")} 提交`
            : "暂无活动记录"}
        </div>
      </div>
    </div>
  );

  return (
    <DetailDrawer onClose={onClose} title="面试详情" width="w-[640px]">
      {renderContent()}
    </DetailDrawer>
  );
}
