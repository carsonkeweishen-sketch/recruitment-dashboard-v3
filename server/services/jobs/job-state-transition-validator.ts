// ============================================================
// Phase 8.1 Jobs v3 — State Transition Validator
// ============================================================
//
// Rule Engine is now a State Transition Validator, not a judgment module.
//
// Responsibilities:
//   1. Validate state transitions (is this allowed?)
//   2. Determine if transition should trigger an Action
//   3. Derive Risk signals from Event + Rule aggregation
//
// ALL state changes go through this validator.
// No UI direct mutation. No Rule direct mutation.
// ============================================================

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type {
  JobState,
  JobEvent,
  JobEventSummary,
  RiskType,
  RuleValidationResult,
  JobStateSnapshot,
} from "@/server/models/job-state-machine";
import {
  JOB_STATE_LABELS,
  JOB_EVENT_LABELS,
  RISK_LABELS,
} from "@/server/models/job-state-machine";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// ============================================================
// STATE DERIVATION (from application distribution)
// ============================================================

/**
 * Derive job state from application stage distribution.
 * This is a pure function — no side effects, no DB writes.
 */
function deriveState(
  applications: Array<{ stage: string; status: string }>,
  jobStatus: string,
  headcount: number
): JobState {
  if (jobStatus === "closed") return "closed";

  const activeApps = applications.filter((a) => a.status === "active");
  const totalApps = applications.length;

  if (totalApps === 0) return "sourcing";

  const hiredCount = applications.filter((a) => a.stage === "hired").length;
  if (hiredCount >= headcount) return "fulfilled";

  const stages = new Set(activeApps.map((a) => a.stage));
  if (stages.has("offer_risk") || stages.has("pre_onboarding")) return "offering";
  if (stages.has("first_interview") || stages.has("second_interview") || stages.has("final_interview")) return "interviewing";
  if (stages.has("hr_screen") || stages.has("business_screen")) return "screening";

  return "sourcing";
}

// ============================================================
// EVENT DERIVATION (from ActivityLog + DB state)
// ============================================================

/**
 * Build event summary for a job from ActivityLog.
 * Events are REAL data, not computed — they come from the audit trail.
 */
async function buildEventSummary(jobId: string): Promise<JobEventSummary> {
  // Fetch recent ActivityLog entries for this job
  const logs = await prisma.activityLog.findMany({
    where: {
      OR: [
        { resourceType: "job", resourceId: jobId },
        { resourceType: "action_item", resourceId: { in: await getJobActionIds(jobId) } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      action: true,
      resourceType: true,
      createdAt: true,
    },
  });

  // Map ActivityLog actions to JobEvents
  const eventMap: Record<string, JobEvent> = {
    CREATED: "job_created",
    ACTION_CREATED: "action_created",
    ACTION_RESOLVED: "state_changed",
    FEEDBACK_SUBMITTED: "feedback_submitted",
    INTERVIEW_COMPLETED: "interview_completed",
    CANDIDATE_ADDED: "candidate_assigned",
  };

  const recentEvents = logs.slice(0, 3).map((log) => {
    const eventType: JobEvent = eventMap[log.action] || "rule_triggered";
    return {
      type: eventType,
      label: JOB_EVENT_LABELS[eventType],
      at: log.createdAt.toISOString(),
    };
  });

  const latest = recentEvents[0];
  return {
    latestEvent: latest?.type ?? "job_created",
    latestEventLabel: latest?.label ?? "岗位创建",
    latestEventAt: latest?.at ?? null,
    totalEvents: logs.length,
    recentEvents,
  };
}

async function getJobActionIds(jobId: string): Promise<string[]> {
  const actions = await prisma.actionItem.findMany({
    where: { jobId },
    select: { id: true },
    take: 50,
  });
  return actions.map((a) => a.id);
}

// ============================================================
// RISK DERIVATION (Event + Rule aggregation)
// ============================================================

/**
 * Derive risk from real data, not hand-written classification.
 * Risk = Event history + Application state + Rule evaluation.
 */
async function deriveRisk(
  jobId: string,
  applications: Array<{ id: string; stage: string; status: string }>,
  jobStatus: string
): Promise<{ riskType: RiskType; explanation: string; shouldCreateAction: boolean; actionSuggestion: string | null }> {
  const activeApps = applications.filter((a) => a.status === "active");
  const totalApps = applications.length;

  // Rule 1: No candidates → supply shortage (Rule: R001)
  if (totalApps === 0 && jobStatus !== "closed") {
    return {
      riskType: "supply_shortage",
      explanation: "【R001】岗位无任何候选人投递。建议拓展招聘渠道或重新评估岗位画像。",
      shouldCreateAction: true,
      actionSuggestion: "拓展招聘渠道或调整岗位画像",
    };
  }

  // Rule 2: Interview stuck > 14 days (Rule: R002)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const stuckCount = await prisma.application.count({
    where: {
      jobId,
      status: "active",
      stage: { in: ["first_interview", "second_interview", "final_interview"] },
      updatedAt: { lt: fourteenDaysAgo },
    },
  });
  if (stuckCount > 0) {
    return {
      riskType: "interview_stuck",
      explanation: `【R002】${stuckCount}位候选人在面试阶段停留超过14天未推进。建议检查面试安排或催办面试官反馈。`,
      shouldCreateAction: true,
      actionSuggestion: "催办面试官提交反馈或安排下一轮面试",
    };
  }

  // Rule 3: Offer risk stage exists (Rule: R003)
  const offerRiskCount = activeApps.filter((a) => a.stage === "offer_risk").length;
  if (offerRiskCount > 0) {
    return {
      riskType: "offer_risk",
      explanation: `【R003】${offerRiskCount}位候选人处于Offer风险阶段。存在薪资差距、竞品Offer或决策延迟等风险。`,
      shouldCreateAction: true,
      actionSuggestion: "加速Offer决策流程，评估竞品风险",
    };
  }

  // Rule 4: Business feedback delay > 48h (Rule: R004)
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staleFeedbackCount = await (prisma as any).businessFeedback.count({
    where: { jobId, createdAt: { lt: twoDaysAgo } },
  });
  if (staleFeedbackCount > 0) {
    return {
      riskType: "feedback_delay",
      explanation: `【R004】${staleFeedbackCount}条业务反馈超过48小时未处理。建议催办业务负责人。`,
      shouldCreateAction: true,
      actionSuggestion: "催办业务负责人处理反馈",
    };
  }

  // Default: healthy
  return {
    riskType: "pipeline_healthy",
    explanation: "【R000】当前招聘流程正常推进，无规则触发风险信号。",
    shouldCreateAction: false,
    actionSuggestion: null,
  };
}

