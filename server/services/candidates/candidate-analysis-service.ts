// Phase 8.3: Candidate Analysis Service
import type { ScopeWhere } from "@/server/permissions/types";
import { getCandidatesForAnalysis, getCandidateDetail, getCandidateActions, getCandidateActivity, type CandidateAnalysisParams } from "@/server/repositories/candidates/candidate-analysis-repository";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type MatchLevel = "high" | "medium" | "low" | "pending";
type EvidenceStrength = "strong" | "medium" | "weak" | "missing";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateInsights(candidateName: string, candidateId: string, matchLevel: MatchLevel, hasOpenActions: boolean, hasRiskSignals: boolean, evidenceGaps: string[], interviewCount: number): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insights: any[] = [];
  const now = new Date().toISOString();
  if (matchLevel === "high") insights.push({ id: `match-${candidateId}`, title: "匹配度较高", category: "candidate_match", severity: "low", summary: `${candidateName}与当前岗位匹配度较高。`, evidence: ["匹配度: 高"], suggestedAction: "推进后续面试流程", generatedBy: "system_rule", triggerCondition: "matchLevel=high", humanReviewStatus: "not_required", createdAt: now });
  if (evidenceGaps.length > 0) insights.push({ id: `evidence-${candidateId}`, title: "存在证据缺口", category: "evidence_gap", severity: "medium", summary: `${evidenceGaps.length}项关键证据缺失: ${evidenceGaps.join(", ")}`, evidence: evidenceGaps, suggestedAction: "在下一轮面试中补充追问", generatedBy: "system_rule", triggerCondition: "evidenceGaps>0", humanReviewStatus: "not_required", createdAt: now });
  if (hasRiskSignals) insights.push({ id: `risk-${candidateId}`, title: "存在风险信号", category: "candidate_risk", severity: "high", summary: "候选人存在面试风险信号，建议关注。", evidence: ["检测到风险信号"], suggestedAction: "验证风险信号并在下一轮追问", generatedBy: "system_rule", triggerCondition: "hasRiskSignals", humanReviewStatus: "not_required", createdAt: now });
  if (hasOpenActions) insights.push({ id: `action-${candidateId}`, title: "存在未关闭行动项", category: "action_followup", severity: "medium", summary: "候选人有关联的未关闭行动项。", evidence: ["未关闭Action > 0"], suggestedAction: "优先处理关联行动项", generatedBy: "system_rule", triggerCondition: "hasOpenActions", humanReviewStatus: "not_required", createdAt: now });
  if (interviewCount === 0) insights.push({ id: `nointerview-${candidateId}`, title: "暂无面试记录", category: "data_quality", severity: "low", summary: "该候选人尚未有面试反馈记录。", evidence: ["面试次数: 0"], suggestedAction: "安排首轮面试并收集结构化反馈", generatedBy: "system_rule", triggerCondition: "interviewCount=0", humanReviewStatus: "not_required", createdAt: now });
  return insights;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeEvidenceChain(applications: any[]): { sourceType: string; sourceLabel: string; summary: string; strength: EvidenceStrength; linkedInterviewId?: string; linkedFeedbackId?: string }[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any[] = [];
  for (const app of applications) {
    if (app.candidate?.currentTitle) chain.push({ sourceType: "resume", sourceLabel: "简历", summary: `当前职位: ${app.candidate.currentTitle}${app.candidate.currentCompany ? " @ " + app.candidate.currentCompany : ""}`, strength: "medium" as EvidenceStrength });
    for (const iv of app.interviews || []) {
      for (const fb of iv.feedbacks || []) {
        if (fb.evidenceText) chain.push({ sourceType: "interview_feedback", sourceLabel: "面试反馈", summary: fb.evidenceText.substring(0, 200), strength: (fb.feedbackQualityScore || 50) >= 70 ? "strong" as EvidenceStrength : "medium" as EvidenceStrength, linkedInterviewId: iv.id, linkedFeedbackId: fb.id });
        if (fb.overallRecommendation) chain.push({ sourceType: "interview_feedback", sourceLabel: "面试结论", summary: `推荐: ${fb.overallRecommendation}`, strength: fb.overallRecommendation === "STRONG_HIRE" || fb.overallRecommendation === "HIRE" ? "strong" as EvidenceStrength : "medium" as EvidenceStrength, linkedFeedbackId: fb.id });
      }
    }
  }
  return chain;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeRiskSignals(applications: any[]): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const risks: any[] = [];
  for (const app of applications || []) {
    for (const iv of app.interviews || []) {
      for (const fb of iv.feedbacks || []) {
        if (fb.riskSignals && Array.isArray(fb.riskSignals)) {
          for (const signal of fb.riskSignals) {
            risks.push({ title: signal.riskName || "风险信号", summary: signal.description || "", riskLevel: signal.riskLevel || "medium", evidence: [signal.evidence || ""], suggestedFollowUp: "在下一轮面试中验证", generatedBy: "system_rule", triggerCondition: "riskSignal detected in feedback" });
          }
        }
      }
    }
  }
  // If no explicit risk signals, check for quality issues
  for (const app of applications || []) {
    for (const iv of app.interviews || []) {
      for (const fb of iv.feedbacks || []) {
        if (!fb.evidenceText && fb.overallRecommendation === "HIRE") {
          risks.push({ title: "证据与结论不匹配", summary: "推荐结论为HIRE但缺少具体项目证据", riskLevel: "high", evidence: ["缺失evidenceText"], suggestedFollowUp: "补充具体项目案例和数据", generatedBy: "system_rule", triggerCondition: "HIRE without evidence" });
        }
      }
    }
  }
  return risks;
}

