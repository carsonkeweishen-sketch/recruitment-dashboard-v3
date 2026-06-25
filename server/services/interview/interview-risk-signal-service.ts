// Phase 6: Interview Performance Deviation Risk Detection (Rule-based, no AI)
import type { Interview, InterviewFeedback } from "@prisma/client";

interface RiskSignal {
  riskType: string;
  riskLevel: "low" | "medium" | "high";
  reason: string;
  evidenceRefs: string[];
  suggestedFollowUpQuestions: string[];
}

const WEAK_EVIDENCE_PATTERNS = [
  /感觉不错/, /沟通挺好/, /还可以/, /差不多/, /一般般/, /还行/, /OK/i,
  /不错/, /挺好/, /没什么问题/, /整体可以/,
];

export function detectInterviewRiskSignals(
  feedback: Pick<InterviewFeedback, "scores" | "evidence" | "overallRecommendation" | "concerns">,
  interview: Pick<Interview, "round">,
  _previousFeedback?: Pick<InterviewFeedback, "scores" | "overallRecommendation"> | null
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const scores = (feedback.scores as Record<string, number>) || {};
  const evidence = (feedback.evidence || "").trim();

  // Rule 1: communication >= 4 but role_competency <= 3
  if ((scores.communication ?? 0) >= 4 && (scores.role_competency ?? 0) <= 3) {
    signals.push({
      riskType: "表达强但证据弱风险",
      riskLevel: "medium",
      reason: `沟通表达评分 ${scores.communication} 分，但岗位胜任力评分 ${scores.role_competency ?? "未评分"} 分。存在表达能力掩盖硬技能不足的风险。`,
      evidenceRefs: ["scores.communication", "scores.role_competency"],
      suggestedFollowUpQuestions: ["请候选人举例说明过往岗位中的具体业务成果", "请追问该岗位所需的核心技能实操经验"],
    });
  }

  // Rule 2: HIRE/STRONG_HIRE but evidence is short
  if (["STRONG_HIRE", "HIRE"].includes(feedback.overallRecommendation ?? "") && evidence.length < 50) {
    signals.push({
      riskType: "能力证据不足风险",
      riskLevel: "medium",
      reason: `推荐结论为 ${feedback.overallRecommendation}，但证据文本仅 ${evidence.length} 字，缺乏充分的项目/数据/案例支撑。`,
      evidenceRefs: ["overallRecommendation", "evidence"],
      suggestedFollowUpQuestions: ["请补充候选人在关键项目中的具体贡献和数据结果", "请提供候选人能力的可验证案例"],
    });
  }

  // Rule 3: Multiple high scores but no strong evidence patterns
  const highScoreCount = Object.values(scores).filter((s) => (s as number) >= 4).length;
  const hasStrongEvidence = /项目|数据|结果|案例|具体|负责|主导|指标/.test(evidence);
  const hasWeakOnly = WEAK_EVIDENCE_PATTERNS.some((p) => p.test(evidence)) && !hasStrongEvidence;

  if (highScoreCount >= 3 && hasWeakOnly) {
    signals.push({
      riskType: "能力证据不足风险",
      riskLevel: "high",
      reason: `${highScoreCount} 个维度评分 >= 4，但证据中仅有模糊表述（"感觉不错"/"还可以"），缺乏具体事实支撑。`,
      evidenceRefs: ["scores", "evidence"],
      suggestedFollowUpQuestions: ["请对每个高分维度提供具体项目案例", "请候选人用 STAR 法则描述过往成就"],
    });
  }

  // Rule 4: High recommendation but no risk notes
  if (["STRONG_HIRE", "HIRE"].includes(feedback.overallRecommendation ?? "") && (!feedback.concerns || feedback.concerns.trim().length === 0)) {
    signals.push({
      riskType: "高分候选人缺少风险记录",
      riskLevel: "low",
      reason: "推荐结论偏高但未记录任何风险点或待验证问题。",
      evidenceRefs: ["overallRecommendation", "concerns"],
      suggestedFollowUpQuestions: ["请确认候选人在动机、稳定性、文化匹配方面是否存在潜在风险"],
    });
  }

  // Rule 5: Cross-round score deviation (if previous feedback available)
  if (_previousFeedback) {
    const prevScores = (_previousFeedback.scores as Record<string, number>) || {};
    for (const dim of Object.keys(scores)) {
      const diff = Math.abs((scores[dim] || 0) - (prevScores[dim] || 0));
      if (diff >= 2) {
        signals.push({
          riskType: "多轮面试评分偏差",
          riskLevel: "medium",
          reason: `${dim} 维度前后轮次评分差异 ${diff} 分（${interview.round} 轮 vs 前轮），建议确认评分口径一致性。`,
          evidenceRefs: ["scores", "previousFeedback.scores"],
          suggestedFollowUpQuestions: ["请与前一面试官对齐评分标准", "请确认该维度能力是否在不同场景下有显著差异"],
        });
        break; // one signal per dimension deviation
      }
    }
  }

  return signals;
}
