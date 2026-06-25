"use client";

import { useEffect, useState } from "react";
import { InterviewFeedbackForm } from "./InterviewFeedbackForm";

interface InterviewDetailData {
  interview: { id: string; round: string; status: string; scheduledAt: string | null; completedAt: string | null; createdAt: string };
  application: { candidate: { id: string; name: string; currentCompany: string | null; currentTitle: string | null; tags: string[] }; job: { id: string; title: string; jobCode: string | null; department: { name: string } | null; level: string | null }; owner: { id: string; name: string } | null };
  interviewer: { id: string; name: string };
  feedback: { id: string; scores: Record<string, number>; overallRecommendation: string; evidence: string | null; concerns: string | null; strengths: string | null; suggestedFollowUps: string[]; submittedAt: string | null } | null;
  qualitySignals: { feedbackQualityScore: number; qualityLevel: string; dimensionCompleteness: number; evidenceSufficiency: number; scoreEvidenceConsistency: number; recommendationClarity: number; riskAwareness: number; timeliness: number; suggestions: string[] } | null;
  riskSignals: { riskType: string; riskLevel: string; reason: string; suggestedFollowUpQuestions: string[] }[];
}

const ROUND_LABELS: Record<string, string> = { business_first: "业务初试", business_second: "业务复试", ceo_final: "终面", hr_final: "HR终面" };
const QUALITY_LABELS: Record<string, string> = { excellent: "优秀", good: "良好", needs_improvement: "待改进", insufficient: "不足" };
const QUALITY_COLORS: Record<string, string> = { excellent: "text-green-600 bg-green-50", good: "text-blue-600 bg-blue-50", needs_improvement: "text-yellow-600 bg-yellow-50", insufficient: "text-red-600 bg-red-50" };
const RISK_COLORS: Record<string, string> = { low: "border-l-yellow-400", medium: "border-l-orange-400", high: "border-l-red-500" };

