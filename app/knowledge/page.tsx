"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// ============================================================================
// Type definitions
// ============================================================================

interface Collection {
  id: string;
  key: string;
  name: string;
  description?: string;
  visibility: string;
  status: string;
  createdAt: string;
}

interface Stats {
  collections: number;
  documents: number;
  chunks: number;
  indexedChunks: number;
  answers: number;
}

interface SearchResult {
  chunkId: string;
  dataSourceId: string;
  dataSourceChunkId?: string;
  sourceLabel: string;
  collection: string;
  summary: string;
  quote?: string;
  evidenceLevel: string;
  score: number;
}

interface SearchResponse {
  results: SearchResult[];
  noEvidence: boolean;
}

interface Citation {
  id: string;
  knowledgeAnswerId: string;
  knowledgeChunkId: string;
  dataSourceId?: string;
  dataSourceChunkId?: string;
  sourceLabel: string;
  quote?: string;
  summary?: string;
  score?: number;
}

interface Answer {
  id: string;
  question: string;
  answer?: string;
  answerStatus: string;
  generatedBy: string;
  provider?: string;
  model?: string;
  promptVersion?: string;
  humanReviewStatus: string;
  disclaimer?: string;
  citations: Citation[];
  createdAt: string;
}

interface Document {
  id: string;
  collectionId: string;
  dataSourceId: string;
  title: string;
  sourceType: string;
  indexStatus: string;
  chunkCount: number;
  lastIndexedAt?: string;
  usageType?: string;
  objectType?: string;
  objectId?: string;
}

interface Chunk {
  id: string;
  knowledgeDocumentId: string;
  dataSourceChunkId?: string;
  chunkIndex: number;
  contentText?: string;
  contentSummary?: string;
  tags?: string;
  tokenCount?: number;
  evidenceLevel: string;
  embeddingStatus: string;
}

interface IndexJob {
  id: string;
  dataSourceId: string;
  knowledgeDocumentId?: string;
  status: string;
  startedAt?: string;
  finishedAt?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
}

interface DocumentDetail extends Document {
  chunks: Chunk[];
  indexJobs: IndexJob[];
}

// ============================================================================
// Sub-components
// ============================================================================

function ReviewStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
    pending: { label: "待审核", variant: "warning" },
    accepted: { label: "已采纳", variant: "success" },
    edited: { label: "已编辑", variant: "info" },
    rejected: { label: "已驳回", variant: "danger" },
  };
  const s = map[status] ?? { label: status, variant: "default" as const };
  return <StatusBadge label={s.label} variant={s.variant} />;
}

function EvidenceLevelBadge({ level }: { level: string }) {
  const map: Record<string, { label: string; variant: "success" | "warning" | "danger" | "default" }> = {
    A: { label: "A级", variant: "success" },
    B: { label: "B级", variant: "default" },
    C: { label: "C级", variant: "warning" },
    D: { label: "D级", variant: "danger" },
    unknown: { label: "未知", variant: "default" },
  };
  const s = map[level] ?? { label: level, variant: "default" as const };
  return <StatusBadge label={s.label} variant={s.variant} />;
}

function EmbeddingStatusBadge({ status }: { status: string }) {
  if (status === "not_configured") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border-strong)]" />
        未配置向量
      </span>
    );
  }
  return <StatusBadge label={status} variant="default" />;
}

function SearchModeBadge({ mode }: { mode: string }) {
  const labels: Record<string, string> = { keyword: "关键词", fulltext: "全文搜索", semantic: "语义搜索", vector: "向量搜索" };
  return <span className="text-xs text-[var(--color-text-tertiary)]">搜索模式: {labels[mode] ?? mode}</span>;
}

