"use client";

import { useEffect, useState, useCallback } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { tokens, componentStyles } from "@/components/ui/design-tokens";

// ============================================================================
// Types
// ============================================================================

type TranscriptStatus =
  | "none"
  | "pending"
  | "processing"
  | "ready"
  | "failed"
  | "not_configured"
  | "unsupported";

type MediaType = "audio" | "video";

type ReviewStatus = "pending" | "accepted" | "edited" | "rejected";

interface MediaAsset {
  id: string;
  fileName: string;
  fileType: MediaType;
  mimeType: string;
  fileSize: number;
  durationMs: number | null;
  objectType: string;
  objectId: string;
  transcriptStatus: TranscriptStatus;
  uploadedBy: string;
  uploadedAt: string;
  aiUsable: boolean;
  redacted: boolean;
  reviewApproved: boolean;
}

interface SpeechStats {
  total: number;
  pending: number;
  ready: number;
  analyzed: number;
  evidenceGap: number;
  insufficientFollowup: number;
  highSpeakingLowEvidence: number;
}

interface MediaData {
  assets: MediaAsset[];
  stats: SpeechStats;
}

interface TranscriptSegment {
  segmentId: string;
  speaker: string;
  startMs: number;
  endMs: number;
  text: string;
  evidenceLevel: "none" | "low" | "medium" | "high";
  aiUsable: boolean;
  redacted: boolean;
  originalText?: string;
}

interface TranscriptData {
  id: string;
  text: string;
  segments: TranscriptSegment[];
  reviewStatus: string;
  redacted: boolean;
  aiUsable: boolean;
}

// Speech metrics from /api/speech/transcripts/:id/metrics
interface SpeechMetrics {
  candidateSpeakingRatio: number;
  interviewerSpeakingRatio: number;
  avgAnswerDurationMs: number;
  longPauseCount: number;
  followupCount: number;
  closedQuestionRatio: number;
}

// STAR analysis
interface StarAnalysis {
  situation: number;
  task: number;
  action: number;
  result: number;
  overallScore: number;
  summary: string;
  evidenceRefs: EvidenceRef[];
}

// Evidence density analysis
interface EvidenceAnalysis {
  project: number;
  data: number;
  result: number;
  action: number;
  densityLevel: "high" | "medium" | "low";
  summary: string;
  evidenceRefs: EvidenceRef[];
}

// Followup quality analysis
interface FollowupAnalysis {
  hasWhy: boolean;
  hasHow: boolean;
  hasMetric: boolean;
  hasResult: boolean;
  depthLevel: "deep" | "moderate" | "shallow";
  suggestedQuestions: string[];
}

// Vagueness analysis
interface VaguenessAnalysis {
  vaguePhrases: string[];
  level: "high" | "medium" | "low";
  summary: string;
  evidenceRefs: EvidenceRef[];
}

// Evidence segment reference
interface EvidenceRef {
  segmentId: string;
  quote: string;
  speaker: string;
  startMs: number;
  endMs: number;
  reason: string;
}

// AI suggestion with review state
interface AiSuggestion {
  id: string;
  analysisId: string;
  provider: string;
  model: string;
  promptVersion: string;
  content: string;
  reviewStatus: ReviewStatus;
  createdAt: string;
}

interface ActivityLogEntry {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  actor: string;
}

interface AnalysisData {
  star: StarAnalysis | null;
  evidence: EvidenceAnalysis | null;
  followup: FollowupAnalysis | null;
  vagueness: VaguenessAnalysis | null;
  suggestions: AiSuggestion[];
  activityLog: ActivityLogEntry[];
}

type DetailTab =
  | "overview"
  | "transcript"
  | "metrics"
  | "star"
  | "evidence"
  | "followup"
  | "suggestions"
  | "activity";

interface Filters {
  status: TranscriptStatus | "all";
  type: MediaType | "all";
  search: string;
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_CONFIG: Record<
  TranscriptStatus,
  { label: string; bg: string; color: string }
> = {
  none: {
    label: "未转写",
    bg: "var(--color-surface-tertiary)",
    color: "var(--color-text-tertiary)",
  },
  pending: {
    label: "等待转写",
    bg: "var(--color-warning-light)",
    color: "var(--color-warning)",
  },
  processing: {
    label: "转写中",
    bg: "var(--color-primary-light)",
    color: "var(--color-primary)",
  },
  ready: {
    label: "转写完成",
    bg: "var(--color-success-light)",
    color: "var(--color-success)",
  },
  failed: {
    label: "转写失败",
    bg: "var(--color-danger-light)",
    color: "var(--color-danger)",
  },
  not_configured: {
    label: "Provider 未配置",
    bg: "var(--color-surface-tertiary)",
    color: "var(--color-text-tertiary)",
  },
  unsupported: {
    label: "格式不支持",
    bg: "var(--color-danger-light)",
    color: "var(--color-danger)",
  },
};

const TYPE_CONFIG: Record<MediaType, { label: string; icon: string }> = {
  audio: { label: "音频", icon: "🎵" },
  video: { label: "视频", icon: "🎬" },
};

const OBJECT_TYPE_LABELS: Record<string, string> = {
  interview: "面试",
  candidate: "候选人",
  job: "岗位",
  resume: "简历",
};

const SUPPORTED_FORMATS = ["MP3", "WAV", "M4A", "MP4", "WEBM"];
const MAX_FILE_SIZE = "500MB";

const REVIEW_STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; bg: string; color: string }
> = {
  pending: {
    label: "待审核",
    bg: "var(--color-warning-light)",
    color: "var(--color-warning)",
  },
  accepted: {
    label: "已接受",
    bg: "var(--color-success-light)",
    color: "var(--color-success)",
  },
  edited: {
    label: "已编辑",
    bg: "var(--color-primary-light)",
    color: "var(--color-primary)",
  },
  rejected: {
    label: "已忽略",
    bg: "var(--color-surface-tertiary)",
    color: "var(--color-text-tertiary)",
  },
};

// ============================================================================
// Helpers
// ============================================================================

function fmtFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function fmtDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return "---";
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function fmtTime(ts?: string): string {
  if (!ts) return "---";
  return new Date(ts).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtTimeRange(startMs: number, endMs: number): string {
  const fmtMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };
  return `${fmtMs(startMs)} - ${fmtMs(endMs)}`;
}

function getObjectLabel(type: string, id: string): string {
  const typeLabel = OBJECT_TYPE_LABELS[type] || type;
  return `${typeLabel} · ${id}`;
}

// ============================================================================
// Main Page
// ============================================================================

export default function MediaPage() {
  // Core state
  const [data, setData] = useState<MediaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    type: "all",
    search: "",
  });

  // Detail drawer state
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(
    null,
  );
  const [speechMetrics, setSpeechMetrics] = useState<SpeechMetrics | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Upload/Import modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/speech/stats")
      .then((r) => {
        if (r.status === 403) {
          setPermissionDenied(true);
          throw new Error("perm");
        }
        if (!r.ok) throw new Error("Failed to fetch stats");
        return r.json();
      })
      .then((statsRes) => {
        // Also fetch media assets
        return fetch("/api/speech/media-assets")
          .then((r) => r.json())
          .then((assetsRes) => {
            if (!assetsRes.success) {
              setError(assetsRes.error || "加载失败");
              return;
            }
            // API returns { items: [...], total: N }, map fields to frontend types
            const rawItems = assetsRes.data?.items || [];
            const mappedAssets: MediaAsset[] = rawItems.map(
              (raw: Record<string, unknown>) => ({
                id: raw.id as string,
                fileName: (raw.fileName as string) || "",
                fileType: (raw.mediaType as MediaType) || "audio",
                mimeType: (raw.mimeType as string) || "",
                fileSize: (raw.fileSize as number) || 0,
                durationMs: (raw.durationMs as number) || null,
                objectType: (raw.objectType as string) || "",
                objectId: (raw.objectId as string) || "",
                transcriptStatus:
                  (raw.transcriptionStatus as TranscriptStatus) || "none",
                uploadedBy: (raw.uploadedById as string) || "",
                uploadedAt: (raw.createdAt as string) || "",
                aiUsable: (raw.aiUsable as boolean) ?? false,
                redacted: (raw.redacted as boolean) ?? false,
                reviewApproved: (raw.reviewApproved as boolean) ?? false,
              }),
            );
            setData({
              assets: mappedAssets,
              stats: statsRes.success
                ? statsRes.data
                : {
                    total: 0,
                    pending: 0,
                    ready: 0,
                    analyzed: 0,
                    evidenceGap: 0,
                    insufficientFollowup: 0,
                    highSpeakingLowEvidence: 0,
                  },
            });
          });
      })
      .catch((e) => {
        if ((e as Error).message !== "perm")
          setError("面试沟通智能分析加载失败，请稍后重试");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================================================
  // Detail Drawer
  // ==========================================================================

  const openDetailDrawer = useCallback((asset: MediaAsset) => {
    setSelectedAsset(asset);
    setDetailTab("overview");
    setDetailLoading(true);
    setTranscriptData(null);
    setSpeechMetrics(null);
    setAnalysisData(null);

    // Fetch transcript
    fetch(`/api/speech/transcripts/${asset.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setTranscriptData(d.data);
          // After transcript is loaded, fetch metrics and analysis in parallel
          return Promise.all([
            fetch(`/api/speech/transcripts/${asset.id}/metrics`)
              .then((r) => r.json())
              .then((d) => {
                if (d.success) setSpeechMetrics(d.data);
              })
              .catch(() => {}),
            fetch(`/api/speech/transcripts/${asset.id}/analyze`, {
              method: "POST",
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.success) setAnalysisData(d.data);
              })
              .catch(() => {}),
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, []);

  const closeDetailDrawer = useCallback(() => {
    setSelectedAsset(null);
    setTranscriptData(null);
    setSpeechMetrics(null);
    setAnalysisData(null);
  }, []);

  // ==========================================================================
  // Actions
  // ==========================================================================

  const handleUpload = useCallback(() => {
    alert(
      "上传功能即将上线。支持格式: " +
        SUPPORTED_FORMATS.join("、") +
        "，单文件最大 " +
        MAX_FILE_SIZE,
    );
    setShowUploadModal(false);
  }, []);

  const handleManualImport = useCallback(() => {
    alert("转写文本导入功能即将上线。");
    setShowImportModal(false);
  }, []);

  const handleCreateTranscript = useCallback((assetId: string) => {
    fetch("/api/speech/transcription-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          fetchData();
        } else {
          alert("创建转写任务失败: " + (d.error || "未知错误"));
        }
      })
      .catch(() => alert("创建转写任务失败"));
  }, [fetchData]);

  const handleImportTranscript = useCallback((assetId: string) => {
    setShowImportModal(true);
  }, []);

  const handleReviewSuggestion = useCallback(
    (suggestionId: string, status: ReviewStatus) => {
      fetch(`/api/speech/analysis/${suggestionId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewStatus: status }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && analysisData) {
            setAnalysisData({
              ...analysisData,
              suggestions: analysisData.suggestions.map((s) =>
                s.id === suggestionId ? { ...s, reviewStatus: status } : s,
              ),
            });
          }
        })
        .catch(() => alert("审核操作失败"));
    },
    [analysisData],
  );

  // ==========================================================================
  // Filtering
  // ==========================================================================

  const filteredAssets = (data?.assets || []).filter((asset) => {
    if (filters.status !== "all" && asset.transcriptStatus !== filters.status)
      return false;
    if (filters.type !== "all" && asset.fileType !== filters.type) return false;
    if (
      filters.search &&
      !asset.fileName.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  // ==========================================================================
  // Permission Denied
  // ==========================================================================

  if (permissionDenied) {
    return (
      <ProductShell
        title="面试沟通智能分析"
        description="基于音视频转写、说话人分段和证据片段，辅助识别表达结构、追问深度和证据缺口"
      >
        <EmptyState
          icon="🔒"
          title="暂无权限"
          description="暂无权限访问面试沟通智能分析。如需访问请联系管理员。"
        />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Error
  // ==========================================================================

  if (error && !data) {
    return (
      <ProductShell
        title="面试沟通智能分析"
        description="基于音视频转写、说话人分段和证据片段，辅助识别表达结构、追问深度和证据缺口"
      >
        <ErrorState
          title="加载失败"
          description={error}
          onRetry={fetchData}
        />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Loading
  // ==========================================================================

  if (loading && !data) {
    return (
      <ProductShell
        title="面试沟通智能分析"
        description="基于音视频转写、说话人分段和证据片段，辅助识别表达结构、追问深度和证据缺口"
      >
        <LoadingSkeleton rows={6} />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Empty
  // ==========================================================================

  if (!data || data.assets.length === 0) {
    return (
      <ProductShell
        title="面试沟通智能分析"
        description="基于音视频转写、说话人分段和证据片段，辅助识别表达结构、追问深度和证据缺口"
      >
        <EmptyState
          icon="🎙️"
          title="暂无音视频资料"
          description="暂无音视频资料，请上传面试录音或视频。支持 MP3、WAV、M4A、MP4、WEBM 格式。"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className={componentStyles.primaryButton}
              >
                上传音视频
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className={componentStyles.secondaryButton}
              >
                导入转写文本
              </button>
            </div>
          }
        />
      </ProductShell>
    );
  }

  // ==========================================================================
  // Main Content
  // ==========================================================================

  const { stats, assets } = data;

  return (
    <ProductShell
      title="面试沟通智能分析"
      description="基于音视频转写、说话人分段和证据片段，辅助识别表达结构、追问深度和证据缺口"
      kpiRow={
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <KpiCard
            label="待转写"
            value={stats.pending}
            trendDirection={stats.pending > 0 ? "up" : "flat"}
          />
          <KpiCard
            label="已转写"
            value={stats.ready}
            trendDirection={stats.ready > 0 ? "up" : "flat"}
          />
          <KpiCard
            label="已分析"
            value={stats.analyzed}
            trendDirection={stats.analyzed > 0 ? "up" : "flat"}
          />
          <KpiCard
            label="证据不足"
            value={stats.evidenceGap}
            trendDirection={stats.evidenceGap > 0 ? "up" : "flat"}
          />
          <KpiCard
            label="追问不足"
            value={stats.insufficientFollowup}
            trendDirection={stats.insufficientFollowup > 0 ? "up" : "flat"}
          />
          <KpiCard
            label="表达强但证据弱"
            value={stats.highSpeakingLowEvidence}
            trendDirection={
              stats.highSpeakingLowEvidence > 0 ? "up" : "flat"
            }
          />
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className={componentStyles.primaryButton}
          >
            上传音视频
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className={componentStyles.secondaryButton}
          >
            导入转写文本
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ================================================================
            Privacy/Safety Notice Banner (Persistent)
            ================================================================ */}
        <div className="rounded-xl border border-[var(--color-info-light)] bg-[var(--color-info-light)]/10 px-5 py-3.5 flex items-start gap-3">
          <span className="text-base shrink-0 mt-0.5">🛡️</span>
          <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed space-y-1">
            <p>
              本中心分析面试沟通内容、结构和证据密度，不做情绪、声音、口音、性格或撒谎判断。
            </p>
            <p>
              AI 辅助建议仅供参考，请结合真实业务和面试证据人工确认。
            </p>
          </div>
        </div>

        {/* ================================================================
            Upload Drop Zone
            ================================================================ */}
        <div
          className="rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]/5 transition-colors cursor-pointer"
          onClick={() => setShowUploadModal(true)}
        >
          <div className="text-3xl mb-3">📤</div>
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
            拖拽音视频文件到此处上传
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            支持 {SUPPORTED_FORMATS.join("、")} 格式，单文件最大{" "}
            {MAX_FILE_SIZE}
          </p>
        </div>

        {/* ================================================================
            Filter Bar
            ================================================================ */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle
                cx="7"
                cy="7"
                r="5.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M11 11L14.5 14.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="搜索文件名..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value as Filters["status"],
              }))
            }
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="all">全部状态</option>
            <option value="none">未转写</option>
            <option value="pending">等待转写</option>
            <option value="processing">转写中</option>
            <option value="ready">转写完成</option>
            <option value="failed">转写失败</option>
            <option value="not_configured">Provider 未配置</option>
            <option value="unsupported">格式不支持</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                type: e.target.value as Filters["type"],
              }))
            }
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="all">全部类型</option>
            <option value="audio">🎵 音频</option>
            <option value="video">🎬 视频</option>
          </select>

          {/* Count */}
          <span className="text-xs text-[var(--color-text-tertiary)]">
            共 {filteredAssets.length} 项
          </span>
        </div>

        {/* ================================================================
            Media List Table
            ================================================================ */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-tertiary)]">
                  <th className="text-left py-3 px-4 font-medium text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    文件名
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    关联对象
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    转写状态
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    上传人
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    时间
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => {
                  const status = STATUS_CONFIG[asset.transcriptStatus];
                  const type = TYPE_CONFIG[asset.fileType];

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => openDetailDrawer(asset)}
                      className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-tertiary)] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span className="text-[var(--color-text-primary)] font-medium">
                            {asset.fileName}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                          {fmtFileSize(asset.fileSize)}
                          {asset.durationMs && (
                            <span> · {fmtDuration(asset.durationMs)}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[var(--color-text-secondary)]">
                          {type.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[var(--color-text-secondary)]">
                          {getObjectLabel(asset.objectType, asset.objectId)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: status.bg,
                            color: status.color,
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                        {asset.uploadedBy}
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--color-text-tertiary)] whitespace-nowrap">
                        {fmtTime(asset.uploadedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ====================================================================
          Upload Modal
          ==================================================================== */}
      {showUploadModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  上传音视频
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 4L12 12M12 4L4 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-8 text-center">
                  <div className="text-2xl mb-2">📁</div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                    选择文件或拖拽到此处
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    支持 {SUPPORTED_FORMATS.join("、")}，最大 {MAX_FILE_SIZE}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    关联对象类型
                  </label>
                  <select className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                    <option value="interview">面试</option>
                    <option value="candidate">候选人</option>
                    <option value="job">岗位</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    关联对象 ID
                  </label>
                  <input
                    type="text"
                    placeholder="输入面试 ID、候选人 ID 或岗位 ID"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div className="rounded-lg border border-[var(--color-info-light)] bg-[var(--color-info-light)]/20 px-4 py-3 flex items-start gap-2">
                  <span className="text-sm shrink-0">💡</span>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    上传后系统将自动创建转写任务。转写完成后可进入 AI
                    分析流程。支持中英文混合语音识别。
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--color-border)]">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className={componentStyles.secondaryButton}
                >
                  取消
                </button>
                <button
                  onClick={handleUpload}
                  className={componentStyles.primaryButton}
                >
                  确认上传
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ====================================================================
          Import Modal
          ==================================================================== */}
      {showImportModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowImportModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  导入转写文本
                </h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="rounded-lg p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 4L12 12M12 4L4 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    转写文本内容
                  </label>
                  <textarea
                    placeholder="粘贴转写文本内容。支持以下格式：

[00:00] 面试官：请做一个自我介绍
[00:05] 候选人：您好，我毕业于...
[00:30] 面试官：请描述您最有挑战的项目"
                    rows={8}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none font-mono"
                  />
                </div>

                <div className="rounded-lg border border-[var(--color-info-light)] bg-[var(--color-info-light)]/20 px-4 py-3 flex items-start gap-2">
                  <span className="text-sm shrink-0">💡</span>
                  <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    <p className="mb-1">支持格式说明：</p>
                    <ul className="space-y-0.5 list-disc list-inside">
                      <li>带时间戳：[MM:SS] 说话人：内容</li>
                      <li>纯文本：每行视为一个段落</li>
                      <li>支持中英文混合内容</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--color-border)]">
                <button
                  onClick={() => setShowImportModal(false)}
                  className={componentStyles.secondaryButton}
                >
                  取消
                </button>
                <button
                  onClick={handleManualImport}
                  className={componentStyles.primaryButton}
                >
                  确认导入
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ====================================================================
          Detail Drawer
          ==================================================================== */}
      {selectedAsset && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={closeDetailDrawer}
          />

          {/* Drawer Panel */}
          <div className="fixed right-0 top-0 z-50 h-full w-[640px] max-w-full bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0">
                    {TYPE_CONFIG[selectedAsset.fileType].icon}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {selectedAsset.fileName}
                    </h2>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {getObjectLabel(
                        selectedAsset.objectType,
                        selectedAsset.objectId,
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDetailDrawer}
                  className="rounded-lg p-2 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors shrink-0"
                  aria-label="关闭"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 4L12 12M12 4L4 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Tab bar */}
              <div className="flex items-center gap-0 mt-4 border-b border-[var(--color-border)] -mb-px overflow-x-auto">
                {[
                  { key: "overview" as DetailTab, label: "概览" },
                  { key: "transcript" as DetailTab, label: "转写文本" },
                  { key: "metrics" as DetailTab, label: "沟通指标" },
                  { key: "star" as DetailTab, label: "STAR分析" },
                  { key: "evidence" as DetailTab, label: "证据密度" },
                  { key: "followup" as DetailTab, label: "追问质量" },
                  { key: "suggestions" as DetailTab, label: "AI建议" },
                  { key: "activity" as DetailTab, label: "活动日志" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    className={`shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      detailTab === tab.key
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Content */}
            <div className="px-6 py-4">
              {detailLoading ? (
                <LoadingSkeleton rows={4} />
              ) : (
                <>
                  {/* Tab: 概览 */}
                  {detailTab === "overview" && (
                    <DrawerOverviewTab
                      asset={selectedAsset}
                      transcript={transcriptData}
                      speechMetrics={speechMetrics}
                      onCreateTranscript={handleCreateTranscript}
                      onImportTranscript={handleImportTranscript}
                    />
                  )}

                  {/* Tab: 转写文本 */}
                  {detailTab === "transcript" && (
                    <DrawerTranscriptTab
                      asset={selectedAsset}
                      transcript={transcriptData}
                      onReview={handleReviewSuggestion}
                    />
                  )}

                  {/* Tab: 沟通指标 */}
                  {detailTab === "metrics" && (
                    <DrawerMetricsTab
                      transcript={transcriptData}
                      metrics={speechMetrics}
                    />
                  )}

                  {/* Tab: STAR 分析 */}
                  {detailTab === "star" && (
                    <DrawerStarTab analysis={analysisData?.star || null} />
                  )}

                  {/* Tab: 证据密度 */}
                  {detailTab === "evidence" && (
                    <DrawerEvidenceTab
                      analysis={analysisData?.evidence || null}
                    />
                  )}

                  {/* Tab: 追问质量 */}
                  {detailTab === "followup" && (
                    <DrawerFollowupTab
                      analysis={analysisData?.followup || null}
                      vagueness={analysisData?.vagueness || null}
                    />
                  )}

                  {/* Tab: AI 建议 */}
                  {detailTab === "suggestions" && (
                    <DrawerSuggestionsTab
                      suggestions={analysisData?.suggestions || []}
                      onReview={handleReviewSuggestion}
                    />
                  )}

                  {/* Tab: 活动日志 */}
                  {detailTab === "activity" && (
                    <DrawerActivityTab
                      log={analysisData?.activityLog || []}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </ProductShell>
  );
}

// ============================================================================
// Drawer Tab: 概览
// ============================================================================

function DrawerOverviewTab({
  asset,
  transcript,
  speechMetrics,
  onCreateTranscript,
  onImportTranscript,
}: {
  asset: MediaAsset;
  transcript: TranscriptData | null;
  speechMetrics: SpeechMetrics | null;
  onCreateTranscript: (id: string) => void;
  onImportTranscript: (id: string) => void;
}) {
  const status = STATUS_CONFIG[asset.transcriptStatus];
  const type = TYPE_CONFIG[asset.fileType];

  return (
    <div className="space-y-4">
      {/* File Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard label="文件名" value={asset.fileName} />
        <InfoCard label="类型" value={`${type.icon} ${type.label}`} />
        <InfoCard label="文件大小" value={fmtFileSize(asset.fileSize)} />
        <InfoCard label="时长" value={fmtDuration(asset.durationMs)} />
        <InfoCard label="MIME 类型" value={asset.mimeType} mono />
        <InfoCard
          label="关联对象"
          value={getObjectLabel(asset.objectType, asset.objectId)}
        />
      </div>

      {/* Status */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            转写状态
          </span>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: status.bg, color: status.color }}
          >
            {status.label}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            AI 可用
          </span>
          <span
            className={`text-xs font-medium ${asset.aiUsable ? "text-[var(--color-success)]" : "text-[var(--color-text-tertiary)]"}`}
          >
            {asset.aiUsable ? "是" : "否"}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            人工确认
          </span>
          <span
            className={`text-xs font-medium ${asset.reviewApproved ? "text-[var(--color-success)]" : "text-[var(--color-text-tertiary)]"}`}
          >
            {asset.reviewApproved ? "已确认" : "待确认"}
          </span>
        </div>
      </div>

      {/* Speech Metrics Preview */}
      {transcript && speechMetrics && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">
            沟通指标概览
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <MetricMiniCard
              label="候选人说话占比"
              value={`${speechMetrics.candidateSpeakingRatio}%`}
              disclaimer="用于观察面试流程是否给到充分表达空间，不作为候选人评分"
            />
            <MetricMiniCard
              label="面试官说话占比"
              value={`${speechMetrics.interviewerSpeakingRatio}%`}
              disclaimer="用于观察面试流程是否给到充分表达空间，不作为候选人评分"
            />
            <MetricMiniCard
              label="平均回答时长"
              value={`${(speechMetrics.avgAnswerDurationMs / 1000).toFixed(1)}s`}
              disclaimer="仅用于定位回看片段和观察追问时机，不作为候选人评分"
            />
            <MetricMiniCard
              label="长停顿次数"
              value={speechMetrics.longPauseCount}
              disclaimer="仅用于定位回看片段和观察追问时机，不作为候选人评分"
            />
            <MetricMiniCard
              label="追问次数"
              value={speechMetrics.followupCount}
              disclaimer="帮助面试官复盘，不用于排名或评价"
            />
            <MetricMiniCard
              label="封闭式问题比例"
              value={`${speechMetrics.closedQuestionRatio}%`}
              disclaimer="帮助面试官复盘，不用于排名或评价"
            />
          </div>
        </div>
      )}

      {/* Upload Info */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-tertiary)]">上传人</span>
          <span className="text-[var(--color-text-primary)]">
            {asset.uploadedBy}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-tertiary)]">上传时间</span>
          <span className="text-[var(--color-text-primary)]">
            {fmtTime(asset.uploadedAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {asset.transcriptStatus === "none" && (
          <button
            onClick={() => onCreateTranscript(asset.id)}
            className={componentStyles.primaryButton}
          >
            创建转写
          </button>
        )}
        <button
          onClick={() => onImportTranscript(asset.id)}
          className={componentStyles.secondaryButton}
        >
          导入转写
        </button>
        {transcript && (
          <button className={componentStyles.ghostButton}>查看分析</button>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
      <div className="text-xs text-[var(--color-text-tertiary)] mb-1">
        {label}
      </div>
      <div
        className={`text-sm text-[var(--color-text-primary)] truncate ${mono ? "font-mono" : "font-medium"}`}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

function MetricMiniCard({
  label,
  value,
  trend,
  disclaimer,
}: {
  label: string;
  value: string | number;
  trend?: "up" | "down";
  disclaimer?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
      <div className="text-xs text-[var(--color-text-tertiary)]">{label}</div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-base font-semibold text-[var(--color-text-primary)]">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs ${trend === "up" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
          >
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
      {disclaimer && (
        <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1.5 leading-tight border-t border-[var(--color-border-light)] pt-1.5">
          {disclaimer}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Drawer Tab: 转写文本
// ============================================================================

function DrawerTranscriptTab({
  asset,
  transcript,
  onReview,
}: {
  asset: MediaAsset;
  transcript: TranscriptData | null;
  onReview: (id: string, status: ReviewStatus) => void;
}) {
  if (!transcript) {
    return (
      <EmptyState
        icon="📝"
        title="暂无转写文本"
        description="暂未生成转写文本，请先创建转写任务或导入人工转写。"
        action={
          <div className="flex items-center gap-2">
            <button className={componentStyles.primaryButton}>
              创建转写任务
            </button>
            <button className={componentStyles.secondaryButton}>
              导入人工转写
            </button>
          </div>
        }
      />
    );
  }

  const reviewStatus = REVIEW_STATUS_CONFIG[
    transcript.reviewStatus as ReviewStatus
  ] || REVIEW_STATUS_CONFIG.pending;

  return (
    <div className="space-y-4">
      {/* Review Status */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--color-text-tertiary)]">
          审核状态：
        </span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: reviewStatus.bg,
            color: reviewStatus.color,
          }}
        >
          {reviewStatus.label}
        </span>

        {transcript.aiUsable && (
          <>
            <span className="text-xs text-[var(--color-text-tertiary)]">·</span>
            <span className="text-xs font-medium text-[var(--color-success)]">
              AI 可用
            </span>
          </>
        )}

        {transcript.redacted && (
          <>
            <span className="text-xs text-[var(--color-text-tertiary)]">·</span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--color-info-light)] text-[var(--color-info)]">
              已脱敏
            </span>
          </>
        )}
      </div>

      {/* Transcript Text */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 max-h-96 overflow-y-auto">
        <pre className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap font-sans leading-relaxed">
          {transcript.text}
        </pre>
      </div>

      {/* Segments with Evidence */}
      {transcript.segments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
            说话人分段
          </h4>
          {transcript.segments.map((seg) => (
            <EvidenceSegmentCard key={seg.segmentId} segment={seg} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-[var(--color-info-light)] bg-[var(--color-info-light)]/20 px-4 py-3 flex items-start gap-2">
        <span className="text-sm shrink-0">🤖</span>
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          AI 辅助建议，仅供参考，不构成录用/淘汰决策依据。
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Evidence Segment Card (Shared)
// ============================================================================

function EvidenceSegmentCard({
  segment,
  reason,
}: {
  segment: TranscriptSegment;
  reason?: string;
}) {
  const SPEAKER_COLORS: Record<string, string> = {
    interviewer: "var(--color-primary)",
    interviewer_2: "var(--color-primary)",
    candidate: "var(--color-success)",
    candidate_2: "var(--color-warning)",
  };

  const speakerColor =
    SPEAKER_COLORS[segment.speaker] || "var(--color-text-primary)";

  const EVIDENCE_LABELS: Record<string, string> = {
    none: "无证据",
    low: "弱证据",
    medium: "中等证据",
    high: "强证据",
  };

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: speakerColor + "20",
              color: speakerColor,
            }}
          >
            {segment.speaker}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {fmtTimeRange(segment.startMs, segment.endMs)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            证据: {EVIDENCE_LABELS[segment.evidenceLevel] || "无"}
          </span>
          {segment.segmentId && (
            <span className="text-xs font-mono text-[var(--color-text-tertiary)]">
              #{segment.segmentId}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
        &ldquo;{segment.text}&rdquo;
      </p>
      {reason && (
        <div className="mt-2 pt-2 border-t border-[var(--color-border-light)]">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            分析依据: {reason}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Drawer Tab: 沟通指标
// ============================================================================

function DrawerMetricsTab({
  transcript,
  metrics,
}: {
  transcript: TranscriptData | null;
  metrics: SpeechMetrics | null;
}) {
  if (!transcript) {
    return (
      <EmptyState
        icon="📊"
        title="暂无沟通指标"
        description="暂未生成转写文本，请先创建转写任务或导入人工转写。"
      />
    );
  }

  if (!metrics) {
    return (
      <EmptyState
        icon="📊"
        title="暂无沟通指标"
        description="转写已完成，但尚未生成沟通指标。请运行分析以获取指标数据。"
      />
    );
  }

  const metricItems = [
    {
      label: "候选人说话占比",
      value: `${metrics.candidateSpeakingRatio}%`,
      trend:
        metrics.candidateSpeakingRatio > 50
          ? ("up" as const)
          : ("down" as const),
      disclaimer: "用于观察面试流程是否给到充分表达空间，不作为候选人评分",
    },
    {
      label: "面试官说话占比",
      value: `${metrics.interviewerSpeakingRatio}%`,
      trend:
        metrics.interviewerSpeakingRatio > 50
          ? ("up" as const)
          : ("down" as const),
      disclaimer: "用于观察面试流程是否给到充分表达空间，不作为候选人评分",
    },
    {
      label: "平均回答时长",
      value: `${(metrics.avgAnswerDurationMs / 1000).toFixed(1)}s`,
      disclaimer: "仅用于定位回看片段和观察追问时机，不作为候选人评分",
    },
    {
      label: "长停顿次数",
      value: metrics.longPauseCount,
      disclaimer: "仅用于定位回看片段和观察追问时机，不作为候选人评分",
    },
    {
      label: "追问次数",
      value: metrics.followupCount,
      disclaimer: "帮助面试官复盘，不用于排名或评价",
    },
    {
      label: "封闭式问题比例",
      value: `${metrics.closedQuestionRatio}%`,
      disclaimer: "帮助面试官复盘，不用于排名或评价",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {metricItems.map((item) => (
          <MetricMiniCard
            key={item.label}
            label={item.label}
            value={item.value}
            trend={item.trend}
            disclaimer={item.disclaimer}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-[var(--color-info-light)] bg-[var(--color-info-light)]/20 px-4 py-3 flex items-start gap-2">
        <span className="text-sm shrink-0">🤖</span>
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          AI 辅助建议，仅供参考，不构成录用/淘汰决策依据。
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Drawer Tab: STAR 分析
// ============================================================================

function DrawerStarTab({ analysis }: { analysis: StarAnalysis | null }) {
  if (!analysis) {
    return (
      <EmptyState
        icon="⭐"
        title="暂无 STAR 分析"
        description="当前证据不足，无法生成完整分析。建议补充追问后重新分析。"
      />
    );
  }

  const dimensions = [
    { key: "situation", label: "S · 情境", value: analysis.situation },
    { key: "task", label: "T · 任务", value: analysis.task },
    { key: "action", label: "A · 行动", value: analysis.action },
    { key: "result", label: "R · 结果", value: analysis.result },
  ];

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center">
        <div className="text-xs text-[var(--color-text-tertiary)] mb-1">
          STAR 完整度评分
        </div>
        <div
          className={`text-3xl font-bold ${
            analysis.overallScore >= 80
              ? "text-[var(--color-success)]"
              : analysis.overallScore >= 50
                ? "text-[var(--color-warning)]"
                : "text-[var(--color-danger)]"
          }`}
        >
          {analysis.overallScore}%
        </div>
        <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2 leading-tight">
          基于 transcript evidence 判断回答结构，不作为候选人评分
        </p>
      </div>

      {/* Dimension Progress Bars */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
          STAR 各维度分析
        </h4>
        {dimensions.map((dim) => (
          <div key={dim.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--color-text-secondary)]">
                {dim.label}
              </span>
              <span className="text-xs font-medium text-[var(--color-text-primary)]">
                {dim.value}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${dim.value}%`,
                  backgroundColor:
                    dim.value >= 80
                      ? "var(--color-success)"
                      : dim.value >= 50
                        ? "var(--color-warning)"
                        : "var(--color-danger)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-4">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {analysis.summary}
          </p>
        </div>
      )}

      {/* Evidence Segment References */}
      {analysis.evidenceRefs && analysis.evidenceRefs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
            证据片段引用
          </h4>
          {analysis.evidenceRefs.map((ref, idx) => (
            <EvidenceRefCard key={idx} ref={ref} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-[var(--color-info-light)] bg-[var(--color-info-light)]/20 px-4 py-3 flex items-start gap-2">
        <span className="text-sm shrink-0">🤖</span>
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          AI 辅助建议，仅供参考，不构成录用/淘汰决策依据。
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Drawer Tab: 证据密度
// ============================================================================

function DrawerEvidenceTab({
  analysis,
}: {
  analysis: EvidenceAnalysis | null;
}) {
  if (!analysis) {
    return (
      <EmptyState
        icon="🔍"
        title="暂无证据分析"
        description="当前证据不足，无法生成完整分析。建议补充追问后重新分析。"
      />
    );
  }

  const DENSITY_CONFIG = {
    high: {
      label: "高密度",
      bg: "var(--color-success-light)",
      color: "var(--color-success)",
    },
    medium: {
      label: "中等密度",
      bg: "var(--color-warning-light)",
      color: "var(--color-warning)",
    },
    low: {
      label: "低密度",
      bg: "var(--color-danger-light)",
      color: "var(--color-danger)",
    },
  };

  const density = DENSITY_CONFIG[analysis.densityLevel];

  const metrics = [
    { key: "project", label: "项目证据", value: analysis.project },
    { key: "data", label: "数据证据", value: analysis.data },
    { key: "result", label: "结果证据", value: analysis.result },
    { key: "action", label: "行动证据", value: analysis.action },
  ];

  return (
    <div className="space-y-4">
      {/* Density Level */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            证据密度等级
          </span>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: density.bg, color: density.color }}
          >
            {density.label}
          </span>
        </div>
        <p className="text-[10px] text-[var(--color-text-tertiary)] mb-4 leading-tight">
          量化证据出现频率，无证据≠淘汰
        </p>

        {/* Metric Counts */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div
              key={m.key}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3 text-center"
            >
              <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                {m.value}
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-4">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {analysis.summary}
          </p>
        </div>
      )}

      {/* Evidence Segment References */}
      {analysis.evidenceRefs && analysis.evidenceRefs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
            证据片段引用
          </h4>
          {analysis.evidenceRefs.map((ref, idx) => (
            <EvidenceRefCard key={idx} ref={ref} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-[var(--color-info-light)] bg-[var(--color-info-light)]/20 px-4 py-3 flex items-start gap-2">
        <span className="text-sm shrink-0">🤖</span>
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          AI 辅助建议，仅供参考，不构成录用/淘汰决策依据。
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Drawer Tab: 追问质量
// ============================================================================

function DrawerFollowupTab({
  analysis,
  vagueness,
}: {
  analysis: FollowupAnalysis | null;
  vagueness: VaguenessAnalysis | null;
}) {
  if (!analysis) {
    return (
      <EmptyState
        icon="❓"
        title="暂无追问分析"
        description="当前证据不足，无法生成完整分析。建议补充追问后重新分析。"
      />
    );
  }

  const DEPTH_CONFIG = {
    deep: {
      label: "深度追问",
      bg: "var(--color-success-light)",
      color: "var(--color-success)",
    },
    moderate: {
      label: "中等追问",
      bg: "var(--color-warning-light)",
      color: "var(--color-warning)",
    },
    shallow: {
      label: "浅层追问",
      bg: "var(--color-danger-light)",
      color: "var(--color-danger)",
    },
  };

  const depth = DEPTH_CONFIG[analysis.depthLevel];

  const indicators = [
    { key: "hasWhy", label: "包含 Why 追问", value: analysis.hasWhy },
    { key: "hasHow", label: "包含 How 追问", value: analysis.hasHow },
    { key: "hasMetric", label: "包含量化追问", value: analysis.hasMetric },
    { key: "hasResult", label: "包含结果追问", value: analysis.hasResult },
  ];

  return (
    <div className="space-y-4">
      {/* Depth Level */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            追问深度等级
          </span>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: depth.bg, color: depth.color }}
          >
            {depth.label}
          </span>
        </div>
        <p className="text-[10px] text-[var(--color-text-tertiary)] mb-4 leading-tight">
          帮助面试官复盘，不用于排名或评价
        </p>

        {/* Indicators */}
        <div className="grid grid-cols-2 gap-3">
          {indicators.map((ind) => (
            <div
              key={ind.key}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {ind.label}
                </span>
                <span
                  className={`text-sm font-medium ${ind.value ? "text-[var(--color-success)]" : "text-[var(--color-text-tertiary)]"}`}
                >
                  {ind.value ? "是" : "否"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Questions */}
      {analysis.suggestedQuestions.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
            建议追问方向
          </h4>
          <ul className="space-y-2">
            {analysis.suggestedQuestions.map((q, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="text-[var(--color-primary)] shrink-0 mt-0.5">
                  →
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vagueness Analysis */}
      {vagueness && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              模糊表达分析
            </span>
            <VaguenessBadge level={vagueness.level} />
          </div>

          {vagueness.vaguePhrases.length > 0 && (
            <div className="space-y-2">
              {vagueness.vaguePhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3"
                >
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    &ldquo;{phrase}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}

          {vagueness.summary && (
            <p className="mt-3 text-xs text-[var(--color-text-tertiary)] leading-relaxed">
              {vagueness.summary}
            </p>
          )}

          {/* Evidence Refs */}
          {vagueness.evidenceRefs &&
            vagueness.evidenceRefs.length > 0 && (
              <div className="mt-4 space-y-3">
                <h5 className="text-xs font-medium text-[var(--color-text-secondary)]">
                  证据片段引用
                </h5>
                {vagueness.evidenceRefs.map((ref, idx) => (
                  <EvidenceRefCard key={idx} ref={ref} />
                ))}
              </div>
            )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-[var(--color-info-light)] bg-[var(--color-info-light)]/20 px-4 py-3 flex items-start gap-2">
        <span className="text-sm shrink-0">🤖</span>
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          AI 辅助建议，仅供参考，不构成录用/淘汰决策依据。
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Vagueness Badge
// ============================================================================

function VaguenessBadge({ level }: { level: "high" | "medium" | "low" }) {
  const config = {
    high: {
      label: "高度模糊",
      bg: "var(--color-danger-light)",
      color: "var(--color-danger)",
    },
    medium: {
      label: "中度模糊",
      bg: "var(--color-warning-light)",
      color: "var(--color-warning)",
    },
    low: {
      label: "低度模糊",
      bg: "var(--color-success-light)",
      color: "var(--color-success)",
    },
  };

  const c = config[level];

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

// ============================================================================
// Evidence Reference Card (Shared for Analysis)
// ============================================================================

function EvidenceRefCard({ ref }: { ref: EvidenceRef }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--color-primary)]">
            {ref.speaker}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {fmtTimeRange(ref.startMs, ref.endMs)}
          </span>
        </div>
        <span className="text-xs font-mono text-[var(--color-text-tertiary)]">
          #{ref.segmentId}
        </span>
      </div>
      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
        &ldquo;{ref.quote}&rdquo;
      </p>
      <div className="mt-2 pt-2 border-t border-[var(--color-border-light)]">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          分析依据: {ref.reason}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Drawer Tab: AI 建议
// ============================================================================

function DrawerSuggestionsTab({
  suggestions,
  onReview,
}: {
  suggestions: AiSuggestion[];
  onReview: (id: string, status: ReviewStatus) => void;
}) {
  if (suggestions.length === 0) {
    return (
      <EmptyState
        icon="🤖"
        title="暂无 AI 建议"
        description="当前证据不足，无法生成完整分析。建议补充追问后重新分析。"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Global Disclaimer */}
      <div className="rounded-lg border border-[var(--color-info-light)] bg-[var(--color-info-light)]/20 px-4 py-3 flex items-start gap-2">
        <span className="text-sm shrink-0">🤖</span>
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          AI 辅助建议，仅供参考，不构成录用/淘汰决策依据。
        </p>
      </div>

      {suggestions.map((suggestion) => {
        const reviewStatus =
          REVIEW_STATUS_CONFIG[suggestion.reviewStatus];

        const isSystemRule = suggestion.provider === "system_rule";
        const sourceBadge = isSystemRule
          ? {
              label: "系统规则提醒",
              bg: "var(--color-info-light)",
              color: "var(--color-info)",
            }
          : {
              label: "AI 辅助建议",
              bg: "var(--color-primary-light)",
              color: "var(--color-primary)",
            };

        return (
          <div
            key={suggestion.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            {/* Source Badge & Provider Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: sourceBadge.bg,
                    color: sourceBadge.color,
                  }}
                >
                  {sourceBadge.label}
                </span>
                {!isSystemRule && (
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                    <span className="font-mono">{suggestion.provider}</span>
                    <span>·</span>
                    <span className="font-mono">{suggestion.model}</span>
                    <span>·</span>
                    <span className="font-mono">
                      v{suggestion.promptVersion}
                    </span>
                  </div>
                )}
              </div>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: reviewStatus.bg,
                  color: reviewStatus.color,
                }}
              >
                {reviewStatus.label}
              </span>
            </div>

            {/* Suggestion Content */}
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-4 mb-4">
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                {suggestion.content}
              </p>
            </div>

            {/* AI Copilot Disclaimer */}
            {!isSystemRule && (
              <div className="rounded-lg border border-[var(--color-warning-light)] bg-[var(--color-warning-light)]/10 px-3 py-2 mb-4">
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  仅供参考，请结合真实业务和面试证据人工确认
                </p>
              </div>
            )}

            {/* Review Controls */}
            {suggestion.reviewStatus === "pending" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onReview(suggestion.id, "accepted")
                  }
                  className="rounded-lg bg-[var(--color-success)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                >
                  接受
                </button>
                <button
                  onClick={() =>
                    onReview(suggestion.id, "edited")
                  }
                  className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                >
                  编辑后接受
                </button>
                <button
                  onClick={() =>
                    onReview(suggestion.id, "rejected")
                  }
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
                >
                  忽略
                </button>
              </div>
            )}

            {/* Accepted/Edited Status Message */}
            {suggestion.reviewStatus === "accepted" && (
              <div className="rounded-lg bg-[var(--color-success-light)]/30 px-3 py-2">
                <p className="text-xs text-[var(--color-success)]">
                  已接受此建议
                </p>
              </div>
            )}

            {suggestion.reviewStatus === "edited" && (
              <div className="rounded-lg bg-[var(--color-primary-light)]/30 px-3 py-2">
                <p className="text-xs text-[var(--color-primary)]">
                  已编辑后接受
                </p>
              </div>
            )}

            {suggestion.reviewStatus === "rejected" && (
              <div className="rounded-lg bg-[var(--color-surface-tertiary)] px-3 py-2">
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  已忽略此建议
                </p>
              </div>
            )}

            {/* Timestamp */}
            <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
              生成时间: {fmtTime(suggestion.createdAt)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Drawer Tab: 活动日志
// ============================================================================

function DrawerActivityTab({ log }: { log: ActivityLogEntry[] }) {
  if (log.length === 0) {
    return (
      <EmptyState
        icon="📜"
        title="暂无活动日志"
        description="该文件暂无操作记录。"
      />
    );
  }

  return (
    <div className="space-y-0">
      {log.map((entry, idx) => (
        <div key={entry.id} className="flex items-start gap-4 pb-4 relative">
          {/* Timeline line */}
          {idx < log.length - 1 && (
            <div className="absolute left-[11px] top-8 bottom-0 w-px bg-[var(--color-border)]" />
          )}

          {/* Dot */}
          <div className="shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-surface)]" />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {entry.action}
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">
                {fmtTime(entry.timestamp)}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {entry.description}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
              {entry.actor}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
