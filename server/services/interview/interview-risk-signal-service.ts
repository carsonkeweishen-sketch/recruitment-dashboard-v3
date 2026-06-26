// Phase 6: Interview Risk Signal Detection
// Rule-based detection (no AI). Identifies potential interview quality issues.
//
// Risk signals detected:
// 1. communication >= 4 AND role_competency <= 3
// 2. HIRE/STRONG_HIRE with short evidence
// 3. Multiple high scores but no project/data/result in evidence
// 4. Vague language in evidence ("感觉不错", "还可以")
// 5. High business_understanding score but no business case in evidence
// 6. High problem_solving score but no problem-solving process in evidence
// 7. STRONG recommendation but riskNotes is empty
//
// Boundaries:
// - Only flags risks, never auto-advances stages
// - Never outputs "面霸" or derogatory labels
// - All signals are suggestions, not decisions

export interface RiskSignalInput {
  scores: Record<string, number>;
  overallRecommendation: string;
  evidenceText: string;
  riskNotes?: string;
}

export interface RiskSignal {
  riskType: string;
  riskLevel: "low" | "medium" | "high";
  reason: string;
  evidenceRefs: string[];
  suggestedFollowUpQuestions: string[];
}

const STRONG_EVIDENCE_KEYWORDS = [
  "项目",
  "数据",
  "案例",
  "结果",
  "指标",
  "增长",
  "降低",
  "提升",
  "%",
  "万",
  "亿",
];

const VAGUE_PATTERNS = [
  "感觉不错",
  "还可以",
  "沟通挺好",
  "不错",
  "挺好的",
  "还行",
  "比较合适",
  "整体不错",
  "印象不错",
];

export function detectInterviewRiskSignals(
  input: RiskSignalInput
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const evidenceLower = (input.evidenceText || "").toLowerCase();
  const evidenceLength = (input.evidenceText || "").length;
  const isHighRecommendation = ["STRONG_HIRE", "HIRE"].includes(
    input.overallRecommendation
  );

  // 1. communication >= 4 AND role_competency <= 3
  // "表达强但能力证据弱" — 高面试技巧型候选人风险
  if (
    (input.scores.communication ?? 0) >= 4 &&
    (input.scores.role_competency ?? 5) <= 3
  ) {
    signals.push({
      riskType: "HIGH_COMMUNICATION_LOW_COMPETENCY",
      riskLevel: "medium",
      reason:
        "沟通表达评分较高但岗位胜任力评分偏低，存在表达强但能力证据不足的可能性",
      evidenceRefs: ["communication", "role_competency"],
      suggestedFollowUpQuestions: [
        "请补充该候选人在岗位核心能力方面的具体表现案例",
        "该候选人过往项目中是否有可量化的业绩数据？",
      ],
    });
  }

  // 2. HIRE/STRONG_HIRE with short evidence
  if (isHighRecommendation && evidenceLength < 100) {
    signals.push({
      riskType: "HIGH_RECOMMENDATION_WEAK_EVIDENCE",
      riskLevel: "high",
      reason:
        `推荐结论为${input.overallRecommendation}但面试证据不足（${evidenceLength}字），建议补充具体案例和数据`,
      evidenceRefs: ["evidenceText", "overallRecommendation"],
      suggestedFollowUpQuestions: [
        "请补充至少一个候选人在项目中表现的具体案例",
        "该候选人是否有可量化的业绩数据支撑推荐结论？",
      ],
    });
  }

  // 3. Multiple high scores (avg >= 4) but no project/data/result keywords
  const scores = Object.values(input.scores).filter((s) => typeof s === "number");
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const hasStrongKeywords = STRONG_EVIDENCE_KEYWORDS.some((kw) =>
    evidenceLower.includes(kw)
  );

  if (avgScore >= 4 && !hasStrongKeywords) {
    signals.push({
      riskType: "HIGH_SCORES_NO_EVIDENCE_KEYWORDS",
      riskLevel: "medium",
      reason:
        "多个维度评分较高，但面试证据中未发现项目、数据、结果等关键词，建议补充具体事实",
      evidenceRefs: ["scores", "evidenceText"],
      suggestedFollowUpQuestions: [
        "面试证据中请补充具体项目名称、量化结果或业务案例",
        "该候选人在哪些具体场景中展现了这些能力？",
      ],
    });
  }

  // 4. Vague language in evidence
  const vagueCount = VAGUE_PATTERNS.filter((p) => evidenceLower.includes(p)).length;
  if (vagueCount >= 2) {
    signals.push({
      riskType: "VAGUE_EVIDENCE_LANGUAGE",
      riskLevel: "medium",
      reason:
        `面试证据中包含${vagueCount}处模糊表达（如"感觉不错"、"还可以"），建议使用具体行为描述`,
      evidenceRefs: ["evidenceText"],
      suggestedFollowUpQuestions: [
        "请用 STAR 方法（情境-任务-行动-结果）重新描述关键面试场景",
        "候选人的回答中有哪些具体数据或事实可以佐证？",
      ],
    });
  }

  // 5. High business_understanding score but no business case in evidence
  if (
    (input.scores.business_understanding ?? 0) >= 4 &&
    !evidenceLower.includes("业务") &&
    !evidenceLower.includes("案例") &&
    !evidenceLower.includes("行业")
  ) {
    signals.push({
      riskType: "HIGH_BUSINESS_SCORE_NO_CASE",
      riskLevel: "low",
      reason:
        "业务理解评分较高，但证据中未提及业务案例或行业分析，建议补充业务相关考察内容",
      evidenceRefs: ["business_understanding", "evidenceText"],
      suggestedFollowUpQuestions: [
        "候选人对所在行业/赛道的理解是否有具体案例支撑？",
      ],
    });
  }

  // 6. High problem_solving score but no process description
  if (
    (input.scores.problem_solving ?? 0) >= 4 &&
    !evidenceLower.includes("问题") &&
    !evidenceLower.includes("解决") &&
    !evidenceLower.includes("方案") &&
    !evidenceLower.includes("分析")
  ) {
    signals.push({
      riskType: "HIGH_PROBLEM_SOLVING_NO_PROCESS",
      riskLevel: "low",
      reason:
        "问题解决能力评分较高，但证据中未体现具体问题解决过程，建议补充分析思路和解决方案",
      evidenceRefs: ["problem_solving", "evidenceText"],
      suggestedFollowUpQuestions: [
        "候选人是如何分析并解决该问题的？具体步骤是什么？",
      ],
    });
  }

  // 7. STRONG recommendation but riskNotes is empty
  if (
    ["STRONG_HIRE", "STRONG_NO_HIRE"].includes(input.overallRecommendation) &&
    (!input.riskNotes || input.riskNotes.trim().length === 0)
  ) {
    signals.push({
      riskType: "STRONG_RECOMMENDATION_NO_RISK_NOTES",
      riskLevel: "medium",
      reason:
        `推荐结论为${input.overallRecommendation}但未记录任何风险点，建议补充待验证项或潜在顾虑`,
      evidenceRefs: ["overallRecommendation", "riskNotes"],
      suggestedFollowUpQuestions: [
        "该候选人有何待验证的能力或经验？",
        "入职后可能面临哪些挑战？",
      ],
    });
  }

  return signals;
}
