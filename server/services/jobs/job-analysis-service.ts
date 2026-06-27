// Phase 8.2: Job Analysis Service (simplified, production-ready)
import type { ScopeWhere } from "@/server/permissions/types";
import {
  getJobsForAnalysis, getJobAnalysisDetail, getJobActions, getJobActivity,
  type JobAnalysisParams,
} from "@/server/repositories/jobs/job-analysis-repository";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function computeHealthLevel(
  totalCandidates: number, overdueActions: number, openActions: number,
  hasOfferRisk: boolean, hasFeedbackRisk: boolean
): "healthy" | "attention" | "risk" {
  if (overdueActions > 0 || (totalCandidates === 0 && openActions > 0)) return "risk";
  if (openActions >= 3 || hasOfferRisk || hasFeedbackRisk || totalCandidates < 2) return "attention";
  return "healthy";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateInsights(jobTitle: string, jobId: string, totalCandidates: number, headcount: number, overdueActions: number, pendingFeedback: number, lowQualityFeedback: number, hasOfferRisk: boolean): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insights: any[] = [];
  const now = new Date().toISOString();
  if (totalCandidates === 0) insights.push({ id: `supply-${jobId}`, title: "候选人供给不足", category: "supply_shortage", severity: "high", summary: `岗位无候选人，目标编制${headcount}人。`, evidence: [`候选人数:0`], suggestedAction: "拓展招聘渠道", generatedBy: "system_rule", triggerCondition: "totalCandidates=0", humanReviewStatus: "not_required", createdAt: now });
  else if (totalCandidates < headcount) insights.push({ id: `supply-${jobId}`, title: "候选人供给偏弱", category: "supply_shortage", severity: "medium", summary: `${totalCandidates}/${headcount}人，供给不足。`, evidence: [`候选人数:${totalCandidates}`,`编制:${headcount}`], suggestedAction: "增加渠道投放", generatedBy: "system_rule", triggerCondition: "totalCandidates<headcount", humanReviewStatus: "not_required", createdAt: now });
  if (overdueActions > 0) insights.push({ id: `overdue-${jobId}`, title: "存在逾期行动项", category: "process_blocker", severity: "high", summary: `${overdueActions}条逾期行动项。`, evidence: [`逾期:${overdueActions}`], suggestedAction: "优先处理逾期", generatedBy: "system_rule", triggerCondition: "overdueActions>0", humanReviewStatus: "not_required", createdAt: now });
  if (pendingFeedback > 0) insights.push({ id: `feedback-${jobId}`, title: "面试反馈待提交", category: "feedback_followup", severity: "medium", summary: `${pendingFeedback}场面评待提交。`, evidence: [`待提交:${pendingFeedback}`], suggestedAction: "催办面试官", generatedBy: "system_rule", triggerCondition: "pendingFeedback>0", humanReviewStatus: "not_required", createdAt: now });
  if (lowQualityFeedback > 0) insights.push({ id: `quality-${jobId}`, title: "面试反馈质量需提升", category: "data_quality", severity: "medium", summary: `${lowQualityFeedback}条低质量面评。`, evidence: [`低质量:${lowQualityFeedback}`], suggestedAction: "补充证据", generatedBy: "system_rule", triggerCondition: "lowQuality>0", humanReviewStatus: "not_required", createdAt: now });
  if (hasOfferRisk) insights.push({ id: `offer-${jobId}`, title: "Offer风险需关注", category: "offer_risk", severity: "high", summary: "存在Offer阶段风险。", evidence: ["存在Offer风险候选人"], suggestedAction: "加速决策", generatedBy: "system_rule", triggerCondition: "hasOfferRisk", humanReviewStatus: "not_required", createdAt: now });
  return insights;
}