// ============================================================
// STATE TRANSITION VALIDATOR (main entry point)
// ============================================================

/**
 * Validate a job's current state and return a complete snapshot.
 * This is the SINGLE entry point for all job state queries.
 *
 * @returns RuleValidationResult — always includes:
 *   - allowed: always true for read operations
 *   - targetState: derived from data
 *   - riskType + riskExplanation: from Rule Engine
 *   - ruleId: which rule triggered (traceable)
 */
export async function validateJobState(
  jobId: string,
  jobStatus: string,
  headcount: number,
  applications: Array<{ id: string; stage: string; status: string }>
): Promise<RuleValidationResult> {
  const targetState = deriveState(applications, jobStatus, headcount);
  const risk = await deriveRisk(jobId, applications, jobStatus);
  const riskInfo = RISK_LABELS[risk.riskType];

  return {
    allowed: true,
    targetState,
    riskType: risk.riskType,
    riskLabel: riskInfo.label,
    riskColor: riskInfo.color,
    riskExplanation: risk.explanation,
    shouldCreateAction: risk.shouldCreateAction,
    actionSuggestion: risk.actionSuggestion,
    ruleId: risk.explanation.match(/【(R\d+)】/)?.[1] ?? "R000",
  };
}

/**
 * Build a complete JobStateSnapshot for API consumption.
 * Aggregates State + Event + Rule + Action layers.
 */
export async function buildJobStateSnapshot(
  jobId: string,
  jobStatus: string,
  headcount: number,
  applications: Array<{ id: string; stage: string; status: string }>
): Promise<JobStateSnapshot> {
  const validation = await validateJobState(jobId, jobStatus, headcount, applications);
  const eventSummary = await buildEventSummary(jobId);
  const openActions = await prisma.actionItem.count({ where: { jobId, status: "open" } });

  const isBottleneck =
    validation.riskType !== "pipeline_healthy" && validation.shouldCreateAction;

  return {
    jobId,
    currentState: validation.targetState,
    currentStateLabel: JOB_STATE_LABELS[validation.targetState],
    riskType: validation.riskType,
    riskLabel: validation.riskLabel,
    riskColor: validation.riskColor,
    riskExplanation: validation.riskExplanation,
    ruleId: validation.ruleId,
    eventSummary,
    openActions,
    isBottleneck,
    bottleneckReason: isBottleneck ? validation.riskExplanation : null,
  };
}
