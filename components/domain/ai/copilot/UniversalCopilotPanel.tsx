"use client";

import { useState, useCallback, useEffect } from "react";
import { useCopilotContext } from "./CopilotContext";
import { CopilotContextStack } from "./CopilotContextStack";
import { CopilotAnswerCard } from "./CopilotAnswerCard";
import { CopilotCitationList } from "./CopilotCitationList";
import { CopilotHumanReviewBar } from "./CopilotHumanReviewBar";
import { CopilotDraftActionPreview } from "./CopilotDraftActionPreview";
import { tokens, componentStyles } from "@/components/ui/design-tokens";

// ============================================================================
// Types
// ============================================================================

interface ContextRef {
  refType: string;
  refId: string;
  sourceLabel: string;
  excerpt: string;
  hasEvidence: boolean;
}

interface DraftAction {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  answerStatus?: string;
  messageId?: string;
  contextRefs?: ContextRef[];
  draftActions?: DraftAction[];
  provider?: string;
  model?: string;
  promptVersion?: string;
  humanReviewStatus?: string;
}

interface ProviderStatus {
  status: string;
  provider?: string;
  model?: string;
  message?: string;
}

// ============================================================================
// Component
// ============================================================================

export function UniversalCopilotPanel() {
  const ctx = useCopilotContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [contextRefs, setContextRefs] = useState<ContextRef[]>([]);
  const [showContextStack, setShowContextStack] = useState(false);

  // Load provider health + suggestions when panel opens
  useEffect(() => {
    if (!ctx.isPanelOpen) return;
    fetch("/api/ai/copilot/provider-health")
      .then((r) => r.json())
      .then((d) => { if (d.success) setProviderStatus(d.data); })
      .catch(() => {});
    fetch(`/api/ai/copilot/suggestions?moduleKey=${ctx.moduleKey}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSuggestions(d.data || []); })
      .catch(() => {});
    // Load context preview
    fetch(`/api/ai/copilot/context?moduleKey=${ctx.moduleKey}&objectType=${ctx.objectType}&objectId=${ctx.objectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setContextRefs(d.data?.sources || []);
      })
      .catch(() => {});
  }, [ctx.isPanelOpen, ctx.moduleKey, ctx.objectType, ctx.objectId]);

  const handleSend = useCallback(async (question?: string) => {
    const q = question || input;
    if (!q.trim() || loading) return;
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: q }]);

    try {
      const res = await fetch("/api/ai/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleKey: ctx.moduleKey,
          objectType: ctx.objectType,
          objectId: ctx.objectId,
          question: q,
        }),
      });
      const d = await res.json();
      if (d.success) {
        const data = d.data;
        setContextRefs(data.contextRefs || []);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer || data.status === "no_evidence" ? "当前上下文证据不足，无法生成 AI 建议。请补充相关数据后再试。" : "AI 助手暂时不可用",
            answerStatus: data.status,
            messageId: data.messageId,
            contextRefs: data.contextRefs,
            draftActions: data.draftActions,
            provider: data.provider,
            model: data.model,
            promptVersion: data.promptVersion,
            humanReviewStatus: "pending",
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: d.error || "请求失败", answerStatus: "error" }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "网络错误，请稍后重试", answerStatus: "error" }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, ctx.moduleKey, ctx.objectType, ctx.objectId]);

  if (!ctx.isPanelOpen) return null;

  const isNotConfigured = providerStatus?.status === "not_configured";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" data-copilot-panel="true">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={ctx.closePanel} />
      <div className="relative w-full max-w-xl h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-5 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">AI Copilot</h2>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {ctx.moduleKey} · {ctx.objectType}
            </p>
          </div>
          <button onClick={ctx.closePanel} className="rounded-lg p-2 hover:bg-[var(--color-surface-tertiary)]" aria-label="关闭">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Provider not configured */}
        {isNotConfigured && (
          <div className="p-4 m-4 rounded-lg bg-[var(--color-warning-light)] border border-[var(--color-warning)]">
            <p className="text-sm text-[var(--color-warning)] font-medium">⚠️ AI Provider 未配置</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              {providerStatus?.message || "请在集成页面配置 DeepSeek API Key 后使用 AI Copilot。"}
            </p>
          </div>
        )}

        {/* Context Stack Toggle */}
        <div className="px-5 py-2 border-b border-[var(--color-border-light)]">
          <button
            onClick={() => setShowContextStack(!showContextStack)}
            className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] flex items-center gap-1"
          >
            <span>{showContextStack ? "▼" : "▶"}</span>
            上下文来源（{contextRefs.length}）
          </button>
          {showContextStack && (
            <CopilotContextStack sources={contextRefs} />
          )}
        </div>

        {/* Safety Banner */}
        <div className="px-5 py-2 bg-[var(--color-info-light)] border-b border-[var(--color-info)]">
          <p className="text-xs text-[var(--color-info)]">
            🛡️ AI 辅助建议，仅供参考；���结合实际业务判断。系统不会自动录用、淘汰或推进候选人。
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-text-tertiary)] mb-4">向 AI Copilot 提问，获取基于证据的辅助建议</p>
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="block w-full text-left px-3 py-2 rounded-lg bg-[var(--color-surface-tertiary)] hover:bg-[var(--color-primary-light)] text-xs text-[var(--color-text-secondary)] transition-colors"
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[85%] rounded-lg px-4 py-2 ${msg.role === "user" ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)]"}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "assistant" && msg.answerStatus === "generated" && (
                  <>
                    <CopilotAnswerCard
                      provider={msg.provider}
                      model={msg.model}
                      promptVersion={msg.promptVersion}
                    />
                    {msg.contextRefs && msg.contextRefs.length > 0 && (
                      <CopilotCitationList citations={msg.contextRefs} />
                    )}
                    {msg.draftActions && msg.draftActions.length > 0 && (
                      <CopilotDraftActionPreview drafts={msg.draftActions} />
                    )}
                    {msg.messageId && (
                      <CopilotHumanReviewBar
                        messageId={msg.messageId}
                        reviewStatus={msg.humanReviewStatus || "pending"}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-2 bg-[var(--color-surface-tertiary)]">
                <p className="text-sm text-[var(--color-text-tertiary)] animate-pulse">AI 正在分析...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-5 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="输入问题..."
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
