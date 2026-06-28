// Phase 8.9A: Integration Center — Unified Status Mapper
// Single source of truth for status display across all components

export type StatusDisplay = {
  status: string;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  icon: string;
  helpText: string;
  severity: 'ok' | 'warning' | 'error' | 'info';
};

// ── The SIX required states ─────────────────────────────────────

const STATUS_MAP: Record<string, StatusDisplay> = {
  configured: {
    status: 'configured',
    label: '已配置 · 可用',
    shortLabel: '已配置',
    color: 'var(--color-success)',
    bgColor: 'var(--color-success-light)',
    icon: '✅',
    helpText: '连接测试通过，可用于当前功能。',
    severity: 'ok',
  },
  not_configured: {
    status: 'not_configured',
    label: '未配置 · 等待连接',
    shortLabel: '未配置',
    color: 'var(--color-text-tertiary)',
    bgColor: 'var(--color-surface-secondary)',
    icon: '⬜',
    helpText: '当前仅保留接口能力，配置凭据后可启用。',
    severity: 'info',
  },
  permission_required: {
    status: 'permission_required',
    label: '需授权 · 配置后可读取',
    shortLabel: '需授权',
    color: 'var(--color-warning)',
    bgColor: 'var(--color-warning-light)',
    icon: '🔐',
    helpText: '需要完成应用授权后才可读取内容。',
    severity: 'warning',
  },
  readonly: {
    status: 'readonly',
    label: '只读预留 · 不写回',
    shortLabel: '只读预留',
    color: 'var(--color-info)',
    bgColor: 'var(--color-info-light)',
    icon: '👁️',
    helpText: '当前只读取或登记状态，不会写回外部系统。',
    severity: 'info',
  },
  error: {
    status: 'error',
    label: '连接异常 · 请检查配置',
    shortLabel: '连接异常',
    color: 'var(--color-danger)',
    bgColor: 'var(--color-danger-light)',
    icon: '❌',
    helpText: '连接失败，请检查凭据、权限或网络。',
    severity: 'error',
  },
  timeout: {
    status: 'timeout',
    label: '连接超时 · 稍后重试',
    shortLabel: '连接超时',
    color: 'var(--color-danger)',
    bgColor: 'var(--color-warning-light)',
    icon: '⏱️',
    helpText: '外部服务响应超时，未产生同步结果。',
    severity: 'error',
  },
};

// ── Core Functions ───────────────────────────────────────────────

export function getStatusDisplay(status: string): StatusDisplay {
  return STATUS_MAP[status] ?? {
    status,
    label: status,
    shortLabel: status,
    color: 'var(--color-text-tertiary)',
    bgColor: 'var(--color-surface-secondary)',
    icon: '❓',
    helpText: '',
    severity: 'info',
  };
}

// ── Provider Grouping for UI ─────────────────────────────────────

export const PROVIDER_GROUPS: Record<string, { label: string; providers: string[] }> = {
  ai_providers: { label: 'AI 服务', providers: ['deepseek', 'openai_compatible'] },
  recruitment_systems: { label: '招聘系统', providers: ['moka'] },
  collaboration_tools: { label: '协同工具', providers: ['feishu'] },
};

export function getProviderGroup(provider: string): string {
  for (const [groupKey, group] of Object.entries(PROVIDER_GROUPS)) {
    if (group.providers.includes(provider)) return groupKey;
  }
  return 'ai_providers';
}

export function getProviderGroupLabel(provider: string): string {
  const groupKey = getProviderGroup(provider);
  return PROVIDER_GROUPS[groupKey]?.label ?? '其他';
}

// ── Mode Labels (Human Chinese) ──────────────────────────────────

export const MODE_LABELS: Record<string, string> = {
  ai_provider: 'AI 模型服务',
  document_provider: '文档读取',
  ats_provider: '招聘系统对接',
};

// ── Security Hint ────────────────────────────────────────────────

export const SECURITY_HINT = '凭据仅服务端读取，不会提交代码仓库，不会展示明文。';
