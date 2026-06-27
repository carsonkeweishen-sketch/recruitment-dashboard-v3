/** Risk Insight Card */
import { StatusBadge } from "@/components/ui/StatusBadge";

const SEVERITY_MAP: Record<string, "danger" | "warning" | "default"> = {
  urgent: "danger",
  high: "warning",
  medium: "default",
  low: "default",
};

const CATEGORY_LABELS: Record<string, string> = {
  process_blocker: "流程卡点",
  feedback_followup: "反馈催办",
  candidate_risk: "候选人风险",
  candidate_risk_followup: "候选人风险",
  offer_risk: "Offer风险",
  data_quality: "数据质量",
  job_calibration: "岗位校准",
};

export function RiskInsightCard({ insight }: { insight: Record<string, unknown> }) {
  const severity = String(insight.severity ?? "medium");
  const category = String(insight.category ?? "");
  const evidence = Array.isArray(insight.evidence) ? insight.evidence : [];

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge
              label={CATEGORY_LABELS[category] || category}
              variant={SEVERITY_MAP[severity] || "default"}
            />
            <span className="text-xs text-[var(--color-text-tertiary)]">
              系统规则提醒
            </span>
          </div>
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mt-1">
            {String(insight.title ?? "")}
          </h4>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {String(insight.summary ?? "")}
          </p>
          {evidence.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {evidence.filter(Boolean).map((e: string, i: number) => (
                <div key={i} className="text-xs text-[var(--color-text-tertiary)]">
                  · {e}
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-[var(--color-primary)] font-medium">
            → {String(insight.suggestedAction ?? "")}
          </p>
        </div>
      </div>
    </div>
  );
}
