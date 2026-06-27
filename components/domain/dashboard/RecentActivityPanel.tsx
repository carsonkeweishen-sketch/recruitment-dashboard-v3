/** Recent Activity Panel */
const ACTIVITY_LABELS: Record<string, string> = {
  ACTION_CREATED: "创建了行动项",
  ACTION_RESOLVED: "标记行动项为已解决",
  ACTION_DISMISSED: "忽略了行动项",
  CREATED: "创建了",
};

function formatActivity(action: string, detail: unknown): string {
  const base = ACTIVITY_LABELS[action] || action;
  if (detail && typeof detail === "object") {
    const d = detail as Record<string, unknown>;
    if (d.title) return `${base}：${d.title}`;
    if (d.resolutionNote) return `${base}：${d.resolutionNote}`;
  }
  return base;
}

export function RecentActivityPanel({ activities }: { activities: Array<Record<string, unknown>> | null }) {
  if (!activities || activities.length === 0) {
    return (
      <section>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">最近动态</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">暂无最近动态。</p>
      </section>
    );
  }

  return (
    <section>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">最近动态</h3>
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
        {activities.map((a, idx) => (
          <div key={String(a.id ?? idx)} className="flex items-start gap-3 px-4 py-3">
            <span className="text-sm mt-0.5 shrink-0">
              {String(a.action || "").includes("CREATED") ? "📝" :
               String(a.action || "").includes("RESOLVED") ? "✅" :
               String(a.action || "").includes("DISMISSED") ? "🗑️" : "📌"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--color-text-primary)]">
                <span className="font-medium">{String(a.actorName ?? "系统")}</span>
                {" "}{formatActivity(String(a.action ?? ""), a.detail)}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                {new Date(String(a.createdAt ?? "")).toLocaleString("zh-CN")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
