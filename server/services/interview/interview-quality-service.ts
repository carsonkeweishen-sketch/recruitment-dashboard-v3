// Phase 6: Interview Feedback Quality Scoring
// Rule-based engine (no AI). 6 metrics, 0-100 total score.
//
// Scoring dimensions:
// - dimensionCompleteness (20): all 6 dimensions scored
// - evidenceSufficiency (25): specific project/data/result evidence
// - scoreEvidenceConsistency (20): high scores backed by evidence
// - recommendationClarity (15): clear recommendation
// - riskAwareness (10): risk notes present
// - timeliness (10): submitted within 24h

export interface QualityInput {
  scores: Record<string, number>;
  overallRecommendation: string;
  evidenceText: string;
  riskNotes?: string;
  interviewScheduledAt?: string;
}

export interface QualityResult {
  score: number;
  level: "excellent" | "good" | "needs_improvement" | "insufficient";
  breakdown: {
    dimensionCompleteness: number;
    evidenceSufficiency: number;
    scoreEvidenceConsistency: number;
    recommendationClarity: number;
    riskAwareness: number;
    timeliness: number;
  };
  notes: string[];
}

const REQUIRED_DIMENSIONS = [
  "role_competency",
  "business_understanding",
  "problem_solving",
  "communication",
  "ownership_collaboration",
  "motivation_stability",
];

// Weak evidence patterns — phrases that suggest insufficient evidence
const WEAK_EVIDENCE_PATTERNS = [
  "感觉不错",
  "还可以",
  "沟通挺好",
  "不错",
  "挺好的",
  "还行",
  "比较合适",
  "整体不错",
  "印象不错",
  "挺好的候选人",
  "沟通能力好",
  "表现不错",
  "面试感觉",
];

// Strong evidence patterns — phrases that suggest concrete evidence
const STRONG_EVIDENCE_PATTERNS = [
  "项目",
  "数据",
  "案例",
  "结果",
  "指标",
  "增长",
  "降低",
  "提升",
  "负责",
  "主导",
  "完成",
  "达成",
  "%",
  "万",
  "亿",
  "团队",
  "流程",
  "方案",
  "策略",
  "执行",
];

export function calculateFeedbackQuality(input: QualityInput): QualityResult {
  const notes: string[] = [];

  // 1. Dimension Completeness (20 points)
  const scoredDimensions = REQUIRED_DIMENSIONS.filter(
    (d) => typeof input.scores[d] === "number" && input.scores[d] >= 1 && input.scores[d] <= 5
  );
  const dimensionCompleteness = Math.round(
    (scoredDimensions.length / REQUIRED_DIMENSIONS.length) * 20
  );
  if (dimensionCompleteness < 20) {
    notes.push(
      `Missing ${REQUIRED_DIMENSIONS.length - scoredDimensions.length} scoring dimension(s)`
    );
  }

  // 2. Evidence Sufficiency (25 points)
  let evidenceSufficiency = 0;
  const evidenceLength = (input.evidenceText || "").length;

  // Length-based scoring (max 10)
  if (evidenceLength >= 200) evidenceSufficiency += 10;
  else if (evidenceLength >= 100) evidenceSufficiency += 7;
  else if (evidenceLength >= 50) evidenceSufficiency += 4;
  else if (evidenceLength >= 10) evidenceSufficiency += 2;

  // Quality-based scoring (max 15)
  const evidenceLower = (input.evidenceText || "").toLowerCase();

  // Check for weak evidence patterns (penalty)
  const weakPatternCount = WEAK_EVIDENCE_PATTERNS.filter((p) =>
    evidenceLower.includes(p)
  ).length;
  if (weakPatternCount > 0) {
    evidenceSufficiency += Math.max(0, 5 - weakPatternCount * 2);
    if (weakPatternCount >= 2) {
      notes.push("Evidence contains vague language (e.g., '感觉不错', '还可以')");
    }
  } else {
    evidenceSufficiency += 5;
  }

  // Check for strong evidence patterns (bonus)
  const strongPatternCount = STRONG_EVIDENCE_PATTERNS.filter((p) =>
    evidenceLower.includes(p)
  ).length;
  if (strongPatternCount >= 5) evidenceSufficiency += 10;
  else if (strongPatternCount >= 3) evidenceSufficiency += 7;
  else if (strongPatternCount >= 1) evidenceSufficiency += 4;

  evidenceSufficiency = Math.min(25, evidenceSufficiency);
  if (evidenceSufficiency < 15) {
    notes.push("Evidence lacks concrete project, data, or result details");
  }

  // 3. Score-Evidence Consistency (20 points)
  let scoreEvidenceConsistency = 20;
  const avgScore =
    Object.values(input.scores).reduce((a, b) => a + b, 0) /
    Object.keys(input.scores).length;

  // High scores with short evidence = inconsistency
  if (avgScore >= 4 && evidenceLength < 100) {
    scoreEvidenceConsistency -= 10;
    notes.push("High scores with insufficient evidence — potential score inflation");
  }
  if (avgScore >= 4.5 && evidenceLength < 50) {
    scoreEvidenceConsistency -= 15;
  }

  // Low scores with clear reasons = good consistency
  if (avgScore <= 2.5 && evidenceLength >= 100) {
    scoreEvidenceConsistency = Math.min(20, scoreEvidenceConsistency + 5);
  }

  scoreEvidenceConsistency = Math.max(0, scoreEvidenceConsistency);

  // 4. Recommendation Clarity (15 points)
  let recommendationClarity = 0;
  const validRecommendations = [
    "STRONG_HIRE",
    "HIRE",
    "HOLD",
    "NO_HIRE",
    "STRONG_NO_HIRE",
  ];
  if (validRecommendations.includes(input.overallRecommendation)) {
    recommendationClarity = 15;
  } else {
    recommendationClarity = 5;
    notes.push("Recommendation is unclear or not using standard format");
  }

  // 5. Risk Awareness (10 points)
  let riskAwareness = 0;
  if (input.riskNotes && input.riskNotes.trim().length > 0) {
    const riskLength = input.riskNotes.trim().length;
    if (riskLength >= 30) riskAwareness = 10;
    else if (riskLength >= 10) riskAwareness = 6;
    else riskAwareness = 3;
  } else {
    notes.push("No risk notes provided — potential blind spot");
  }

  // 6. Timeliness (10 points)
  let timeliness = 10;
  if (input.interviewScheduledAt) {
    const scheduledTime = new Date(input.interviewScheduledAt).getTime();
    const now = Date.now();
    const hoursSinceScheduled = (now - scheduledTime) / (1000 * 60 * 60);
    if (hoursSinceScheduled > 72) timeliness = 0;
    else if (hoursSinceScheduled > 48) timeliness = 3;
    else if (hoursSinceScheduled > 24) timeliness = 7;
    else timeliness = 10;
  }
  // Note: timeliness uses interview scheduledAt as reference.
  // In production this should use interview.completedAt when available.

  const totalScore =
    dimensionCompleteness +
    evidenceSufficiency +
    scoreEvidenceConsistency +
    recommendationClarity +
    riskAwareness +
    timeliness;

  let level: QualityResult["level"];
  if (totalScore >= 85) level = "excellent";
  else if (totalScore >= 70) level = "good";
  else if (totalScore >= 50) level = "needs_improvement";
  else level = "insufficient";

  return {
    score: Math.max(0, Math.min(100, totalScore)),
    level,
    breakdown: {
      dimensionCompleteness,
      evidenceSufficiency,
      scoreEvidenceConsistency,
      recommendationClarity,
      riskAwareness,
      timeliness,
    },
    notes,
  };
}
