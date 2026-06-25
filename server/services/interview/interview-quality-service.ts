// Phase 6: Interview Feedback Quality Scoring Engine (Rule-based, no AI)
import type { Interview, InterviewFeedback } from "@prisma/client";

interface QualityResult {
  feedbackQualityScore: number;
  qualityLevel: "excellent" | "good" | "needs_improvement" | "insufficient";
  dimensionCompleteness: number;   // 20
  evidenceSufficiency: number;     // 25
  scoreEvidenceConsistency: number; // 20
  recommendationClarity: number;   // 15
  riskAwareness: number;           // 10
  timeliness: number;              // 10
  suggestions: string[];
}

const CORE_DIMENSIONS = [
  "role_competency",
  "business_understanding",
  "problem_solving",
  "communication",
  "ownership_collaboration",
  "motivation_stability",
];

const WEAK_EVIDENCE_PATTERNS = [
  /感觉不错/,
  /沟通挺好/,
  /还可以/,
  /差不多/,
  /一般般/,
  /还行/,
  /OK/i,
  /不错/,
  /挺好/,
  /没什么问题/,
  /整体可以/,
];

const STRONG_EVIDENCE_PATTERNS = [
  /项目/,
  /数据/,
  /结果/,
  /案例/,
  /具体/,
  /负责/,
  /主导/,
  /指标/,
  /业绩/,
  /团队/,
  /方案/,
  /流程/,
];

export function calculateFeedbackQuality(
  feedback: Pick<InterviewFeedback, "scores" | "evidence" | "overallRecommendation" | "concerns" | "suggestedFollowUps" | "submittedAt">,
  interview: Pick<Interview, "completedAt">
): QualityResult {
  const suggestions: string[] = [];
  const scores = (feedback.scores as Record<string, number>) || {};

  // 1. Dimension completeness (20 pts)
  let dimensionCompleteness = 0;
  const filledDimensions = CORE_DIMENSIONS.filter((d) => typeof scores[d] === "number" && scores[d] >= 1 && scores[d] <= 5);
  dimensionCompleteness = Math.round((filledDimensions.length / CORE_DIMENSIONS.length) * 20);
  if (filledDimensions.length < CORE_DIMENSIONS.length) {
    suggestions.push(`缺少 ${CORE_DIMENSIONS.length - filledDimensions.length} 个维度的评分，请补充完整`);
  }

  // 2. Evidence sufficiency (25 pts)
  let evidenceSufficiency = 0;
  const evidence = (feedback.evidence || "").trim();
  if (evidence.length >= 20) evidenceSufficiency += 10;
  else if (evidence.length > 0) evidenceSufficiency += 5;
  else suggestions.push("缺少证据说明，请补充候选人具体表现");

  // Check for strong evidence patterns
  const strongMatches = STRONG_EVIDENCE_PATTERNS.filter((p) => p.test(evidence));
  evidenceSufficiency += Math.min(strongMatches.length * 3, 10);

  // Penalize weak evidence patterns
  const weakMatches = WEAK_EVIDENCE_PATTERNS.filter((p) => p.test(evidence));
  evidenceSufficiency -= Math.min(weakMatches.length * 2, 5);

  evidenceSufficiency = Math.max(0, Math.min(25, evidenceSufficiency));
  if (weakMatches.length > 1) {
    suggestions.push("证据包含模糊表述（'感觉不错'/'还可以'），建议使用具体项目、数据、案例");
  }

  // 3. Score-evidence consistency (20 pts)
  let scoreEvidenceConsistency = 15; // base
  const avgScore = filledDimensions.length > 0
    ? filledDimensions.reduce((s, d) => s + scores[d], 0) / filledDimensions.length
    : 0;

  if (avgScore >= 4 && evidence.length < 50) {
    scoreEvidenceConsistency -= 10;
    suggestions.push("高分推荐但证据不足，请补充具体能力证据");
  } else if (avgScore >= 4 && strongMatches.length >= 2) {
    scoreEvidenceConsistency += 5;
  }

  if (avgScore <= 2 && evidence.length > 100) {
    scoreEvidenceConsistency -= 5;
    suggestions.push("低分推荐但证据较多，请确认评分是否准确");
  }

  scoreEvidenceConsistency = Math.max(0, Math.min(20, scoreEvidenceConsistency));

  // 4. Recommendation clarity (15 pts)
  let recommendationClarity = 0;
  if (feedback.overallRecommendation) {
    recommendationClarity = 15;
  } else {
    suggestions.push("缺少推荐结论（STRONG_HIRE/HIRE/HOLD/NO_HIRE/STRONG_NO_HIRE）");
  }

  // 5. Risk awareness (10 pts)
  let riskAwareness = 0;
  if (feedback.concerns && feedback.concerns.trim().length > 0) {
    riskAwareness = 10;
  } else if (avgScore >= 4) {
    riskAwareness = 5;
    suggestions.push("高分候选人建议记录风险点或待验证问题");
  }

  // 6. Timeliness (10 pts)
  let timeliness = 0;
  if (feedback.submittedAt && interview.completedAt) {
    const diff = feedback.submittedAt.getTime() - interview.completedAt.getTime();
    if (diff <= 24 * 60 * 60 * 1000) timeliness = 10;
    else if (diff <= 48 * 60 * 60 * 1000) timeliness = 5;
    else suggestions.push("反馈提交延迟超过 48 小时，建议面试后 24 小时内提交");
  }

  const total = dimensionCompleteness + evidenceSufficiency + scoreEvidenceConsistency + recommendationClarity + riskAwareness + timeliness;

  let qualityLevel: QualityResult["qualityLevel"] = "insufficient";
  if (total >= 85) qualityLevel = "excellent";
  else if (total >= 70) qualityLevel = "good";
  else if (total >= 50) qualityLevel = "needs_improvement";

  return {
    feedbackQualityScore: total,
    qualityLevel,
    dimensionCompleteness,
    evidenceSufficiency,
    scoreEvidenceConsistency,
    recommendationClarity,
    riskAwareness,
    timeliness,
    suggestions,
  };
}
