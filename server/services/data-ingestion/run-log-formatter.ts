// Phase 8.9A: Integration Center — Run Log Formatter
// Converts raw integration events into human-readable Chinese log entries.
// Never exposes raw JSON, stack traces, enums, or external error messages.

export interface FormattedLogEntry {
  id: string;
  provider: string;
  displayName: string;
  timestamp: string;
  action: string;
  result: string;
  detail?: string;
  severity: 'ok' | 'warning' | 'error';
}

export interface RawLogEntry {
  id: string;
  provider: string;
  runType: string;
  status: string;
  latencyMs: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  createdById?: string | null;
}

// ── Display Names ────────────────────────────────────────────────

const DISPLAY_NAMES: Record<string, string> = {
  deepseek: 'DeepSeek AI',
  openai_compatible: 'OpenAI Compatible',
  feishu: '飞书',
  moka: 'Moka',
};

// ── Run Type Labels ──────────────────────────────────────────────

const RUN_TYPE_LABELS: Record<string, string> = {
  status_check: '状态检查',
  smoke_test: '连接测试',
  fetch_attempt: '内容读取',
  sync_attempt: '数据同步',
  validate_config: '配置验证',
  test_connection: '连接测试',
};

// ── Format Single Entry ──────────────────────────────────────────

export function formatRunLog(raw: RawLogEntry): FormattedLogEntry {
  const action = RUN_TYPE_LABELS[raw.runType] ?? raw.runType;
  const displayName = DISPLAY_NAMES[raw.provider] ?? raw.provider;

  let result: string;
  let severity: 'ok' | 'warning' | 'error';

  switch (raw.status) {
    case 'success':
      result = `${displayName} ${action}成功`;
      severity = 'ok';
      break;
    case 'not_configured':
      result = `${displayName} 尚未配置，当前仅保留接口能力`;
      severity = 'warning';
      break;
    case 'permission_required':
      result = `${displayName} 尚未授权，需完成应用授权后才可读取`;
      severity = 'warning';
      break;
    case 'timeout':
      result = '连接超时，未产生同步结果，请稍后重试';
      severity = 'error';
      break;
    case 'error':
      result = '连接失败，请检查服务端凭据配置';
      severity = 'error';
      break;
    case 'skipped':
      result = `${displayName} ${action}已跳过（未配置）`;
      severity = 'warning';
      break;
    case 'warning':
      result = `${displayName} ${action}完成（有提示信息）`;
      severity = 'warning';
      break;
    default:
      result = `${displayName} ${action}完成`;
      severity = 'ok';
  }

  let detail: string | undefined;
  if (raw.status === 'error' || raw.status === 'timeout') {
    detail = '请检查凭据配置、网络连接和权限设置。';
  } else if (raw.latencyMs !== null && raw.latencyMs !== undefined) {
    detail = `耗时 ${raw.latencyMs}ms`;
  }

  return {
    id: raw.id,
    provider: raw.provider,
    displayName,
    timestamp: raw.createdAt,
    action,
    result,
    detail,
    severity,
  };
}

// ── Format Multiple Entries ──────────────────────────────────────

export function formatRunLogs(raws: RawLogEntry[]): FormattedLogEntry[] {
  return raws.map(formatRunLog);
}
