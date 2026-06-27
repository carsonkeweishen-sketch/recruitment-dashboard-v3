/** AI Health Summary — 系统招聘洞察 */
export function AiHealthSummary({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">💡</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {String(data.title ?? "系统招聘洞察")}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {String(data.summary ?? "")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
            <span>生成方式：系统规则提醒</span>
            <span>·</span>
            <span>证据数量：{String(data.evidenceCount ?? 0)} 条</span>
            <span>·</span>
            <span>更新时间：{new Date(String(data.updatedAt ?? "")).toLocaleString("zh-CN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