export async function getJobsAnalysisList(scope: ScopeWhere, userId: string, role: string, departmentId?: string) {
  const params: JobAnalysisParams = { scope, userId, role, departmentId };
  const jobs = await getJobsForAnalysis(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];
  for (const job of jobs) {
    const apps = job.applications;
    const activeApps = apps.filter(a => a.status === "active");
    const hasOfferRisk = activeApps.some(a => a.stage === "offer_risk");
    const openActions = await prisma.actionItem.count({ where: { jobId: job.id, status: "open" } });
    const overdueActions = await prisma.actionItem.count({ where: { jobId: job.id, status: "open", dueAt: { lt: new Date() } } });
    const pendingFeedback = await prisma.interview.count({ where: { status: "completed", feedbacks: { none: {} }, application: { jobId: job.id } } });
    const lowQualityFeedback = await prisma.interviewFeedback.count({ where: { feedbackQualityScore: { lt: 60 }, interview: { application: { jobId: job.id } } } });
    const hasFeedbackRisk = pendingFeedback > 0 || lowQualityFeedback > 0;
    const supplyRisk = apps.length < job.headcount;
    const healthLevel = computeHealthLevel(apps.length, overdueActions, openActions, hasOfferRisk, hasFeedbackRisk);
    const riskLabels: string[] = [];
    if (supplyRisk) riskLabels.push("供给不足");
    if (hasOfferRisk) riskLabels.push("Offer风险");
    if (hasFeedbackRisk) riskLabels.push("反馈风险");
    if (overdueActions > 0) riskLabels.push("逾期行动");
    let suggestedAction = "正常推进中";
    if (healthLevel === "risk") suggestedAction = "优先处理逾期行动项并补充候选人供给";
    else if (healthLevel === "attention") suggestedAction = "关注候选人供给和反馈质量";
    results.push({ jobId: job.id, jobTitle: job.title, jobStatus: job.status, department: job.department?.name, ownerName: job.owner?.name, businessOwnerName: job.businessOwner?.name, headcount: job.headcount, totalCandidates: apps.length, activeCandidates: activeApps.length, openActions, overdueActions, pendingFeedback, lowQualityFeedback, healthLevel, riskLabels, suggestedAction, hasSupplyRisk: supplyRisk, hasOfferRisk, hasFeedbackRisk });
  }
  return results;
}

export async function getJobAnalysisDetailData(jobId: string) {
  const job = await getJobAnalysisDetail(jobId);
  if (!job) return null;
  const apps = job.applications;
  const activeApps = apps.filter(a => a.status === "active");
  const stageCounts: Record<string, number> = {};
  for (const app of apps) { stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1; }
  const funnel = [{ stage: "sourced", label: "入库", count: stageCounts["sourced"] || 0 },{ stage: "hr_screen", label: "HR筛选", count: stageCounts["hr_screen"] || 0 },{ stage: "business_screen", label: "业务筛选", count: stageCounts["business_screen"] || 0 },{ stage: "first_interview", label: "初试", count: stageCounts["first_interview"] || 0 },{ stage: "second_interview", label: "复试", count: stageCounts["second_interview"] || 0 },{ stage: "final_interview", label: "终面", count: stageCounts["final_interview"] || 0 },{ stage: "offer_risk", label: "Offer风险", count: stageCounts["offer_risk"] || 0 },{ stage: "pre_onboarding", label: "入职前", count: stageCounts["pre_onboarding"] || 0 },{ stage: "hired", label: "已入职", count: stageCounts["hired"] || 0 }];
  const candidatesSummary = apps.map(app => ({ candidateId: app.candidate.id, candidateName: app.candidate.name, stage: app.stage, currentCompany: app.candidate.currentCompany, currentTitle: app.candidate.currentTitle }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allFeedbacks: any[] = [];
  for (const app of apps) { for (const iv of app.interviews) { for (const fb of iv.feedbacks) { allFeedbacks.push({ ...fb, interviewerName: iv.interviewer.name, candidateName: app.candidate.name, round: iv.round }); } } }
  const pendingFeedbackCount = apps.reduce((sum, a) => sum + a.interviews.filter(i => i.feedbacks.length === 0 && i.status === "completed").length, 0);
  const lowQualityCount = allFeedbacks.filter(f => (f.feedbackQualityScore || 100) < 60).length;
  const actions = await getJobActions(jobId);
  const activity = await getJobActivity(jobId);
  const hasOfferRisk = activeApps.some(a => a.stage === "offer_risk");
  const openActions = await prisma.actionItem.count({ where: { jobId, status: "open" } });
  const overdueActions = await prisma.actionItem.count({ where: { jobId, status: "open", dueAt: { lt: new Date() } } });
  const insights = generateInsights(job.title, jobId, apps.length, job.headcount, overdueActions, pendingFeedbackCount, lowQualityCount, hasOfferRisk);
  const healthLevel = computeHealthLevel(apps.length, overdueActions, openActions, hasOfferRisk, pendingFeedbackCount > 0 || lowQualityCount > 0);
  return { jobId: job.id, jobTitle: job.title, jobCode: job.jobCode, jobStatus: job.status, department: job.department, owner: job.owner, businessOwner: job.businessOwner, headcount: job.headcount, level: job.level, location: job.location, jdText: job.jdText, profileSummary: job.profileSummary, mustHave: job.mustHave, niceToHave: job.niceToHave, targetCompanies: job.targetCompanies, totalCandidates: apps.length, activeCandidates: activeApps.length, healthLevel, openActions, overdueActions, pendingFeedback: pendingFeedbackCount, lowQualityFeedback: lowQualityCount, funnel, candidatesSummary, interviews: allFeedbacks, actions, insights, activity };
}
