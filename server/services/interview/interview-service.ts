// Phase 6: Interview Service
import type { Role } from "@/server/permissions/types";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import {
  getInterviews,
  getInterviewById,
  getInterviewMetrics,
  getInterviewFunnelByJob,
} from "@/server/repositories/interview/interview-repository";
import {
  submitFeedback,
  getFeedbacksByJob,
} from "@/server/repositories/interview/interview-feedback-repository";
import { calculateFeedbackQuality } from "@/server/services/interview/interview-quality-service";
import { detectInterviewRiskSignals } from "@/server/services/interview/interview-risk-signal-service";
import { getInterviewerQualitySummary } from "@/server/services/interview/interviewer-quality-service";
import type { SubmitFeedbackInput } from "@/server/repositories/interview/interview-feedback-repository";

export async function listInterviews(
  role: Role, userId: string | undefined, departmentId: string | undefined,
  filters: { jobId?: string; applicationId?: string; interviewerId?: string; status?: string }
) {
  const scope = buildScopeWhere({ role, userId, departmentId }, "interviews");
  const [interviews, metrics] = await Promise.all([
    getInterviews({ scope, ...filters }),
    getInterviewMetrics(scope),
  ]);
  return { interviews, metrics, scope: scope.scope };
}

export async function getInterviewDetail(id: string) {
  const interview = await getInterviewById(id);
  if (!interview) return null;

  const feedback = interview.feedbacks[0] || null;
  let qualitySignals = null;
  let riskSignals: ReturnType<typeof detectInterviewRiskSignals> = [];

  if (feedback) {
    qualitySignals = calculateFeedbackQuality(feedback, interview);
    riskSignals = detectInterviewRiskSignals(feedback, interview);
  }

  return {
    interview: {
      id: interview.id,
      round: interview.round,
      status: interview.status,
      scheduledAt: interview.scheduledAt,
      completedAt: interview.completedAt,
      createdAt: interview.createdAt,
    },
    application: interview.application,
    interviewer: interview.interviewer,
    feedback: feedback ? {
      id: feedback.id,
      scores: feedback.scores,
      overallRecommendation: feedback.overallRecommendation,
      evidence: feedback.evidence,
      concerns: feedback.concerns,
      strengths: feedback.strengths,
      suggestedFollowUps: feedback.suggestedFollowUps,
      submittedAt: feedback.submittedAt,
    } : null,
    qualitySignals,
    riskSignals,
  };
}

export async function submitInterviewFeedback(
  role: Role, userId: string, departmentId: string | undefined,
  interviewId: string, input: Omit<SubmitFeedbackInput, "interviewId" | "interviewerId">
) {
  // Only the assigned interviewer can submit (or admin/leader)
  const interview = await getInterviewById(interviewId);
  if (!interview) throw new Error("Interview not found");

  if (role === "interviewer" && interview.interviewerId !== userId) {
    throw new Error("Permission denied: you can only submit feedback for your own interviews");
  }

  if (role === "business_owner" || role === "recruiter" || role === "hrbp") {
    throw new Error("Permission denied: only the assigned interviewer, admin, or leader can submit feedback");
  }

  return submitFeedback({
    interviewId,
    interviewerId: userId,
    ...input,
  });
}

export async function getJobInterviewSignals(
  role: Role, userId: string | undefined, departmentId: string | undefined,
  jobId: string
) {
  const _scope = buildScopeWhere({ role, userId, departmentId }, "interviews");
  const [funnel, feedbacks] = await Promise.all([
    getInterviewFunnelByJob(jobId),
    getFeedbacksByJob(jobId),
  ]);

  // Aggregate quality
  let totalQuality = 0;
  let qualityCount = 0;
  const riskSignals: ReturnType<typeof detectInterviewRiskSignals> = [];

  for (const fb of feedbacks) {
    const interview = await getInterviewById(fb.interviewId);
    if (!interview) continue;
    const q = calculateFeedbackQuality(fb, interview);
    totalQuality += q.feedbackQualityScore;
    qualityCount++;
    riskSignals.push(...detectInterviewRiskSignals(fb, interview));
  }

  return {
    jobId,
    interviewFunnel: funnel,
    feedbackQualitySummary: {
      feedbackCount: qualityCount,
      avgQualityScore: qualityCount > 0 ? Math.round(totalQuality / qualityCount) : 0,
    },
    riskSignals,
    interviewerQualitySummary: {}, // per-job interviewer breakdown TBD
  };
}

export async function getInterviewerQuality(
  role: Role, userId: string | undefined, departmentId: string | undefined,
  interviewerId: string
) {
  // Only admin/leader can view global interviewer quality
  if (role === "business_owner" || role === "interviewer") {
    throw new Error("Permission denied: you cannot view interviewer quality summaries");
  }

  const scope = buildScopeWhere({ role, userId, departmentId }, "interviews");
  return getInterviewerQualitySummary(interviewerId, scope);
}
