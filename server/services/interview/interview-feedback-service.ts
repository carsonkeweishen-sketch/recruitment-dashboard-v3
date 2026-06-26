// Phase 6: Interview Feedback Service
// Structured feedback submission with quality scoring and risk detection.
// Scope guardrail enforced: interviewer can only submit their own feedback.

import type { Role } from "@/server/permissions/types";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import {
  guardDetailScope,
  guardWriteScope,
  guardInterviewerWriteScope,
} from "@/server/permissions/scope-guards";
import {
  submitFeedback as submitFeedbackRepo,
  checkDuplicateFeedback,
  getFeedbackByIdWithScope,
} from "@/server/repositories/interview/interview-feedback-repository";
import { getInterviewByIdWithScope } from "@/server/repositories/interview/interview-repository";
import { calculateFeedbackQuality } from "./interview-quality-service";
import { detectInterviewRiskSignals } from "./interview-risk-signal-service";
import type { CreateFeedbackInput } from "@/server/repositories/interview/interview-feedback-repository";

export async function submitInterviewFeedback(
  role: Role,
  userId: string,
  departmentId: string | undefined,
  input: Omit<CreateFeedbackInput, "interviewerId">
) {
  requirePermission({ role, userId, departmentId }, "interviews", "create");
  const scope = buildScopeWhere({ role, userId, departmentId }, "interviews");
  guardWriteScope(scope);

  // Validate the interview exists and user has access
  const interview = await getInterviewByIdWithScope(input.interviewId, scope);
  if (!interview) {
    throw new InterviewFeedbackError("Interview not found or access denied", 404);
  }

  // interviewer can only submit feedback for their own interviews
  guardInterviewerWriteScope(scope, interview.interviewerId);

  // Check for duplicate
  const isDuplicate = await checkDuplicateFeedback(input.interviewId);
  if (isDuplicate) {
    throw new InterviewFeedbackError("Feedback already submitted for this interview", 409);
  }

  // Validate required fields
  if (!input.scores || Object.keys(input.scores).length < 6) {
    throw new InterviewFeedbackError(
      "All 6 scoring dimensions are required",
      400
    );
  }

  const requiredDimensions = [
    "role_competency",
    "business_understanding",
    "problem_solving",
    "communication",
    "ownership_collaboration",
    "motivation_stability",
  ];
  for (const dim of requiredDimensions) {
    if (!(dim in input.scores) || typeof input.scores[dim] !== "number") {
      throw new InterviewFeedbackError(`Missing or invalid score for: ${dim}`, 400);
    }
    if (input.scores[dim] < 1 || input.scores[dim] > 5) {
      throw new InterviewFeedbackError(`Score out of range (1-5) for: ${dim}`, 400);
    }
  }

  if (!input.overallRecommendation) {
    throw new InterviewFeedbackError("overallRecommendation is required", 400);
  }

  if (!input.evidenceText || input.evidenceText.trim().length < 10) {
    throw new InterviewFeedbackError(
      "evidenceText is required (minimum 10 characters)",
      400
    );
  }

  // Calculate quality score and risk signals (rule-based, no AI)
  const qualityResult = calculateFeedbackQuality({
    scores: input.scores,
    overallRecommendation: input.overallRecommendation,
    evidenceText: input.evidenceText,
    riskNotes: input.riskNotes,
    interviewScheduledAt: interview.scheduledAt?.toISOString(),
  });

  const riskSignals = detectInterviewRiskSignals({
    scores: input.scores,
    overallRecommendation: input.overallRecommendation,
    evidenceText: input.evidenceText,
    riskNotes: input.riskNotes,
  });

  const feedback = await submitFeedbackRepo(
    {
      ...input,
      interviewerId: userId,
    },
    qualityResult.score,
    qualityResult.level,
    riskSignals
  );

  // Write ActivityLog
  const { logInterviewFeedbackSubmitted } = await import(
    "@/server/services/business-feedback/activity-log-helper"
  );
  await logInterviewFeedbackSubmitted({
    actorId: userId,
    feedbackId: feedback.id,
    interviewId: input.interviewId,
    applicationId: interview.application.id,
    candidateId: interview.application.candidate.id,
    jobId: interview.application.job.id,
    overallRecommendation: input.overallRecommendation,
    feedbackQualityScore: qualityResult.score,
    riskSignals,
  });

  return {
    feedback,
    quality: qualityResult,
    riskSignals,
  };
}

export async function getInterviewFeedback(
  feedbackId: string,
  role: Role,
  userId: string,
  departmentId: string | undefined
) {
  requirePermission({ role, userId, departmentId }, "interviews", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "interviews");
  guardDetailScope(scope);

  return getFeedbackByIdWithScope(feedbackId, scope);
}

export class InterviewFeedbackError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "InterviewFeedbackError";
    this.statusCode = statusCode;
  }
}