export function InterviewDetailDrawer({ interviewId, onClose }: { interviewId: string | null; onClose: () => void }) {
  const [data, setData] = useState<InterviewDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "feedback" | "quality" | "risk">("overview");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!interviewId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const r = await fetch(`/api/interviews/${interviewId}`);
        const d = await r.json();
        if (!cancelled) setData(d.data);
      } catch { if (!cancelled) setData(null); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [interviewId]);

  async function handleSubmitFeedback(formData: Record<string, unknown>) {
    setSubmitting(true);
    try {
      const r = await fetch(`/api/interviews/${interviewId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const d = await r.json();
      if (!d.success) { alert(d.error || "提交失败"); return; }
      // Reload detail
      const rd = await fetch(`/api/interviews/${interviewId}`);
      const rd2 = await rd.json();
      setData(rd2.data);
      setTab("quality");
    } catch { alert("网络错误"); }
    finally { setSubmitting(false); }
  }

  if (!interviewId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">面试详情</h2>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">✕</button>
        </div>

        {loading && <div className="flex-1 p-5"><div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-surface-tertiary)]" /></div>}
        {!loading && !data && <div className="flex-1 p-5 text-sm text-[var(--color-text-secondary)]">加载失败</div>}

        {data && (
          <>
            <div className="flex border-b border-[var(--color-border)]">
              {(["overview", "feedback", "quality", "risk"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium ${tab === t ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>
                  {t === "overview" ? "概览" : t === "feedback" ? "反馈" : t === "quality" ? "质量" : "风险"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto p-5">
              {tab === "overview" && <OverviewTab data={data} />}
              {tab === "feedback" && <FeedbackTab data={data} onSubmit={handleSubmitFeedback} submitting={submitting} />}
              {tab === "quality" && <QualityTab signals={data.qualitySignals} />}
              {tab === "risk" && <RiskTab signals={data.riskSignals} />}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function OverviewTab({ data }: { data: InterviewDetailData }) {
  const d = data;
  return (
    <div className="space-y-4">
      <div><h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{d.application.candidate.name}</h3></div>
      <div className="grid grid-cols-2 gap-3">
        <F label="岗位" value={d.application.job.title} />
        <F label="轮次" value={ROUND_LABELS[d.interview.round] || d.interview.round} />
        <F label="面试官" value={d.interviewer.name} />
        <F label="状态" value={d.interview.status === "completed" ? "已完成" : d.interview.status === "scheduled" ? "已安排" : d.interview.status} />
        <F label="候选人公司" value={d.application.candidate.currentCompany} />
        <F label="当前岗位" value={d.application.candidate.currentTitle} />
        <F label="部门" value={d.application.job.department?.name} />
        <F label="职级" value={d.application.job.level} />
      </div>
      {d.feedback && (
        <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
          <div className="text-xs text-[var(--color-text-tertiary)]">推荐结论</div>
          <div className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{d.feedback.overallRecommendation}</div>
        </div>
      )}
    </div>
  );
}

function F({ label, value }: { label: string; value?: string | null }) {
  return <div><div className="text-xs text-[var(--color-text-tertiary)]">{label}</div><div className="mt-0.5 text-sm text-[var(--color-text-primary)]">{value ?? "—"}</div></div>;
}

function FeedbackTab({ data, onSubmit, submitting }: { data: InterviewDetailData; onSubmit: (d: Record<string, unknown>) => Promise<void>; submitting: boolean }) {
  if (data.feedback) {
    const fb = data.feedback;
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">✅ 已提交反馈 · {fb.submittedAt ? new Date(fb.submittedAt).toLocaleDateString("zh-CN") : ""}</div>
        <div><div className="text-xs text-[var(--color-text-tertiary)]">评分</div><div className="mt-1 grid grid-cols-2 gap-1">{Object.entries(fb.scores).map(([k, v]) => <div key={k} className="text-sm text-[var(--color-text-primary)]">{k}: {v as number}/5</div>)}</div></div>
        <div><div className="text-xs text-[var(--color-text-tertiary)]">证据</div><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{fb.evidence || "—"}</p></div>
        {fb.concerns && <div><div className="text-xs text-[var(--color-text-tertiary)]">风险点</div><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{fb.concerns}</p></div>}
      </div>
    );
  }
  return <InterviewFeedbackForm onSubmit={onSubmit} submitting={submitting} />;
}

function QualityTab({ signals }: { signals: InterviewDetailData["qualitySignals"] }) {
  if (!signals) return <div className="flex flex-col items-center justify-center py-12 text-center"><div className="mb-2 text-3xl">📊</div><p className="text-sm text-[var(--color-text-secondary)]">暂无反馈质量数据</p><p className="mt-1 text-xs text-[var(--color-text-tertiary)]">提交面试反馈后将自动生成质量评分</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl font-bold text-[var(--color-text-primary)]">{signals.feedbackQualityScore}</div>
        <div className={`rounded-full px-3 py-1 text-xs font-medium ${QUALITY_COLORS[signals.qualityLevel]}`}>{QUALITY_LABELS[signals.qualityLevel]}</div>
      </div>
      <div className="space-y-2">
        {[
          { label: "维度完整度", value: signals.dimensionCompleteness, max: 20 },
          { label: "证据充分度", value: signals.evidenceSufficiency, max: 25 },
          { label: "评分证据一致性", value: signals.scoreEvidenceConsistency, max: 20 },
          { label: "推荐结论清晰度", value: signals.recommendationClarity, max: 15 },
          { label: "风险意识", value: signals.riskAwareness, max: 10 },
          { label: "反馈及时性", value: signals.timeliness, max: 10 },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-28 text-xs text-[var(--color-text-secondary)]">{item.label}</span>
            <div className="flex-1 h-3 rounded bg-[var(--color-surface-tertiary)] overflow-hidden">
              <div className="h-full rounded bg-[var(--color-primary)]" style={{ width: `${(item.value / item.max) * 100}%` }} />
            </div>
            <span className="text-xs text-[var(--color-text-primary)] w-10 text-right">{item.value}/{item.max}</span>
          </div>
        ))}
      </div>
      {signals.suggestions.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] p-3">
          <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">改进建议</div>
          {signals.suggestions.map((s, i) => <p key={i} className="text-sm text-[var(--color-text-secondary)]">• {s}</p>)}
        </div>
      )}
    </div>
  );
}

function RiskTab({ signals }: { signals: InterviewDetailData["riskSignals"] }) {
  if (signals.length === 0) return <div className="flex flex-col items-center justify-center py-12 text-center"><div className="mb-2 text-3xl">✅</div><p className="text-sm text-[var(--color-text-primary)]">未检测到面试表现偏差风险</p></div>;

  return (
    <div className="space-y-3">
      {signals.map((s, i) => (
        <div key={i} className={`rounded-lg border border-[var(--color-border)] border-l-4 p-3 ${RISK_COLORS[s.riskLevel]}`}>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.riskLevel === "high" ? "bg-red-100 text-red-700" : s.riskLevel === "medium" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>{s.riskType}</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">{s.riskLevel.toUpperCase()}</span>
          </div>
          <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{s.reason}</p>
          {s.suggestedFollowUpQuestions.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-[var(--color-text-tertiary)]">建议追问：</div>
              {s.suggestedFollowUpQuestions.map((q, j) => <p key={j} className="text-xs text-[var(--color-text-secondary)]">• {q}</p>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
