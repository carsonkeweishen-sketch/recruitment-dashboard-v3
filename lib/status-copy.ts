// Phase 8.12: Status Copy Registry — 统一状态人话文案
export const STATUS_COPY: Record<string, { label: string; description: string }> = {
  empty: { label: "暂无数据", description: "当前没有可显示的内容" },
  error: { label: "加载失败", description: "数据加载出现问题，请稍后重试" },
  permission: { label: "暂无权限", description: "你当前的权限无法访问此内容" },
  loading: { label: "加载中...", description: "正在获取数据，请稍候" },
  not_configured: { label: "服务未配置", description: "此功能需要先配置相关服务" },
  no_evidence: { label: "证据不足", description: "当前上下文未找到足够证据" },
  partial_data: { label: "部分数据可用", description: "部分数据源返回了结果" },
  data_quality_warning: { label: "数据质量提醒", description: "部分数据可能不完整" },
};
