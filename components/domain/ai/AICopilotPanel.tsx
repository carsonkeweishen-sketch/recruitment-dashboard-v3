"use client";

import { useState, useEffect } from "react";
import { AIProvenanceBlock } from "./AIProvenanceBlock";
import { AIHumanReviewControls } from "./AIHumanReviewControls";
import { AINotConfiguredState } from "./AINotConfiguredState";

interface Props {
  objectType: string;
  objectId: string;
  onClose: () => void;
}

export function AICopilotPanel({ objectType, objectId, onClose }: Props) {
  const [providerStatus, setProviderStatus] = useState<string>("loading");
  const [mode, setMode] = useState("summary");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ai/provider/status")
      .then(r => r.json())
      .then(d => setProviderStatus(d.status || "not_configured"))
      .catch(() => setProviderStatus("not_configured"));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectType, objectId, question: question || undefined, mode }),
      });
      const d = await res.json();
      setResult(d);
    } catch { setError("请求失败"); }
    finally { setLoading(false); }
  };

  const handleReview = async (status: string, note?: string) => {
    if (!result?.id) return;
    try {
      await fetch(`/api/ai/insights/${result.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote: note }),
      });
      setResult({ ...result, humanReviewStatus: status });
    } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--color-surface)] h-full overflow-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">AI 招聘助手</h2>
          <button onClick={onClose} className="text-sm text-[var(--color-text-tertiary)]">✕</button>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">基于当前页面上下文和可访问证据，生成辅助分析建议。</p>

        {providerStatus === "not_configured" && <AINotConfiguredState />}
        {providerStatus === "configured" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-tertiary)]">模式</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className="w-full mt-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                <option value="summary">总结分析</option>
                <option value="risk_explain">风险解释</option>
                <option value="follow_up">追问建议</option>
                <option value="closing">Closing 建议</option>
                <option value="next_action">下一步行动</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-tertiary)]">提问（可选）</label>
              <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="输入你的问题..." className="w-full mt-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm" />
            </div>
            <button onClick={handleSubmit} disabled={loading} className="w-full rounded-xl bg-[var(--color-primary)] text-white py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {loading ? "生成中..." : "生成分析"}
            </button>

            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

            {result?.status === "not_configured" && <AINotConfiguredState />}
            {result?.answer && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
                <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">{result.answer}</p>
                {result.suggestedAction && <p className="text-xs text-[var(--color-primary)]">→ {result.suggestedAction}</p>}
                <AIProvenanceBlock result={result} />
                <AIHumanReviewControls insightId={result.id} onReview={handleReview} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
