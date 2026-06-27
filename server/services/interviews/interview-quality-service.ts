// Phase 8.4: Interview Quality Service
import type { ScopeWhere } from "@/server/permissions/types";
import { getInterviewFeedbacksForAnalysis, getFeedbackDetail, getFeedbackActions, getFeedbackActivity, type IQParams } from "@/server/repositories/interviews/interview-quality-repository";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type EvidenceStrength = "strong" | "medium" | "weak" | "missing";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeEvidenceScore(fb: any): { score: number; strengths: EvidenceStrength[]; gaps: string[] } {
  const strengths: EvidenceStrength[] = [];
  const gaps: string[] = [];
  if (fb.evidenceText && fb.evidenceText.length > 50) strengths.push("strong");
  else if (fb.evidenceText && fb.evidenceText.length > 10) strengths.push("medium");
  else { strengths.push("weak"); gaps.push("evidenceText 缺失或不足"); }
  if (fb.scores && typeof fb.scores === "object") {
    const scoreCount = Object.keys(fb.scores).length;
    if (scoreCount >= 4) strengths.push("strong");
    else if (scoreCount >= 2) strengths.push("medium");
    else gaps.push("评分维度不足");
  }
  const score = strengths.filter(s => s === "strong").length * 30 + strengths.filter(s => s === "medium").length * 15;
  return { score: Math.min(score, 100), strengths, gaps };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeRisks(fb: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const risks: any[] = [];
  if ((fb.feedbackQualityScore || 100) < 60) risks.push({ title: "面评质量偏低", summary: `feedbackQualityScore=${fb.feedbackQualityScore}`, riskLevel: "high", evidence: [`评分: ${fb.feedbackQualityScore}`], suggestedFollowUp: "补充具体项目案例和数据", generatedBy: "system_rule", triggerCondition: "feedbackQualityScore < 60" });
  if (!fb.evidenceText && (fb.overallRecommendation === "HIRE" || fb.overallRecommendation === "STRONG_HIRE")) risks.push({ title: "推荐结论缺少证据支撑", summary: "推荐为HIRE/STRONG_HIRE但无evidenceText", riskLevel: "high", evidence: ["缺失evidenceText"], suggestedFollowUp: "补充具体项目证据", generatedBy: "system_rule", triggerCondition: "HIRE without evidence" });
  if (!fb.riskNotes && fb.overallRecommendation === "STRONG_HIRE") risks.push({ title: "缺少风险记录", summary: "STRONG_HIRE推荐但未记录风险点", riskLevel: "medium", evidence: ["riskNotes为空"], suggestedFollowUp: "补充待验证项", generatedBy: "system_rule", triggerCondition: "STRONG_HIRE without riskNotes" });
  return risks;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateFollowUp(fb: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = [];
  if (!fb.evidenceText) items.push({ question: "请补充具体项目案例和结果数据", purpose: "验证候选人真实贡献", relatedRisk: "项目贡献不清", expectedEvidence: "项目背景、个人角色、关键结果" });
  if (fb.suggestedFollowUpQuestions?.length) {
    for (const q of fb.suggestedFollowUpQuestions) items.push({ question: q, purpose: "面试官建议追问", relatedRisk: "面试官标记", expectedEvidence: "按问题方向补充" });
  }
  return items;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateInsights(fb: any, evidenceScore: number): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insights: any[] = [];
  const now = new Date().toISOString();
  if ((fb.feedbackQualityScore || 100) < 60) insights.push({ id: `lowq-${fb.id}`, title: "面评质量需提升", category: "feedback_quality", severity: "high", summary: `feedbackQualityScore=${fb.feedbackQualityScore}`, evidence: [`评分:${fb.feedbackQualityScore}`], suggestedAction: "补充具体项目案例和数据", generatedBy: "system_rule", triggerCondition: "qualityScore<60", humanReviewStatus: "not_required", createdAt: now });
  if (evidenceScore < 40) insights.push({ id: `evidence-${fb.id}`, title: "证据充分度不足", category: "evidence_gap", severity: "medium", summary: `evidenceScore=${evidenceScore}`, evidence: ["证据缺失或不足"], suggestedAction: "补充项目证据和结果数据", generatedBy: "system_rule", triggerCondition: "evidenceScore<40", humanReviewStatus: "not_required", createdAt: now });
  return insights;
}

export async function getInterviewQualityList(scope: ScopeWhere, userId: string, role: string, departmentId?: string) {
  const params: IQParams = { scope, userId, role, departmentId };
  const feedbacks = await getInterviewFeedbacksForAnalysis(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];
  for (const fb of feedbacks) {
    const evidence = computeEvidenceScore(fb);
    const openActions = await prisma.actionItem.count({ where: { sourceRefId: fb.id, status: "open" } });
    const isOverdue = !fb.submittedAt && fb.interview?.status === "completed";
    results.push({
      feedbackId: fb.id, candidateName: fb.interview?.application?.candidate?.name || "—",
      jobTitle: fb.interview?.application?.job?.title || "—", round: fb.interview?.round || "—",
      interviewerName: fb.interview?.interviewer?.name || "—",
      status: fb.submittedAt ? "submitted" : "pending", isOverdue,
      feedbackQualityScore: fb.feedbackQualityScore, qualityLevel: fb.qualityLevel || (fb.feedbackQualityScore && fb.feedbackQualityScore >= 70 ? "good" : "needs_improvement"),
      evidenceScore: evidence.score, evidenceGaps: evidence.gaps,
      recommendation: fb.overallRecommendation, openActions,
      suggestedAction: isOverdue ? "催办面试官提交反馈" : evidence.score < 40 ? "补充面评证据" : "正常",
    });
  }
  return results;
}

export async function getInterviewQualityDetail(feedbackId: string) {
  const fb = await getFeedbackDetail(feedbackId);
  if (!fb) return null;
  const evidence = computeEvidenceScore(fb);
  const risks = computeRisks(fb);
  const followUp = generateFollowUp(fb);
  const insights = generateInsights(fb, evidence.score);
  const actions = await getFeedbackActions(feedbackId);
  const activity = await getFeedbackActivity(feedbackId);
  return {
    feedbackId: fb.id, candidateName: fb.interview?.application?.candidate?.name,
    jobTitle: fb.interview?.application?.job?.title, round: fb.interview?.round,
    interviewerName: fb.interview?.interviewer?.name, status: fb.submittedAt ? "submitted" : "pending",
    submittedAt: fb.submittedAt, overallRecommendation: fb.overallRecommendation,
    feedbackQualityScore: fb.feedbackQualityScore, qualityLevel: fb.qualityLevel,
    scores: fb.scores, evidenceText: fb.evidenceText, riskNotes: fb.riskNotes,
    suggestedFollowUpQuestions: fb.suggestedFollowUpQuestions,
    evidenceScore: evidence.score, evidenceStrengths: evidence.strengths, evidenceGaps: evidence.gaps,
    risks, followUp, insights,
    actions: actions.map(a => ({ id: a.id, title: a.title, category: a.category, priority: a.priority, status: a.status, dueAt: a.dueAt, ownerName: a.owner?.name, jobTitle: a.job?.title })),
    activity: activity.map(a => ({ id: a.id, action: a.action, actorName: a.actor?.name, detail: a.detail, createdAt: a.createdAt })),
  };
}
