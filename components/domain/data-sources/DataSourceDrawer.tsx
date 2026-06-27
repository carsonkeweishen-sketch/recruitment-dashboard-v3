"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const STATUS_LABELS: Record<string, string> = {
  pending: "待解析", parsing: "解析中", parsed: "已解析",
  failed: "解析失败", unsupported: "不支持", unsupported_ocr_pending: "OCR待实现",
  transcription_pending: "转写待实现", permission_required: "需授权", not_configured: "未配置",
};
const STATUS_VARIANTS: Record<string, "default" | "warning" | "danger" | "success"> = {
  parsed: "success", parsing: "warning", failed: "danger", pending: "default",
  unsupported_ocr_pending: "warning", transcription_pending: "warning",
  permission_required: "danger", not_configured: "default",
};

type TabKey = "overview" | "chunks" | "links" | "parse-jobs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataSourceDrawer({ sourceId, onClose }: { sourceId: string | null; onClose: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (!sourceId) return;
    setLoading(true);
    fetch(`/api/data-sources/${sourceId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, [sourceId]);

  if (!sourceId) return null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "概览" }, { key: "chunks", label: "内容块" },
    { key: "links", label: "关联对象" }, { key: "parse-jobs", label: "解析历史" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] h-full overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">资料详情</h2>
          <button onClick={onClose} className="text-sm text-[var(--color-text-tertiary)]">✕</button>
        </div>
        {loading ? <LoadingSkeleton /> : data ? (
          <>
            <div className="flex border-b border-[var(--color-border)] -mx-6 px-6 mb-4">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2.5 text-sm font-medium border-b-2 ${tab === t.key ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-tertiary)]"}`}>{t.label}</button>
              ))}
            </div>
            {tab === "overview" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusBadge label={STATUS_LABELS[data.parseStatus] || data.parseStatus} variant={STATUS_VARIANTS[data.parseStatus] || "default"} />
                </div>
                <h3 className="text-sm font-semibold">{data.fileName || data.externalUrl || "未命名"}</h3>
                <div className="text-xs text-[var(--color-text-tertiary)] space-y-1">
                  <p>类型: {data.sourceType} | 来源: {data.sourceSystem}</p>
                  {data.fileMimeType && <p>格式: {data.fileMimeType}</p>}
                  {data.usageType && <p>用途: {data.usageType}</p>}
                  {data.parseError && <p className="text-[var(--color-danger)]">错误: {data.parseError}</p>}
                </div>
              </div>
            )}
            {tab === "chunks" && (
              <div className="space-y-2">
                {(data.chunks || []).map((c: Record<string,unknown>, i: number) => (
                  <div key={i} className="rounded-xl border border-[var(--color-border)] p-3">
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-1">Chunk #{String(c.chunkIndex)}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{String(c.contentSummary || c.contentText || "").substring(0, 200)}</p>
                  </div>
                ))}
                {(!data.chunks || data.chunks.length === 0) && <p className="text-sm text-[var(--color-text-secondary)]">暂无解析内容</p>}
              </div>
            )}
            {tab === "links" && (
              <div className="space-y-2">
                {(data.links || []).map((l: Record<string,unknown>, i: number) => (
                  <div key={i} className="rounded-xl border border-[var(--color-border)] p-3">
                    <p className="text-sm">{String(l.objectType)} → {String(l.objectId)}</p>
                  </div>
                ))}
                {(!data.links || data.links.length === 0) && <p className="text-sm text-[var(--color-text-secondary)]">暂无关联对象</p>}
              </div>
            )}
            {tab === "parse-jobs" && (
              <div className="space-y-2">
                {(data.parseJobs || []).map((j: Record<string,unknown>, i: number) => (
                  <div key={i} className="rounded-xl border border-[var(--color-border)] p-3">
                    <p className="text-sm font-medium">{String(j.jobStatus)} · {String(j.parserType || "")}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{String(j.startedAt || j.createdAt || "")}</p>
                  </div>
                ))}
                {(!data.parseJobs || data.parseJobs.length === 0) && <p className="text-sm text-[var(--color-text-secondary)]">暂无解析记录</p>}
              </div>
            )}
          </>
        ) : <p className="text-sm text-[var(--color-text-secondary)]">加载失败</p>}
      </div>
    </div>
  );
}
