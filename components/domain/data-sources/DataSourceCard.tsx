"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataSourceCard({ source, onClick }: { source: any; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-border-strong)] transition-colors">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{source.fileName || source.externalUrl?.substring(0, 50) || "未命名资料"}</h3>
        <StatusBadge label={STATUS_LABELS[source.parseStatus] || source.parseStatus} variant={STATUS_VARIANTS[source.parseStatus] || "default"} />
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
        <span>{source.sourceType === "upload" ? "📄" : source.sourceType === "feishu_link" ? "🪽" : source.sourceType === "moka_link" ? "🔗" : "🌐"} {source.sourceSystem}</span>
        {source.usageType && <span>· {source.usageType}</span>}
        {source.links?.length > 0 && <span>· 关联: {source.links.length}</span>}
      </div>
    </button>
  );
}
