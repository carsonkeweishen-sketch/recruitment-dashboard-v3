/** Priority Actions Panel */
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";

const PRIORITY_VARIANT: Record<string, "danger" | "warning" | "default"> = {
  urgent: "danger",
  high: "warning",
  medium: "default",
  low: "default",
};

export function PriorityActionsPanel({ actions }: { actions: Array<Record<string, unknown>> | null }) {
  if (!actions || actions.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">优先行动项</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">当前无待处理行动项。</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">优先行动项</h3>
        <Link href="/actions" className="text-xs text-[var(--color-primary)] hover:underline">
          查看全部 →
        </Link>
      </div>
      <div className="space-y-2">
        {actions.map((a, idx) => {
          const isOverdue = a.dueAt && new Date(String(a.dueAt)) < new Date();
          return (
            <Link
              key={String(a.id ?? idx)}
              href={`/actions`}
              className="block rounded-xl border border-[var(--color-border)] px-4 py-3 hover:bg-[var(--color-surface-secondary)] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {String(a.title ?? "")}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge
                      label={String(a.priority === "urgent" ? "紧急" : a.priority === "high" ? "高" : "中")}
                      variant={PRIORITY_VARIANT[String(a.priority ?? "medium")] || "default"}
                    />
                    {isOverdue ? (
                      <span className="text-xs text-[var(--color-danger)]">逾期</span>
                    ) : null}
                    {a.jobTitle ? (
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        {String(a.jobTitle)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">
                  {String(a.ownerName ?? "—")}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
