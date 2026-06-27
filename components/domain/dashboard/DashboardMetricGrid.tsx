/** Dashboard Metric Grid — KPI 卡片网格 */
import { KpiCard } from "@/components/ui/kpi-card";

const METRIC_DEFS: Array<{ key: string; label: string; href?: string }> = [
  { key: "activeJobCount", label: "进行中岗位", href: "/jobs" },
  { key: "activeCandidateCount", label: "活跃候选人", href: "/candidates" },
  { key: "openActionCount", label: "待处理行动项", href: "/actions?status=open" },
  { key: "overdueActionCount", label: "逾期行动项", href: "/actions?overdue=true" },
  { key: "highPriorityActionCount", label: "高优先级行动项", href: "/actions?priority=high" },
  { key: "dueTodayActionCount", label: "今日到期行动项", href: "/actions?due=today" },
  { key: "averageResolutionHours", label: "平均关闭时长(h)" },
  { key: "onTimeResolutionRate", label: "按时关闭率" },
];

export function DashboardMetricGrid({ metrics }: { metrics: Record<string, number | null> | null }) {
  if (!metrics) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {METRIC_DEFS.map((def) => {
        const val = metrics[def.key];
        const display = val !== null && val !== undefined ? String(val) : "—";
        const trend = def.key === "overdueActionCount" && val !== null && val !== undefined
          ? (val > 0 ? "down" as const : "flat" as const)
          : "flat" as const;
        return (
          <KpiCard
            key={def.key}
            label={def.label}
            value={display}
            href={def.href}
            trendDirection={trend}
          />
        );
      })}
    </div>
  );
}
