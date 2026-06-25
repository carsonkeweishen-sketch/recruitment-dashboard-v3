// Phase 6: Interviewer Quality Assessment (Feedback-based, no ranking/羞辱)
import { getFeedbacksByInterviewer } from "@/server/repositories/interview/interview-feedback-repository";
import { getInterviews } from "@/server/repositories/interview/interview-repository";
import { calculateFeedbackQuality } from "@/server/services/interview/interview-quality-service";
import type { ScopeWhere } from "@/server/permissions/types";

export async function getInterviewerQualitySummary(interviewerId: string, scope: ScopeWhere) {
  const [feedbacks, interviews] = await Promise.all([
    getFeedbacksByInterviewer(interviewerId),
    getInterviews({ scope, interviewerId }),
  ]);

  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const totalCompleted = completedInterviews.length;
  const totalFeedbacks = feedbacks.length;

  // Calculate quality scores for each feedback
  let totalQualityScore = 0;
  let evidenceSufficientCount = 0;
  let riskSignalCount = 0;
  let onTimeCount = 0;

  for (const fb of feedbacks) {
    const interview = interviews.find((i) => i.id === fb.interviewId);
    if (!interview) continue;

    const quality = calculateFeedbackQuality(fb, interview);
    totalQualityScore += quality.feedbackQualityScore;
    if (quality.evidenceSufficiency >= 15) evidenceSufficientCount++;
    if (quality.suggestions.some((s) => s.includes("风险") || s.includes("偏差"))) riskSignalCount++;
    if (quality.timeliness >= 10) onTimeCount++;
  }

  const avgQuality = totalFeedbacks > 0 ? Math.round(totalQualityScore / totalFeedbacks) : 0;
  const completionRate = totalCompleted > 0 ? totalFeedbacks / totalCompleted : 0;

  // Generate suggestions (must be constructive, not judgmental)
  const suggestions: string[] = [];
  if (avgQuality < 70) {
    suggestions.push("反馈质量有提升空间，建议加强项目细节和具体数据的记录");
  }
  if (completionRate < 0.8) {
    suggestions.push(`反馈完成率 ${(completionRate * 100).toFixed(0)}%，建议面试后 24 小时内提交反馈`);
  }
  if (evidenceSufficientCount < totalFeedbacks * 0.6) {
    suggestions.push("部分反馈证据不够充分，建议使用具体案例和量化数据");
  }
  if (onTimeCount < totalFeedbacks * 0.5) {
    suggestions.push("反馈及时性可提升，延迟反馈可能影响候选人体验");
  }

  return {
    interviewerId,
    feedbackCount: totalFeedbacks,
    completedInterviewCount: totalCompleted,
    feedbackCompletionRate: completionRate,
    feedbackOnTimeRate: totalFeedbacks > 0 ? onTimeCount / totalFeedbacks : 0,
    avgFeedbackQualityScore: avgQuality,
    evidenceSufficiencyRate: totalFeedbacks > 0 ? evidenceSufficientCount / totalFeedbacks : 0,
    riskSignalCount,
    suggestions,
    scope: scope.scope,
  };
}
