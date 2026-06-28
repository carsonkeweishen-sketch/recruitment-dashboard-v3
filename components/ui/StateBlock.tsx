"use client";

/**
 * Phase 8.12 — Unified StateBlock
 * 统一 Empty / Error / Permission / Loading / NotConfigured / NoEvidence / PartialData / DataQualityWarning
 */

export type StateType = "empty" | "error" | "permission" | "loading" | "not_configured" | "no_evidence" | "partial_data" | "data_quality_warning";

interface StateBlockProps {
  type: StateType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const STATE_DEFAULTS: Record<StateType, { icon: string; title: string; description: string }> = {
  empty: { icon: "📭", title: "暂无数据", description: "当前没有可显示的内容，请上传资料或创建新记录。" },
  error: { icon: "⚠️", title: "加载失败", description: "数据加载出现问题，请稍后重试。如果问题持续，请联系管理员。" },
  permission: { icon: "🔒", title: "暂无权限", description: "你当前的权限无法访问此内容。如需帮助，请联系管理员。" },
  loading: { icon: "⏳", title: "加载中...", description: "正在获取数据，请稍候。" },
  not_configured: { icon: "🔧", title: "服务未配置", description: "此功能需要先配置相关服务。请前往集成中心完成配置。" },
  no_evidence: { icon: "🔍", title: "证据不足", description: "当前上下文未找到足够证据。建议补充相关资料后再生成 AI 建议。" },
  partial_data: { icon: "📊", title: "部分数据可用", description: "部分数据源返回了结果，但存在缺失。请检查数据源状态。" },
  data_quality_warning: { icon: "💡", title: "数据质量提醒", description: "部分数据可能不完整或已过期，建议核实后再做决策。" },
};

export function StateBlock({ type, title, description, action }: StateBlockProps) {
  const defaults = STATE_DEFAULTS[type];
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center">
      <span className="text-4xl mb-3">{defaults.icon}</span>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title || defaults.title}</h3>
      <p className="mt-1 max-w-md text-xs text-[var(--color-text-tertiary)]">{description || defaults.description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
