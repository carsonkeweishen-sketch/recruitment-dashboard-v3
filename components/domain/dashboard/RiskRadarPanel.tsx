/** Risk Radar Panel — 风险矩阵 */
import { StatusBadge } from "@/components/ui/StatusBadge";

const LEVEL_VARIANT: Record<string, "danger" | "warning" | "default"> = {
  urgent: "danger",
  high: "warning",
  medium: "default",
  low: "default",
};

export function RiskRadarPanel({ items }: { items: Array<Record<string, unknown>> | null }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">风险雷达</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">当前未检测到风险信号。</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">风险雷达</h3>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const level = String(item.riskLevel ?? "medium");
          return (
            <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {String(item.riskLabel ?? item.riskName ?? "")}
                </span>
                <StatusBadge label={level === "urgent" ? "紧急" : level === "high" ? "高" : "中"} variant={LEVEL_VARIANT[level] || "default"} />
              </div>
              <div className="flex items-center gap-2 shrink-0 text-sm">
                <span className="text-[var(--color-text-primary)] font-medium">{String(item.totalActionCount ?? 0)}</span>
                {(Number(item.overdueCount) || 0) > 0 ? (
                  <span className="text-[var(--color-danger)] text-xs">({String(item.overdueCount)} 逾期)</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