export async function getCandidatesAnalysisList(scope: ScopeWhere, userId: string, role: string, departmentId?: string) {
  const params: CandidateAnalysisParams = { scope, userId, role, departmentId };
  const candidates = await getCandidatesForAnalysis(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];
  for (const c of candidates) {
    const apps = c.applications || [];
    const primaryApp = apps[0];
    const allFeedbacks = apps.flatMap(a => (a.interviews || []).flatMap(i => (i.feedbacks || [])));
    const interviewCount = apps.flatMap(a => a.interviews || []).length;
    const openActions = await prisma.actionItem.count({ where: { candidateId: c.id, status: "open" } });
    const evidenceChain = computeEvidenceChain(apps);
    const riskSignals = computeRiskSignals(apps);
    const evidenceGaps = evidenceChain.filter(e => e.strength === "missing" || e.strength === "weak").map(e => e.sourceLabel);
    const matchLevel: MatchLevel = allFeedbacks.length > 0 ? (allFeedbacks.some(f => f.overallRecommendation === "STRONG_HIRE") ? "high" : "medium") : "pending";
    const canTransfer = apps.length > 0 && matchLevel !== "high";
    results.push({
      candidateId: c.id, candidateName: c.name,
      jobTitle: primaryApp?.job?.title || "—", stage: primaryApp?.stage || "sourced",
      matchLevel, riskCount: riskSignals.length, evidenceCount: evidenceChain.filter(e => e.strength === "strong").length,
      evidenceGapCount: evidenceGaps.length, openActions, interviewCount,
      canTransfer, hasRiskSignals: riskSignals.length > 0,
      suggestedAction: openActions > 0 ? "优先处理关联行动项" : evidenceGaps.length > 0 ? "补充关键证据" : "正常推进中",
    });
  }
  return results;
}

export async function getCandidateAnalysisDetailData(candidateId: string) {
  const candidate = await getCandidateDetail(candidateId);
  if (!candidate) return null;
  const apps = candidate.applications || [];
  const allFeedbacks = apps.flatMap(a => (a.interviews || []).flatMap(i => (i.feedbacks || [])));
  const interviewCount = apps.flatMap(a => a.interviews || []).length;
  const openActions = await prisma.actionItem.count({ where: { candidateId, status: "open" } });
  const evidenceChain = computeEvidenceChain(apps);
  const riskSignals = computeRiskSignals(apps);
  const evidenceGaps = evidenceChain.filter(e => e.strength === "missing" || e.strength === "weak").map(e => e.sourceLabel);
  const matchLevel: MatchLevel = allFeedbacks.length > 0 ? (allFeedbacks.some(f => f.overallRecommendation === "STRONG_HIRE") ? "high" : "medium") : "pending";
  const actions = await getCandidateActions(candidateId);
  const activity = await getCandidateActivity(candidateId);
  const insights = generateInsights(candidate.name, candidateId, matchLevel, openActions > 0, riskSignals.length > 0, evidenceGaps, interviewCount);
  return {
    candidateId: candidate.id, candidateName: candidate.name,
    currentCompany: candidate.currentCompany, currentTitle: candidate.currentTitle,
    matchLevel, stage: apps[0]?.stage || "sourced", jobTitle: apps[0]?.job?.title,
    evidenceChain, riskSignals, insights, openActions,
    applications: apps.map(a => ({ jobId: a.job?.id, jobTitle: a.job?.title, stage: a.stage, status: a.status })),
    interviews: apps.flatMap(a => (a.interviews || []).map(i => ({ id: i.id, round: i.round, status: i.status, interviewerName: i.interviewer?.name, feedbacks: (i.feedbacks || []).map(f => ({ ...f })) }))),
    actions: actions.map(a => ({ id: a.id, title: a.title, category: a.category, priority: a.priority, status: a.status, dueAt: a.dueAt, ownerName: a.owner?.name, jobTitle: a.job?.title })),
    activity: activity.map(a => ({ id: a.id, action: a.action, actorName: a.actor?.name, detail: a.detail, createdAt: a.createdAt })),
  };
}
