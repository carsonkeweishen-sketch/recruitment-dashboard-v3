// Phase 8.5: Offer Risk Service
import type { ScopeWhere } from "@/server/permissions/types";
import { getOfferRisks, getOfferRiskDetail, getOfferRiskActions, getOfferRiskActivity, type ORParams } from "@/server/repositories/offer-risks/offer-risk-repository";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeRiskFactors(risk: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const factors: any[] = [];
  if (risk.riskType) {
    factors.push({
      title: risk.riskType === "competing_offer" ? "竞品 Offer 风险" : risk.riskType === "salary_gap" ? "薪酬预期落差风险" : risk.riskType === "candidate_hesitation" ? "候选人意向波动" : risk.riskType === "start_date" ? "入职时间风险" : risk.riskType === "business_attraction" ? "业务吸引点不足" : risk.riskType === "decision_delay" ? "决策周期过长" : risk.riskType,
      summary: risk.summary || "",
      riskLevel: risk.riskLevel || "medium",
      evidence: risk.evidence ? [risk.evidence] : [],
      sourceType: risk.sourceType || "system_rule",
      triggerCondition: risk.triggerCondition || `riskType=${risk.riskType}`,
      suggestedFollowUp: risk.suggestedAction || "确认候选人真实顾虑并制定 closing 计划",
      generatedBy: "system_rule",
    });
  }
  return factors;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateClosingPlan(risk: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plans: any[] = [];
  const basePlan = {
    closingGoal: "确认候选人真实顾虑并制定针对性 closing 方案",
    suggestedFocus: "结合岗位发展空间、业务资源和入职后可见成果说明吸引点",
    businessNeed: "业务方补充候选人入职后前 3 个月的核心项目参与范围",
    hrNeed: "HR 确认候选人薪酬预期和竞品动态",
    priority: risk.riskLevel === "urgent" || risk.riskLevel === "high" ? "high" : "medium",
    relatedRisk: risk.riskType || "offer_risk",
    suggestedDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  plans.push(basePlan);
  if (risk.suggestedAction) plans.push({ closingGoal: risk.suggestedAction, suggestedFocus: "根据系统建议跟进", priority: "medium", relatedRisk: risk.riskType });
  return plans;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateInsights(risk: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insights: any[] = [];
  const now = new Date().toISOString();
  if (risk.riskLevel === "urgent" || risk.riskLevel === "high") {
    insights.push({
      id: `offer-risk-${risk.id}`, title: "高优先级 Offer 风险", category: "offer_risk", severity: risk.riskLevel,
      summary: risk.summary || "候选人存在 Offer 接受风险", evidence: risk.evidence ? [risk.evidence] : [],
      suggestedAction: risk.suggestedAction || "制定 closing 计划并追踪候选人意向",
      generatedBy: "system_rule", triggerCondition: `riskLevel=${risk.riskLevel}`, humanReviewStatus: "not_required", createdAt: now,
    });
  }
  return insights;
}

export async function getOfferRiskList(scope: ScopeWhere, userId: string, role: string, departmentId?: string) {
  const params: ORParams = { scope, userId, role, departmentId };
  const risks = await getOfferRisks(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];
  for (const r of risks) {
    const candidateId = (r as any).candidateId || (r as any).candidate?.id;
    const openActions = await prisma.actionItem.count({ where: { category: "offer_risk", candidateId, status: "open" } });
    const overdueActions = await prisma.actionItem.count({ where: { category: "offer_risk", candidateId, status: "open", dueAt: { lt: new Date() } } });
    results.push({
      id: r.id, candidateName: (r as any).candidate?.name || "—", jobTitle: (r as any).job?.title || "—",
      riskLevel: (r as any).riskLevel, riskType: (r as any).riskType, summary: (r as any).summary,
      openActions, overdueActions, ownerName: (r as any).owner?.name,
      suggestedAction: (r as any).suggestedAction || "确认候选人意向并制定 closing 计划",
      createdAt: (r as any).createdAt, status: (r as any).status,
    });
  }
  return results;
}

export async function getOfferRiskDetailData(id: string) {
  const risk = await getOfferRiskDetail(id);
  if (!risk) return null;
  const riskFactors = computeRiskFactors(risk);
  const closingPlan = generateClosingPlan(risk);
  const insights = generateInsights(risk);
  const actions = await getOfferRiskActions(id);
  const activity = await getOfferRiskActivity(id);
  return {
    id: (risk as any).id, candidateName: (risk as any).candidate?.name, jobTitle: (risk as any).job?.title,
    riskLevel: (risk as any).riskLevel, riskType: (risk as any).riskType, summary: (risk as any).summary,
    evidence: (risk as any).evidence, sourceType: (risk as any).sourceType, suggestedAction: (risk as any).suggestedAction,
    triggerCondition: (risk as any).triggerCondition, status: (risk as any).status, ownerName: (risk as any).owner?.name,
    createdAt: (risk as any).createdAt, updatedAt: (risk as any).updatedAt,
    riskFactors, closingPlan, insights,
    actions: actions.map(a => ({ id: a.id, title: a.title, category: a.category, priority: a.priority, status: a.status, dueAt: a.dueAt, ownerName: (a as any).owner?.name, jobTitle: (a as any).job?.title })),
    activity: activity.map(a => ({ id: a.id, action: a.action, actorName: a.actor?.name, detail: a.detail, createdAt: a.createdAt })),
  };
}