function CitationPreview({
  citation,
  onClose,
}: {
  citation: Citation | SearchResult;
  onClose: () => void;
}) {
  const sourceLabel = (citation as Citation).sourceLabel || (citation as SearchResult).sourceLabel;
  const quote = (citation as Citation).quote || (citation as SearchResult).quote;
  const chunkId = (citation as Citation).knowledgeChunkId || (citation as SearchResult).chunkId;
  const dataSourceId = (citation as Citation).dataSourceId || (citation as SearchResult).dataSourceId;
  const evidenceLevel = (citation as Citation).score !== undefined
    ? String(((citation as Citation).score ?? 0) * 10)
    : (citation as SearchResult).evidenceLevel;
  const score = (citation as Citation).score ?? (citation as SearchResult).score;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--color-surface)] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">引用详情</h3>
          <button onClick={onClose} className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
            ✕
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-xs text-[var(--color-text-tertiary)]">来源</span>
            <p className="font-medium text-[var(--color-text-primary)]">{sourceLabel}</p>
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-tertiary)]">引用内容</span>
            <p className="text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] rounded-lg p-3 mt-1 max-h-40 overflow-y-auto">
              {quote || "—"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-[var(--color-text-tertiary)]">分块ID</span>
              <p className="text-xs font-mono text-[var(--color-text-secondary)] truncate">{chunkId}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--color-text-tertiary)]">资料源ID</span>
              <p className="text-xs font-mono text-[var(--color-text-secondary)] truncate">{dataSourceId || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-[var(--color-text-tertiary)]">证据等级</span>
              <p className="text-sm font-medium">{evidenceLevel}</p>
            </div>
            {score !== undefined && (
              <div>
                <span className="text-xs text-[var(--color-text-tertiary)]">相关性得分</span>
                <p className="text-sm font-medium">{typeof score === "number" ? score.toFixed(2) : score}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function KnowledgePage() {
  // Collections & navigation
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // AI Answer
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [askQuestion, setAskQuestion] = useState("");

  // Citation preview
  const [previewCitation, setPreviewCitation] = useState<Citation | SearchResult | null>(null);

  // Document detail drawer
  const [docDetail, setDocDetail] = useState<DocumentDetail | null>(null);
  const [docDetailLoading, setDocDetailLoading] = useState(false);
  const [docTab, setDocTab] = useState<"overview" | "chunks">("overview");

  // Index jobs
  const [indexJobs, setIndexJobs] = useState<IndexJob[] | null>(null);
  const [indexJobsLoading, setIndexJobsLoading] = useState(false);
  const [showIndexJobs, setShowIndexJobs] = useState(false);

  // Review
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [editAnswerText, setEditAnswerText] = useState("");
  const [showEditInput, setShowEditInput] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  // General state
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // ==========================================================================
  // Data fetching
  // ==========================================================================

  useEffect(() => {
    setCollectionsLoading(true);
    fetch("/api/knowledge/collections")
      .then((r) => {
        if (r.status === 403) { setPermissionDenied(true); throw new Error("permission_denied"); }
        return r.json();
      })
      .then((d) => {
        if (!d.success) { setError(d.error || "加载失败"); return; }
        setCollections(d.data || []);
        // Don't auto-select — user can pick or search all
      })
      .catch((e) => {
        if ((e as Error).message !== "permission_denied") setError("加载集合失败");
      })
      .finally(() => setCollectionsLoading(false));

    fetch("/api/knowledge/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); });

    setIndexJobsLoading(true);
    fetch("/api/knowledge/index-jobs")
      .then((r) => r.json())
      .then((d) => { if (d.success) setIndexJobs(d.data || []); })
      .catch(() => {})
      .finally(() => setIndexJobsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================================
  // Search
  // ==========================================================================

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setAnswer(null);
    const params = new URLSearchParams({ q: searchQuery });
    if (activeCollection) params.set("collection", activeCollection);
    fetch(`/api/knowledge/search?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSearchResults(d.data);
        else setError(d.error);
      })
      .catch(() => setError("搜索失败"))
      .finally(() => setSearchLoading(false));
  };

  // ==========================================================================
  // Ask AI
  // ==========================================================================

  const handleAsk = () => {
    if (!askQuestion.trim()) return;
    setAnswerLoading(true);
    setSearchResults(null);
    fetch("/api/knowledge/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: askQuestion, collectionKey: activeCollection }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAnswer(d.data);
          if (d.data.answerId) fetchAnswerDetail(d.data.answerId);
        } else {
          setError(d.error);
        }
      })
      .catch(() => setError("问答请求失败"))
      .finally(() => setAnswerLoading(false));
  };

  const fetchAnswerDetail = (id: string) => {
    fetch(`/api/knowledge/answers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAnswer(d.data);
      });
  };

  // ==========================================================================
  // Document detail
  // ==========================================================================

  const openDocDetail = (dataSourceId: string) => {
    setDocDetailLoading(true);
    setDocDetail(null);
    fetch(`/api/knowledge/documents`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        const docs: Document[] = d.data || [];
        const found = docs.find((doc) => doc.dataSourceId === dataSourceId);
        if (!found) return;
        // Fetch chunks via data-sources API
        fetch(`/api/data-sources/${dataSourceId}/chunks`)
          .then((r2) => r2.json())
          .then((d2) => {
            setDocDetail({
              ...found,
              chunks: d2.success ? (d2.data || []) : [],
              indexJobs: (indexJobs || []).filter((j) => j.dataSourceId === dataSourceId),
            });
          });
      })
      .catch(() => {})
      .finally(() => setDocDetailLoading(false));
  };

  // ==========================================================================
  // Review actions
  // ==========================================================================

  const handleReview = (status: "accepted" | "edited" | "rejected") => {
    if (!answer?.id) return;
    setReviewLoading(true);
    const body: Record<string, unknown> = { humanReviewStatus: status };
    if (status === "edited" && editAnswerText) body.editedAnswer = editAnswerText;
    fetch(`/api/knowledge/answers/${answer.id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setReviewStatus(status);
          if (d.data) {
            setAnswer((prev) => prev ? { ...prev, humanReviewStatus: status, ...(d.data.answer ? { answer: d.data.answer } : {}) } : prev);
          } else {
            setAnswer((prev) => prev ? { ...prev, humanReviewStatus: status } : prev);
          }
          setShowEditInput(false);
        }
      })
      .catch(() => {})
      .finally(() => setReviewLoading(false));
  };

  // ==========================================================================
  // Render helpers
  // ==========================================================================

  const getStatusVariant = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case "indexed": return "success";
      case "indexing": return "warning";
      case "failed": return "danger";
      default: return "default";
    }
  };

  const getIndexStatusLabel = (status: string) => {
    const map: Record<string, string> = { indexed: "已索引", indexing: "索引中", failed: "失败", pending: "待处理" };
    return map[status] || status;
  };

  // ==========================================================================
  // Permission denied state
  // ==========================================================================

  if (permissionDenied) {
    return (
      <ProductShell title="知识库" description="招聘知识库管理与检索">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🚫</span>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">暂无权限</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] max-w-md">
            您没有访问知识库的权限。请联系管理员获取相应权限。
          </p>
        </div>
      </ProductShell>
    );
  }

  // ==========================================================================
  // Error state
  // ==========================================================================

  if (error && !collections) {
    return (
      <ProductShell title="知识库" description="招聘知识库管理与检索">
        <ErrorState title="加载失败" description={error} onRetry={() => { setError(null); window.location.reload(); }} />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Loading state
  // ==========================================================================

  if (collectionsLoading) {
    return (
      <ProductShell title="知识库" description="招聘知识库管理与检索">
        <LoadingSkeleton />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Main render
  // ==========================================================================

  const currentReviewStatus = reviewStatus || answer?.humanReviewStatus || "pending";
  const answerStatus = answer?.answerStatus || "";

  return (
    <ProductShell
      title="知识库"
      description="招聘知识库管理与检索 — 基于岗位 JD、面试记录、候选人资料的结构化知识检索与 AI 问答。"
    >
      <div className="space-y-6">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <KpiCard label="知识集合" value={String(stats.collections)} />
            <KpiCard label="文档数" value={String(stats.documents)} />
            <KpiCard label="分块数" value={String(stats.chunks)} />
            <KpiCard label="已索引分块" value={String(stats.indexedChunks)} />
            <KpiCard label="问答记录" value={String(stats.answers)} />
          </div>
        )}

        {/* Collection tabs */}
        {collections && collections.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[var(--color-border)]">
            {collections.map((col) => (
              <button
                key={col.key}
                onClick={() => {
                  setActiveCollection(col.key);
                  setSearchResults(null);
                  setAnswer(null);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeCollection === col.key
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]"
                }`}
              >
                {col.name}
                {col.visibility === "scoped" && (
                  <span className="ml-1.5 text-[10px] opacity-60">(限定)</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="搜索知识库..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="rounded-xl bg-[var(--color-primary)] text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {searchLoading ? "搜索中..." : "搜索"}
          </button>
        </div>

        {/* Search mode indicator */}
        <div className="flex items-center gap-2">
          <SearchModeBadge mode="keyword/fulltext" />
          <span className="text-[10px] text-[var(--color-text-tertiary)]">| 不支持语义/向量搜索</span>
        </div>

        {/* Error inline */}
        {error && (
          <div className="rounded-xl border border-[var(--color-danger-light)] bg-[var(--color-danger-light)]/10 p-4 flex items-center justify-between">
            <span className="text-sm text-[var(--color-danger)]">{error}</span>
            <button onClick={() => setError(null)} className="text-sm text-[var(--color-danger)] underline">关闭</button>
          </div>
        )}

        {/* Search results */}
        {searchLoading && <LoadingSkeleton />}

        {searchResults && !searchLoading && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              搜索结果 ({searchResults.results.length} 条)
              {searchResults.noEvidence && (
                <span className="ml-2 text-[var(--color-text-tertiary)] font-normal">
                  — 关键词匹配，非语义检索
                </span>
              )}
            </h3>

            {searchResults.results.length === 0 ? (
              <EmptyState title="未找到结果" description="尝试使用不同的关键词搜索。" />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {searchResults.results.map((result, idx) => (
                  <button
                    key={result.chunkId || idx}
                    onClick={() => setPreviewCitation(result)}
                    className="text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-border-strong)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                          {result.sourceLabel}
                        </h4>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                          分块ID: {result.chunkId} | 资料源: {result.dataSourceId}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <EvidenceLevelBadge level={result.evidenceLevel} />
                        <span className="text-xs text-[var(--color-text-tertiary)]">
                          {result.score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                      {result.quote || result.summary || "—"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Ask section */}
        <div className="rounded-2xl border border-[var(--color-primary-light)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">AI 知识问答</span>
            <span className="text-[10px] text-[var(--color-text-tertiary)] bg-[var(--color-surface-tertiary)] rounded-full px-2 py-0.5">
              AI 助手可引用知识库
            </span>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="输入问题，AI 从知识库检索并生成回答..."
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button
              onClick={handleAsk}
              disabled={answerLoading}
              className="rounded-xl bg-[var(--color-primary)] text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {answerLoading ? "生成中..." : "提问"}
            </button>
          </div>
        </div>

        {/* Answer loading */}
        {answerLoading && <LoadingSkeleton />}

        {/* AI Answer display */}
        {answer && !answerLoading && (
          <div className="space-y-4">
            {/* No evidence state */}
            {answerStatus === "no_evidence" && (
              <div className="rounded-2xl border-2 border-dashed border-[var(--color-warning-light)] bg-[var(--color-warning-light)]/5 p-6 text-center">
                <span className="text-4xl block mb-3">🔍</span>
                <h3 className="text-base font-semibold text-[var(--color-warning)]">
                  未找到足够证据
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  当前知识库未找到足够证据，建议补充资料后再生成
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                  尝试添加更多 JD、面试记录或候选人资料到知识库
                </p>
                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface-tertiary)] rounded-full px-3 py-1">
                    回答: null
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface-tertiary)] rounded-full px-3 py-1">
                    引用数: 0
                  </span>
                </div>
              </div>
            )}

            {/* Generated answer */}
            {answerStatus === "generated" && answer.answer && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                {/* Answer header */}
                <div className="bg-[var(--color-surface-secondary)] px-5 py-3 flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">AI 回答</span>
                  <div className="flex items-center gap-2">
                    {answer.provider && (
                      <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-full px-2.5 py-0.5">
                        提供商: {answer.provider}
                      </span>
                    )}
                    {answer.model && (
                      <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-full px-2.5 py-0.5">
                        模型: {answer.model}
                      </span>
                    )}
                    {answer.promptVersion && (
                      <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-full px-2.5 py-0.5">
                        提示词版本: {answer.promptVersion}
                      </span>
                    )}
                    <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-full px-2.5 py-0.5">
                      生成方式: {answer.generatedBy === "llm" ? "大模型" : "检索生成"}
                    </span>
                  </div>
                </div>

                {/* Answer body */}
                <div className="p-5">
                  <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                    {answer.answer}
                  </p>

                  {/* Disclaimer */}
                  <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-tertiary)] italic">
                      ⚠️ {answer.disclaimer || "AI 辅助建议，仅供参考"}
                    </p>
                  </div>
                </div>

                {/* Review controls */}
                <div className="border-t border-[var(--color-border)] px-5 py-3 bg-[var(--color-surface-secondary)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-[var(--color-text-tertiary)]">人工审核:</span>
                    <ReviewStatusBadge status={currentReviewStatus} />

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => handleReview("accepted")}
                        disabled={reviewLoading || currentReviewStatus !== "pending"}
                        className="rounded-lg bg-[var(--color-success)] text-white px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                      >
                        采纳
                      </button>
                      <button
                        onClick={() => { setShowEditInput(!showEditInput); if (!showEditInput) setEditAnswerText(answer.answer || ""); }}
                        disabled={reviewLoading || currentReviewStatus !== "pending"}
                        className="rounded-lg bg-[var(--color-primary)] text-white px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleReview("rejected")}
                        disabled={reviewLoading || currentReviewStatus !== "pending"}
                        className="rounded-lg bg-[var(--color-danger)] text-white px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                      >
                        驳回
                      </button>
                    </div>
                  </div>

                  {/* Edit input */}
                  {showEditInput && currentReviewStatus === "pending" && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={editAnswerText}
                        onChange={(e) => setEditAnswerText(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-y"
                        placeholder="编辑回答内容..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview("edited")}
                          disabled={reviewLoading}
                          className="rounded-lg bg-[var(--color-primary)] text-white px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-50"
                        >
                          提交编辑
                        </button>
                        <button
                          onClick={() => setShowEditInput(false)}
                          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Citations */}
            {answer.citations && answer.citations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                  引用来源 ({answer.citations.length})
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {answer.citations.map((citation, idx) => (
                    <button
                      key={citation.id || idx}
                      onClick={() => setPreviewCitation(citation)}
                      className="text-left rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 hover:border-[var(--color-border-strong)] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-[var(--color-primary)]">
                            [{idx + 1}] {citation.sourceLabel}
                          </span>
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 truncate">
                            {citation.quote || citation.summary || "—"}
                          </p>
                        </div>
                        {citation.score !== undefined && (
                          <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">
                            {(citation.score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Index jobs section */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">索引任务</h3>
            <button
              onClick={() => { setShowIndexJobs(!showIndexJobs); }}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              {showIndexJobs ? "收起" : "展开"}
            </button>
          </div>
          {showIndexJobs && (
            <>
              {indexJobsLoading ? (
                <LoadingSkeleton />
              ) : !indexJobs || indexJobs.length === 0 ? (
                <EmptyState title="暂无索引任务" description="索引任务将在资料源解析完成后自动创建。" />
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {indexJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-[var(--color-border)] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                            资料源: {job.dataSourceId}
                          </p>
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                            {new Date(job.createdAt).toLocaleString("zh-CN")}
                          </p>
                          {job.errorMessage && (
                            <p className="text-xs text-[var(--color-danger)] mt-1">{job.errorMessage}</p>
                          )}
                        </div>
                        <StatusBadge label={getIndexStatusLabel(job.status)} variant={getStatusVariant(job.status)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Copilot hint — with provider config link */}
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">🤖</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">AI Copilot 集成</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              AI Copilot 可以直接引用知识库中的结构化知识，辅助生成面试评估、候选人分析和岗位匹配建议。
              在面试反馈或候选人分析页面打开 AI 助手即可使用知识库检索。
            </p>
            <p className="text-xs mt-2">
              <a href="/integrations?provider=deepseek" className="text-[var(--color-primary)] hover:underline font-medium">
                前往配置 AI Provider →
              </a>
              <span className="text-[var(--color-text-tertiary)] ml-2">检查 DeepSeek / OpenAI 连接状态</span>
            </p>
          </div>
        </div>

        {/* Empty state — no collections */}
        {(!collections || collections.length === 0) && (
          <EmptyState title="暂无知识集合" description="请管理员创建知识集合并索引资料源。" />
        )}
      </div>

      {/* Citation preview modal */}
      {previewCitation && (
        <CitationPreview
          citation={previewCitation}
          onClose={() => setPreviewCitation(null)}
        />
      )}

      {/* Document detail drawer */}
      {docDetail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDocDetail(null)} />
          <div className="relative w-full max-w-lg bg-[var(--color-surface)] h-full overflow-auto shadow-xl">
            <div className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)] truncate">
                {docDetail.title}
              </h2>
              <button
                onClick={() => setDocDetail(null)}
                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              >
                ✕
              </button>
            </div>

            {docDetailLoading ? (
              <div className="p-6"><LoadingSkeleton /></div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-[var(--color-border)] px-6">
                  <button
                    onClick={() => setDocTab("overview")}
                    className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                      docTab === "overview"
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                    }`}
                  >
                    概览
                  </button>
                  <button
                    onClick={() => setDocTab("chunks")}
                    className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                      docTab === "chunks"
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                    }`}
                  >
                    分块 ({docDetail.chunks?.length || 0})
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {docTab === "overview" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-[var(--color-text-tertiary)]">索引状态</span>
                          <div className="mt-1">
                            <StatusBadge label={getIndexStatusLabel(docDetail.indexStatus)} variant={getStatusVariant(docDetail.indexStatus)} />
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-[var(--color-text-tertiary)]">分块数量</span>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-1">{docDetail.chunkCount}</p>
                        </div>
                        <div>
                          <span className="text-xs text-[var(--color-text-tertiary)]">资料类型</span>
                          <p className="text-sm font-medium text-[var(--color-text-primary)] mt-1">{docDetail.sourceType}</p>
                        </div>
                        <div>
                          <span className="text-xs text-[var(--color-text-tertiary)]">最后索引时间</span>
                          <p className="text-sm font-medium text-[var(--color-text-primary)] mt-1">
                            {docDetail.lastIndexedAt
                              ? new Date(docDetail.lastIndexedAt).toLocaleString("zh-CN")
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Document index jobs */}
                      {docDetail.indexJobs && docDetail.indexJobs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">索引任务记录</h4>
                          <div className="space-y-2">
                            {docDetail.indexJobs.map((job) => (
                              <div key={job.id} className="rounded-xl border border-[var(--color-border)] px-3 py-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-[var(--color-text-secondary)]">
                                    {new Date(job.createdAt).toLocaleString("zh-CN")}
                                  </span>
                                  <StatusBadge label={getIndexStatusLabel(job.status)} variant={getStatusVariant(job.status)} />
                                </div>
                                {job.errorMessage && (
                                  <p className="text-xs text-[var(--color-danger)] mt-1">{job.errorMessage}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {docTab === "chunks" && (
                    <>
                      {(!docDetail.chunks || docDetail.chunks.length === 0) ? (
                        <EmptyState title="暂无分块数据" description="该文档尚未解析或分块。" />
                      ) : (
                        <div className="space-y-3">
                          {docDetail.chunks.map((chunk, idx) => (
                            <div key={chunk.id || idx} className="rounded-xl border border-[var(--color-border)] p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                                  分块 #{chunk.chunkIndex}
                                </span>
                                <div className="flex items-center gap-2">
                                  <EvidenceLevelBadge level={chunk.evidenceLevel} />
                                  <EmbeddingStatusBadge status={chunk.embeddingStatus} />
                                </div>
                              </div>
                              {chunk.contentSummary && (
                                <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                                  {chunk.contentSummary}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                                <span>Token 数: {chunk.tokenCount ?? "—"}</span>
                                <span>索引状态: {chunk.embeddingStatus === "not_configured" ? "未配置" : chunk.embeddingStatus}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </ProductShell>
  );
}
