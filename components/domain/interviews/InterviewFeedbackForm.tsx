"use client";

import { useState } from "react";
import { FormModal } from "@/components/ui/FormModal";

interface Props {
  interviewId: string;
  candidateName: string;
  jobTitle: string;
  round: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const DIMENSIONS = [
  { key: "role_competency", label: "岗位胜任力", hint: "候选人在该岗位核心能力上的匹配程度" },
  { key: "business_understanding", label: "业务理解", hint: "对行业、市场、业务逻辑的理解深度" },
  { key: "problem_solving", label: "问题解决", hint: "分析问题、提出解决方案的能力" },
  { key: "communication", label: "沟通表达", hint: "语言组织、逻辑表达、倾听回应能力" },
  { key: "ownership_collaboration", label: "责任心与协同", hint: "owner 意识、团队协作经验" },
  { key: "motivation_stability", label: "动机与稳定性", hint: "职业动机、跳槽原因、稳定性评估" },
];

const RECOMMENDATIONS = [
  { value: "STRONG_HIRE", label: "强烈推荐" },
  { value: "HIRE", label: "推荐" },
  { value: "HOLD", label: "保留" },
  { value: "NO_HIRE", label: "不推荐" },
  { value: "STRONG_NO_HIRE", label: "强烈不推荐" },
];

export function InterviewFeedbackForm({
  interviewId,
  candidateName,
  jobTitle,
  round,
  onSuccess,
  onCancel,
}: Props) {
  const [scores, setScores] = useState<Record<string, number>>({
    role_competency: 3,
    business_understanding: 3,
    problem_solving: 3,
    communication: 3,
    ownership_collaboration: 3,
    motivation_stability: 3,
  });
  const [recommendation, setRecommendation] = useState("HIRE");
  const [evidenceText, setEvidenceText] = useState("");
  const [riskNotes, setRiskNotes] = useState("");
  const [followUpQuestions, setFollowUpQuestions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    // Validate
    if (evidenceText.trim().length < 10) {
      setError("面试证据至少需要 10 个字符");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores,
          overallRecommendation: recommendation,
          evidenceText: evidenceText.trim(),
          riskNotes: riskNotes.trim() || undefined,
          suggestedFollowUpQuestions: followUpQuestions
            .split("\n")
            .filter((q) => q.trim().length > 0),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "提交失败");
        return;
      }

      onSuccess();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      title="提交面试反馈"
      onClose={onCancel}
      onSubmit={handleSubmit}
      submitLabel={submitting ? "提交中..." : "提交反馈"}
      submitting={submitting}
    >
      <div className="flex flex-col gap-6">
        {/* Header info */}
        <div className="rounded-md bg-[var(--color-surface-secondary)] p-3">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">
            {candidateName} · {jobTitle}
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)]">
            面试轮次：{round}
          </div>
        </div>

        {/* Six dimensions scoring */}
        <div>
          <div className="mb-3 text-sm font-medium text-[var(--color-text-primary)]">
            一、六维度评分
          </div>
          <div className="flex flex-col gap-3">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="flex items-center gap-3">
                <div className="w-32 shrink-0">
                  <div className="text-sm text-[var(--color-text-primary)]">{dim.label}</div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">{dim.hint}</div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setScores((s) => ({ ...s, [dim.key]: value }))}
                      className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                        scores[dim.key] === value
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <div className="mb-3 text-sm font-medium text-[var(--color-text-primary)]">
            二、推荐结论
          </div>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDATIONS.map((rec) => (
              <button
                key={rec.value}
                type="button"
                onClick={() => setRecommendation(rec.value)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  recommendation === rec.value
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]"
                }`}
              >
                {rec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence */}
        <div>
          <div className="mb-1 text-sm font-medium text-[var(--color-text-primary)]">
            三、面试证据 <span className="text-red-500">*</span>
          </div>
          <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">
            请用 STAR 方法记录：情境-任务-行动-结果。避免仅写&ldquo;感觉不错&rdquo;、&ldquo;还可以&rdquo;。
          </div>
          <textarea
            value={evidenceText}
            onChange={(e) => setEvidenceText(e.target.value)}
            rows={5}
            placeholder="候选人在XX项目中负责...具体表现为...数据结果是..."
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            已输入 {evidenceText.length} 字（最少 10 字）
          </div>
        </div>

        {/* Risk Notes */}
        <div>
          <div className="mb-1 text-sm font-medium text-[var(--color-text-primary)]">
            四、风险记录（选填）
          </div>
          <textarea
            value={riskNotes}
            onChange={(e) => setRiskNotes(e.target.value)}
            rows={3}
            placeholder="需要进一步验证的能力、潜在顾虑、薪资预期差距等"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Follow-up questions */}
        <div>
          <div className="mb-1 text-sm font-medium text-[var(--color-text-primary)]">
            五、建议追问（选填，每行一个）
          </div>
          <textarea
            value={followUpQuestions}
            onChange={(e) => setFollowUpQuestions(e.target.value)}
            rows={3}
            placeholder="请补充说明该项目的具体数据结果。&#10;如果再次遇到相同阻力，你会如何处理？"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-md bg-[var(--color-warning-light)] p-2 text-xs text-[var(--color-text-tertiary)]">
          ⚠️ 此反馈仅作为面试参考，不会自动推进候选人阶段或做出录用决定。最终决策请基于面试官综合判断。
        </div>
      </div>
    </FormModal>
  );
}
