"use client";

/**
 * Phase 8.12 — ProvenanceBadge
 * 统一 AI 溯源标签：system_rule / llm / retrieval / data_source / transcript
 */

export type ProvenanceType = "system_rule" | "llm" | "retrieval" | "data_source" | "transcript";

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  provider?: string;
  model?: string;
  promptVersion?: string;
  className?: string;
}

const TYPE_LABELS: Record<ProvenanceType, { label: string; variant: "system_rule" | "ai" | "info" | "neutral" }> = {
  system_rule: { label: "系统规则提醒", variant: "system_rule" },
  llm: { label: "AI 辅助建议", variant: "ai" },
  retrieval: { label: "检索结果", variant: "info" },
  data_source: { label: "资料来源", variant: "neutral" },
  transcript: { label: "转写引用", variant: "info" },
};

const VARIANT_STYLES = {
  system_rule: "bg-[var(--color-info-light)] text-[var(--color-info)]",
  ai: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  info: "bg-[var(--color-info-light)] text-[var(--color-info)]",
  neutral: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
};

export function ProvenanceBadge({ type, provider, model, promptVersion, className = "" }: ProvenanceBadgeProps) {
  const config = TYPE_LABELS[type];
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${VARIANT_STYLES[config.variant]}`}>
        {config.label}
      </span>
      {type === "llm" && provider && (
        <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">
          {provider}{model ? ` · ${model}` : ""}{promptVersion ? ` · ${promptVersion}` : ""}
        </span>
      )}
    </div>
  );
}
