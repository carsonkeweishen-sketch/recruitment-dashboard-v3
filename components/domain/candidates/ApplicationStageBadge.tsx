"use client";

const stageLabels: Record<string, string> = {
  sourced: "入库", hr_screen: "HR筛选", business_screen: "业务筛选",
  first_interview: "初试", second_interview: "复试", final_interview: "终面",
  offer_risk: "Offer风险", pre_onboarding: "入职前", hired: "已入职",
  rejected: "已淘汰", withdrawn: "退出", closed: "已关闭",
};

const stageColors: Record<string, string> = {
  sourced: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
  hr_screen: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  business_screen: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  first_interview: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  second_interview: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  final_interview: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  offer_risk: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  pre_onboarding: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  hired: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  rejected: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]",
  withdrawn: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]",
  closed: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]",
};

export function ApplicationStageBadge({ stage }: { stage: string }) {
  const label = stageLabels[stage] ?? stage;
  const color = stageColors[stage] ?? "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}
