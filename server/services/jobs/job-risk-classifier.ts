// Phase 8.1 Jobs v2: Job Risk Classifier
// Rule Engine driven risk classification for job list view.
// Each job gets ONE risk label computed from real data.
// No hardcoded states — all derived from Rule Engine logic.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export type RiskLabel =
  | "supply_shortage"      // 供给不足
  | "feedback_delay"        // 业务反馈延迟
  | "interview_stuck"       // 面试卡点
  | "offer_risk"            // Offer风险
  | "pipeline_healthy";     // 流程健康

export const RISK_LABEL_MAP: Record<RiskLabel, { label: string; color: string; description: string }> = {
  supply_shortage:    { label: "供给不足", color: "danger",  description: "候选人供给不足，建议拓展招聘渠道或调整画像" },
  feedback_delay:     { label: "反馈延迟", color: "warning", description: "业务反馈处理超时，建议催办业务负责人" },
  interview_stuck:    { label: "面试卡点", color: "warning", description: "候选人在面试阶段停留过久，建议检查面试安排" },
  offer_risk:         { label: "Offer风险", color: "danger",  description: "Offer阶段存在流失风险，建议加速决策" },
  pipeline_healthy:   { label: "流程健康", color: "success", description: "当前招聘流程正常推进中" },
};

export interface JobRiskResult {
  jobId: string;
  riskLabel: RiskLabel;
  riskLabelText: string;
  riskColor: string;
  riskDescription: string;
  /** State derived from application distribution */
  derivedState: JobDerivedState;
  derivedStateLabel: string;
  /** Number of open actions for this job */
  openActions: number;
}

export type JobDerivedState = "sourcing" | "screening" | "interviewing" | "offering" | "fulfilled" | "closed";

export const DERIVED_STATE_LABELS: Record<JobDerivedState, string> = {
  sourcing:     "渠道寻源",
  screening:    "筛选评估",
  interviewing: "面试中",
  offering:     "Offer阶段",
  fulfilled:    "已完成",
  closed:       "已关闭",
};

/**
 * Classify a single job based on its application data.
 * Priority order (first match wins):
 * 1. supply_shortage: 0 applications
 * 2. feedback_delay: business feedback > 48h unresolved
 * 3. interview_stuck: apps stuck in interview stages > 14 days
 * 4. offer_risk: apps in offer_risk stage
 * 5. pipeline_healthy: default
 */
export async function classifyJobRisk(
  jobId: string,
  applications: Array<{ id: string; stage: string; status: string }>,
  jobStatus: string
): Promise<JobRiskResult> {
  const activeApps = applications.filter((a) => a.status === "active");
  const totalApps = applications.length;

  // Derive state
  let derivedState: JobDerivedState;
  if (jobStatus === "closed") {
    derivedState = "closed";
  } else if (totalApps === 0) {
    derivedState = "sourcing";
  } else {
    const stages = new Set(activeApps.map((a) => a.stage));
    if (stages.has("offer_risk") || stages.has("pre_onboarding")) {
      derivedState = "offering";
    } else if (stages.has("first_interview") || stages.has("second_interview") || stages.has("final_interview")) {
      derivedState = "interviewing";
    } else if (stages.has("hr_screen") || stages.has("business_screen")) {
      derivedState = "screening";
    } else if (stages.has("sourced")) {
      derivedState = "sourcing";
    } else {
      derivedState = "sourcing";
    }
  }

  // Count open actions
  const openActions = await prisma.actionItem.count({
    where: { jobId, status: "open" },
  });

  // Determine risk label
  let riskLabel: RiskLabel = "pipeline_healthy";

  // Rule 1: No candidates = supply shortage
  if (totalApps === 0 && jobStatus !== "closed") {
    riskLabel = "supply_shortage";
  }

  // Rule 2: Stuck in interview stages > 14 days
  if (riskLabel === "pipeline_healthy") {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stuckCount = await prisma.application.count({
      where: {
        jobId,
        status: "active",
        stage: { in: ["first_interview", "second_interview", "final_interview"] },
        updatedAt: { lt: fourteenDaysAgo },
      },
    });
    if (stuckCount > 0) {
      riskLabel = "interview_stuck";
    }
  }

  // Rule 3: Offer risk stage apps exist
  if (riskLabel === "pipeline_healthy") {
    const offerRiskCount = activeApps.filter((a) => a.stage === "offer_risk").length;
    if (offerRiskCount > 0) {
      riskLabel = "offer_risk";
    }
  }

  // Rule 4: Business feedback delay
  if (riskLabel === "pipeline_healthy") {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const staleFeedbackCount = await (prisma as unknown as { businessFeedback: { count: (q: Record<string, unknown>) => Promise<number> } }).businessFeedback.count({
      where: {
        jobId,
        createdAt: { lt: twoDaysAgo },
      },
    });
    if (staleFeedbackCount > 0) {
      riskLabel = "feedback_delay";
    }
  }

  const riskInfo = RISK_LABEL_MAP[riskLabel];

  return {
    jobId,
    riskLabel,
    riskLabelText: riskInfo.label,
    riskColor: riskInfo.color,
    riskDescription: riskInfo.description,
    derivedState,
    derivedStateLabel: DERIVED_STATE_LABELS[derivedState],
    openActions,
  };
}

/**
 * Batch classify multiple jobs.
 */
export async function classifyJobsRisk(
  jobs: Array<{
    id: string;
    status: string;
    applications: Array<{ id: string; stage: string; status: string }>;
  }>
): Promise<Map<string, JobRiskResult>> {
  const results = new Map<string, JobRiskResult>();
  for (const job of jobs) {
    const result = await classifyJobRisk(job.id, job.applications, job.status);
    results.set(job.id, result);
  }
  return results;
}
