"use client";

import { useState } from "react";

const DIMENSIONS = [
  { key: "role_competency", label: "岗位胜任力", hint: "专业技能、行业经验、岗位匹配度" },
  { key: "business_understanding", label: "业务理解", hint: "对业务模式、市场、客户的理解" },
  { key: "problem_solving", label: "问题解决", hint: "分析能力、逻辑思维、解决方案设计" },
  { key: "communication", label: "沟通表达", hint: "表达清晰度、逻辑性、倾听能力" },
  { key: "ownership_collaboration", label: "责任心与协同", hint: "主动性、团队协作、结果导向" },
  { key: "motivation_stability", label: "动机与稳定性", hint: "职业规划、离职原因、稳定性" },
];

const RECOMMENDATIONS = [
  { value: "STRONG_HIRE", label: "强烈推荐", color: "bg-green-600" },
  { value: "HIRE", label: "推荐", color: "bg-green-500" },
  { value: "HOLD", label: "待定", color: "bg-yellow-500" },
  { value: "NO_HIRE", label: "不推荐", color: "bg-red-500" },
  { value: "STRONG_NO_HIRE", label: "强烈不推荐", color: "bg-red-600" },
];

export function InterviewFeedbackForm({ onSubmit, submitting }: { onSubmit: (data: Record<string, unknown>) => Promise<void>; submitting: boolean }) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [recommendation, setRecommendation] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [riskNotes, setRiskNotes] = useState("");
  const [strengths, setStrengths] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    const filled = Object.keys(scores).length;
    if (filled < 6) { setError("请完成全部 6 个维度的评分"); return; }
    if (!recommendation) { setError("请选择推荐结论"); return; }

    await onSubmit({
      scores,
      overallRecommendation: recommendation,
      evidenceText: evidenceText || undefined,
      riskNotes: riskNotes || undefined,
      strengths: strengths || undefined,
      suggestedFollowUpQuestions: followUp ? [followUp] : undefined,
    });
  }

  return (
    <div className="space-y-5">
      {/* Scores */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">评分维度 (1-5)</div>
        <div className="space-y-3">
          {DIMENSIONS.map((dim) => (
            <div key={dim.key} className="flex items-center gap-3">
              <div className="w-32 shrink-0">
                <div className="text-sm text-[var(--color-text-primary)]">{dim.label}</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">{dim.hint}</div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setScores((s) => ({ ...s, [dim.key]: n }))}
                    className={`h-8 w-8 rounded text-sm font-medium transition-colors ${scores[dim.key] === n ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">推荐结论</div>
        <div className="flex gap-2">
          {RECOMMENDATIONS.map((r) => (
            <button key={r.value} onClick={() => setRecommendation(r.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${recommendation === r.value ? r.color + " text-white" : "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">证据说明 *</label>
        <textarea value={evidenceText} onChange={(e) => setEvidenceText(e.target.value)} rows={4}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] resize-none"
          placeholder="请描述候选人的具体表现、项目案例、数据结果等。避免使用'感觉不错''还可以'等模糊表述。" />
      </div>

      {/* Strengths */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">候选人优势</label>
        <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={2}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] resize-none" />
      </div>

      {/* Risk Notes */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">风险点 / 待验证问题</label>
        <textarea value={riskNotes} onChange={(e) => setRiskNotes(e.target.value)} rows={2}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] resize-none"
          placeholder="记录候选人的潜在风险、需要后续验证的问题" />
      </div>

      {/* Follow-up */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">补充追问建议</label>
        <input value={followUp} onChange={(e) => setFollowUp(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          placeholder="下一轮面试建议追问的问题" />
      </div>

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <button onClick={handleSubmit} disabled={submitting}
        className="w-full rounded-md bg-[var(--color-primary)] py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
        {submitting ? "提交中..." : "提交反馈"}
      </button>
    </div>
  );
}
