// Phase 6: Job Interview Signals Service
// Aggregates interview-related metrics for a specific job.

import type { Role } from "@/server/permissions/types";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import { getJobByIdWithScope } from "@/server/repositories/job-repository";
import { getFeedbacksByJobId } from "@/server/repositories/interview/interview-feedback-repository";
import { listInterviews } from "@/server/repositories/interview/interview-repository";

export async function getJobInterviewSignals(
  jobId: string,
  role: Role,
  userId: string,
  departmentId: string | undefined
) {
  requirePermission({ role, userId, departmentId }, "interviews", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "interviews");

  // Verify job access
  const job = await getJobByIdWithScope(jobId, scope);
  if (!job) {
    return null;
  }

  // Get interviews for this job (reuse scope)
  const jobScope = buildScopeWhere({ role, userId, departmentId }, "interviews");
  const interviews = await listInterviews(jobScope);
  const jobInterviews = interviews.filter(
    (i) => i.application.job.id === jobId
  );

  // Get feedbacks for this job
  const feedbacks = await getFeedbacksByJobId(jobId, jobScope);

  // Funnel
  const scheduled = jobInterviews.filter((i) => i.status === "scheduled").length;
  const completed = jobInterviews.filter((i) => i.status === "completed").length;
  const withFeedback = jobInterviews.filter(
    (i) => i.feedbacks.length > 0
  ).length;
  const pending = completed - withFeedback;

  // Quality
  const qualityScores = feedbacks
    .map((f) => f.feedbackQualityScore)
    .filter((s): s is number => s !== null && s !== undefined);
  const avgQuality =
    qualityScores.length > 0
      ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
      : 0;

  // Risk signals from feedbacks
  const riskSignals = feedbacks
    .filter((f) => f.riskSignals)
    .flatMap((f) => {
      const signals = f.riskSignals as Array<{
        riskType: string;
        riskLevel: string;
        reason: string;
      }>;
      const candidateName =
        f.interview?.application?.candidate?.name ?? "Unknown";
      return (signals || []).map((s) => ({
        ...s,
        feedbackId: f.id,
        candidateName,
      }));
    });

  // Avg delay hours
  const delays = feedbacks
    .filter((f) => f.submittedAt && f.interview?.scheduledAt)
    .map((f) => {
      const submitted = new Date(f.submittedAt!).getTime();
      const scheduled = new Date(f.interview!.scheduledAt!).getTime();
      return (submitted - scheduled) / (1000 * 60 * 60);
    });
  const avgDelayHours =
    delays.length > 0
      ? Math.round((delays.reduce((a, b) => a + b, 0) / delays.length) * 10) / 10
      : 0;

  return {
    job: {
      id: job.id,
      title: job.title,
      jobCode: job.jobCode,
    },
    interviewFunnel: {
      scheduledCount: scheduled,
      completedCount: completed,
      feedbackSubmittedCount: withFeedback,
      feedbackPendingCount: pending,
      firstInterviewPassRate: 0, // Requires cross-round analysis — future Phase
      secondInterviewPassRate: 0,
      finalInterviewPassRate: 0,
      avgFeedbackDelayHours: avgDelayHours,
    },
    feedbackQualitySummary: {
      totalFeedbacks: feedbacks.length,
      avgQualityScore: avgQuality,
      qualityDistribution: {
        excellent: qualityScores.filter((s) => s >= 85).length,
        good: qualityScores.filter((s) => s >= 70 && s < 85).length,
        needs_improvement: qualityScores.filter((s) => s >= 50 && s < 70).length,
        insufficient: qualityScores.filter((s) => s < 50).length,
      },
    },
    riskSignals: riskSignals.slice(0, 10), // Top 10
    interviewerQualitySummary: {
      totalInterviewers: new Set(feedbacks.map((f) => f.interviewerId)).size,
      avgQualityScore: avgQuality,
    },
  };
}
