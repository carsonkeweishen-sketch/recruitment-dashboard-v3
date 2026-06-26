// Phase 7.4A: Action Center types

export type ActionCategory =
  | "feedback_followup"
  | "interview_followup"
  | "candidate_risk_followup"
  | "job_calibration"
  | "business_feedback"
  | "offer_risk"
  | "process_blocker"
  | "data_quality"
  | "manual";

export type ActionPriority = "low" | "medium" | "high" | "urgent";

export type ActionStatus = "open" | "in_progress" | "blocked" | "resolved" | "dismissed";

export type ActionSourceType =
  | "manual"
  | "interview_feedback"
  | "interview_risk_signal"
  | "feedback_quality"
  | "business_feedback"
  | "profile_calibration"
  | "job_pipeline"
  | "candidate_application"
  | "offer_risk"
  | "system_rule"
  | "future_ai";

export interface ActionItem {
  id: string;
  title: string;
  description?: string | null;
  category: ActionCategory;
  priority: ActionPriority;
  status: ActionStatus;
  owner?: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  job?: { id: string; title: string; jobCode: string } | null;
  candidate?: { id: string; name: string } | null;
  application?: {
    id: string;
    stage: string;
    candidate?: { id: string; name: string } | null;
    job?: { id: string; title: string } | null;
  } | null;
  interview?: {
    id: string;
    round: string;
    interviewer?: { id: string; name: string } | null;
  } | null;
  sourceType: ActionSourceType;
  sourceRefId?: string | null;
  sourceSummary?: string | null;
  dueAt?: string | null;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  dismissedReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActionMetrics {
  openCount: number;
  overdueCount: number;
  highPriorityCount: number;
  dueTodayCount: number;
  avgResolutionHours: number;
  onTimeResolutionRate: number;
}
