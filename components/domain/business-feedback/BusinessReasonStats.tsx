"use client";

interface ReasonStatsProps {
  decisionStats: Record<string, number>;
  reasonStats: Record<string, number>;
}

const DECISION_LABELS: Record<string, string> = { PASS: "通过", REJECT: "拒绝", HOLD: "待定", REDIRECT: "转推" };
const DECISION_COLORS: Record<string, string> = { PASS: "#16A34A", REJECT: "#DC2626", HOLD: "#D97706", REDIRECT: "#2563EB" };
const REASON_LABELS: Record<string, string> = {
  EXPERIENCE_MISMATCH: "经验不匹配", CAPABILITY_GAP: "能力不足", SENIORITY_MISMATCH: "资历不匹配",
  SALARY_GAP: "薪资差距", EXPECTATION_MISMATCH: "期望不匹配", COMMUNICATION_GAP: "沟通问题",
  STABILITY_RISK: "稳定性风险", CULTURE_MISMATCH: "文化不匹配", LOCATION_ISSUE: "地点问题", OTHER: "其他",
};

export function BusinessReasonStats({ decisionStats, reasonStats }: ReasonStatsProps) {
  const total = Object.values(decisionStats).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const sortedReasons = Object.entries(reasonStats).sort((a, b) => b[1] - a[1]);
  const maxReason = sortedReasons[0]?.[1] || 1;

  return (
    <div className="space-y-4">
      {/* Decision Distribution */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">决策分布</div>
        <div className="flex gap-2">
          {Object.entries(decisionStats).map(([key, count]) => (
            <div key={key} className="flex-1 rounded-lg border border-[var(--color-border)] p-2 text-center">
              <div className="text-lg font-semibold" style={{ color: DECISION_COLORS[key] || "#6B7280" }}>{count}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">{DECISION_LABELS[key] || key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reason Distribution */}
      {sortedReasons.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">拒绝原因分布</div>
          <div className="space-y-2">
            {sortedReasons.map(([code, count]) => (
              <div key={code} className="flex items-center gap-2">
                <span className="w-24 text-xs text-[var(--color-text-secondary)]">{REASON_LABELS[code] || code}</span>
                <div className="flex-1 h-4 rounded bg-[var(--color-surface-tertiary)] overflow-hidden">
                  <div className="h-full rounded bg-[var(--color-primary)] transition-all" style={{ width: `${(count / maxReason) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-[var(--color-text-primary)] w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
