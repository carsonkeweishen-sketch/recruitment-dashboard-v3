// ============================================================
// Phase 8.1 Jobs v3 — Event-Driven Job State Machine System
// ============================================================
//
// Architecture:
//   Event → Rule (Transition Validator) → State → Risk → Action
//
// Four layers:
//   1. State Layer  — What state is the job in?
//   2. Event Layer  — What happened to change state?
//   3. Rule Layer   — Is the transition valid? What risks?
//   4. Action Layer — What needs to be done?
//
// All state changes MUST be driven by Events.
// No UI direct state mutation. No Rule direct state mutation.
// ============================================================

// ============================================================
// STATE LAYER
// ============================================================

/** Job derived state — computed from application distribution */
export type JobState =
  | "sourcing"      // No candidates in pipeline
  | "screening"     // Candidates in hr_screen / business_screen
  | "interviewing"  // Candidates in interview stages
  | "offering"      // Candidates in offer_risk / pre_onboarding
  | "fulfilled"     // hired >= headcount
  | "closed";       // Job status = closed

export const JOB_STATE_LABELS: Record<JobState, string> = {
  sourcing:     "渠道寻源",
  screening:    "筛选评估",
  interviewing: "面试中",
  offering:     "Offer阶段",
  fulfilled:    "已完成",
  closed:       "已关闭",
};

// ============================================================
// EVENT LAYER
// ============================================================

/**
 * Job-level events that drive state transitions.
 * Every state change must be triggered by one of these events.
 */
export type JobEvent =
  | "job_created"           // Job was created → sourcing
  | "candidate_assigned"    // Candidate added to job → sourcing→screening
  | "interview_completed"   // Interview finished → screening→interviewing
  | "feedback_submitted"    // Feedback submitted (quality check)
  | "rule_triggered"        // Rule Engine detected a condition
  | "action_created"        // Action item was created
  | "state_changed";        // Explicit state transition (derived from above events)

export const JOB_EVENT_LABELS: Record<JobEvent, string> = {
  job_created:          "岗位创建",
  candidate_assigned:   "候选人分配",
  interview_completed:  "面试完成",
  feedback_submitted:   "反馈提交",
  rule_triggered:       "规则触发",
  action_created:       "行动项创建",
  state_changed:        "状态变更",
};

/**
 * Event summary for list view display.
 * Shows the most recent meaningful events affecting this job.
 */
export interface JobEventSummary {
  /** Most recent event type */
  latestEvent: JobEvent;
  /** Human-readable event description */
  latestEventLabel: string;
  /** When the event occurred (ISO string) */
  latestEventAt: string | null;
  /** Total event count for this job */
  totalEvents: number;
  /** Recent event history (last 3) */
  recentEvents: Array<{ type: JobEvent; label: string; at: string | null }>;
}

// ============================================================
// RULE LAYER — State Transition Validator
// ============================================================

/**
 * Rule Engine is NOT a judgment module.
 * It is a State Transition Validator.
 *
 * Responsibilities:
 *   1. Is this state transition allowed?
 *   2. Should this trigger an Action?
 *   3. Does this produce a Risk signal?
 */

export type RiskType =
  | "supply_shortage"     // 供给不足
  | "feedback_delay"       // 业务反馈延迟
  | "interview_stuck"      // 面试卡点
  | "offer_risk"           // Offer风险
  | "pipeline_healthy";    // 流程健康

export const RISK_LABELS: Record<RiskType, { label: string; color: string; description: string }> = {
  supply_shortage:   { label: "供给不足", color: "danger",  description: "候选人供给不足，建议拓展招聘渠道或调整画像" },
  feedback_delay:    { label: "反馈延迟", color: "warning", description: "业务反馈处理超时，建议催办业务负责人" },
  interview_stuck:   { label: "面试卡点", color: "warning", description: "候选人在面试阶段停留过久，建议检查面试安排" },
  offer_risk:        { label: "Offer风险", color: "danger",  description: "Offer阶段存在流失风险，建议加速决策" },
  pipeline_healthy:  { label: "流程健康", color: "success", description: "当前招聘流程正常推进中" },
};

export interface RuleValidationResult {
  /** Is this transition allowed? */
  allowed: boolean;
  /** Target state after transition */
  targetState: JobState;
  /** Risk derived from this transition */
  riskType: RiskType;
  /** Risk label for UI */
  riskLabel: string;
  /** Risk color for UI */
  riskColor: string;
  /** Human-readable risk explanation (which rule triggered this) */
  riskExplanation: string;
  /** Should this trigger an Action? */
  shouldCreateAction: boolean;
  /** Action suggestion if shouldCreateAction */
  actionSuggestion: string | null;
  /** Which rule ID triggered this */
  ruleId: string;
}

// ============================================================
// ACTION LAYER
// ============================================================

export interface JobStateSnapshot {
  jobId: string;
  currentState: JobState;
  currentStateLabel: string;
  riskType: RiskType;
  riskLabel: string;
  riskColor: string;
  riskExplanation: string;
  ruleId: string;
  eventSummary: JobEventSummary;
  openActions: number;
  /** Is the job currently bottlenecked? */
  isBottleneck: boolean;
  /** Bottleneck reason (from Rule Engine) */
  bottleneckReason: string | null;
}
