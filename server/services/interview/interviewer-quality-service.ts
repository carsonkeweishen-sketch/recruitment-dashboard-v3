// Phase 6: Interviewer Quality Service
// Evaluates interviewer feedback quality — NOT the interviewer as a person.
// No ranking, no "bad interviewer" labels.

import type { Role } from "@/server/permissions/types";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import { guardDetailScope } from "@/server/permissions/scope-guards";
import { getInterviewerFeedbackStats } from "@/server/repositories/interview/interview-feedback-repository";

export async function getInterviewerQualitySummary(
  interviewerId: string,
  role: Role,
  userId: string,
  departmentId: string | undefined
) {
  requirePermission({ role, userId, departmentId }, "interviews", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "interviews");

  // interviewer can only see their own quality summary
  if (role === "interviewer" && userId !== interviewerId) {
    return {
      accessible: false,
      reason: "interviewer can only view their own quality summary",
    };
  }

  // business_owner and recruiter: limited access
  if (role === "business_owner" || role === "recruiter") {
    return {
      accessible: false,
      reason: `${role} does not have access to interviewer quality summaries`,
    };
  }

  guardDetailScope(scope);

  const stats = await getInterviewerFeedbackStats(interviewerId);

  // Generate constructive suggestions based on data
  const suggestions: string[] = [];
  if (stats.evidenceSufficiencyRate < 60) {
    suggestions.push(
      "反馈证据充分度偏低，建议加强项目细节追问，引导候选人用 STAR 方法回答"
    );
  }
  if (stats.riskNotesCoverageRate < 50) {
    suggestions.push(
      "风险点记录覆盖不足，建议在每次反馈中记录待验证项或潜在顾虑"
    );
  }
  if (stats.onTimeRate < 80) {
    suggestions.push(
      "反馈及时性有提升空间，建议在面试结束后 24 小时内完成反馈提交"
    );
  }
  if (stats.avgQualityScore >= 80) {
    suggestions.push(
      "反馈质量整体较好，结构化程度高，继续保持"
    );
  }

  return {
    accessible: true,
    interviewerId,
    scope: scope.scope,
    feedbackCount: stats.total,
    onTimeRate: stats.onTimeRate,
    avgFeedbackQualityScore: stats.avgQualityScore,
    evidenceSufficiencyRate: stats.evidenceSufficiencyRate,
    riskNotesCoverageRate: stats.riskNotesCoverageRate,
    suggestions,
  };
}
