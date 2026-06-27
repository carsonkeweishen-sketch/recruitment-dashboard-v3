// Phase 8.1: AI Dashboard Service
// Aggregates data from repository, generates insights and health summary.
// All insights are rule-based (System Intelligence), NOT LLM-generated.

import type { ScopeWhere } from "@/server/permissions/types";
import {
  getActionMetrics,
  getJobMetrics,
  getFeedbackMetrics,
  getPriorityActions,
  getJobHealthItems,
  getCandidateRiskItems,
  getRecentActivity,
  getRiskDistribution,
  type DashboardQueryParams,
} from "@/server/repositories/dashboard/ai-dashboard-repository";

// ============================================================
// Types
// ============================================================

export interface RiskInsight {
  id: string;
  title: string;
  category: string;
  severity: "low" | "medium" | "high" | "urgent";
  summary: string;
  evidence: string[];
  suggestedAction: string;
  linkedActionId?: string;
  linkedJobId?: string;
  linkedCandidateId?: string;
  generatedBy: "system_rule";
  triggerCondition: string;
  humanReviewStatus: "not_required";
  createdAt: string;
}

export interface RiskRadarItem {
  riskName: string;
  riskLabel: string;
  riskLevel: "low" | "medium" | "high" | "urgent";
  totalActionCount: number;
  overdueCount: number;
  suggestedAction: string;
}

export interface AiDashboardData {
  metrics: Record<string, number | null>;
  healthSummary: {
    title: string;
    summary: string;
    generatedBy: "system_rule";
    triggerConditions: string[];
    evidenceCount: number;
    updatedAt: string;
  };
  insights: RiskInsight[];
  riskRadar: RiskRadarItem[];
  priorityActions: Array<Record<string, unknown>>;
  jobHealth: Array<Record<string, unknown>>;
  candidateRisk: Array<Record<string, unknown>>;
  recentActivity: Array<Record<string, unknown>>;
}

// ============================================================
// Category labels
// ============================================================

const CATEGORY_LABELS: Record<string, string> = {
  process_blocker: "流程卡点",
  feedback_followup: "反馈催办",
  candidate_risk_followup: "候选人风险",
  offer_risk: "Offer风险",
  business_feedback: "业务反馈",
  data_quality: "数据质量",
  job_calibration: "岗位校准",
};

const RISK_SUGGESTIONS: Record<string, string> = {
  process_blocker: "检查招聘渠道策略或调整岗位画像",
  feedback_followup: "优先催办面试官补充结构化反馈",
  candidate_risk_followup: "补充候选人稳定性追问记录",
  offer_risk: "加速Offer决策流程，评估竞品风险",
  business_feedback: "催办业务负责人处理反馈",
  data_quality: "补充缺失的招聘过程数据",
  job_calibration: "与业务方重新校准岗位画像",
};

// ============================================================
// Main service function
// ============================================================

export async function getAiDashboardData(
  scope: ScopeWhere,
  userId: string,
  role: string,
  departmentId?: string
): Promise<AiDashboardData> {
  const params: DashboardQueryParams = { scope, userId, role, departmentId };

  // Fetch all data in parallel
  const [actionMetrics, jobMetrics, feedbackMetrics, priorityActions, riskDistribution, recentActivity] =
    await Promise.all([
      getActionMetrics(params),
      getJobMetrics(params),
      getFeedbackMetrics(params),
      getPriorityActions(params),
      getRiskDistribution(params),
      getRecentActivity(params),
    ]);

  const jobIds = jobMetrics.scopedJobIds;
  const [jobHealth, candidateRisk] = await Promise.all([
    getJobHealthItems(params, jobIds),
    getCandidateRiskItems(params, jobIds),
  ]);

  // ============================================================
  // Build Metrics
  // ============================================================
  const metrics: Record<string, number | null> = {
    activeJobCount: jobMetrics.activeJobCount,
    activeCandidateCount: jobMetrics.activeCandidateCount,
    openActionCount: actionMetrics.openActionCount,
    overdueActionCount: actionMetrics.overdueActionCount,
    highPriorityActionCount: actionMetrics.highPriorityActionCount,
    dueTodayActionCount: actionMetrics.dueTodayActionCount,
    averageResolutionHours: actionMetrics.averageResolutionHours,
    onTimeResolutionRate: actionMetrics.onTimeResolutionRate,
    pendingFeedbackCount: feedbackMetrics.pendingFeedbackCount,
    lowQualityFeedbackCount: feedbackMetrics.lowQualityFeedbackCount,
  };

  // ============================================================
  // Build Health Summary (rule-based)
  // ============================================================
  const triggerConditions: string[] = [];
  const summaryParts: string[] = [];

  if (actionMetrics.overdueActionCount > 0) {
    triggerConditions.push(`逾期行动项：${actionMetrics.overdueActionCount} 条`);
    summaryParts.push(`${actionMetrics.overdueActionCount} 条逾期行动项`);
  }
  if (actionMetrics.highPriorityActionCount > 0) {
    triggerConditions.push(`高优先级行动项：${actionMetrics.highPriorityActionCount} 条`);
    summaryParts.push(`${actionMetrics.highPriorityActionCount} 条高优先级行动项`);
  }
  if (feedbackMetrics.pendingFeedbackCount > 0) {
    triggerConditions.push(`待提交面评：${feedbackMetrics.pendingFeedbackCount} 条`);
    summaryParts.push(`${feedbackMetrics.pendingFeedbackCount} 条待提交面评`);
  }
  if (feedbackMetrics.lowQualityFeedbackCount > 0) {
    triggerConditions.push(`低质量面评：${feedbackMetrics.lowQualityFeedbackCount} 条`);
  }
  if (riskDistribution.length > 0) {
    const topRisk = riskDistribution[0];
    triggerConditions.push(`主要风险类型：${CATEGORY_LABELS[topRisk.riskName] || topRisk.riskName}`);
  }

  const summaryText =
    summaryParts.length > 0
      ? `当前招聘风险主要集中在${summaryParts.join("、")}。建议优先处理逾期行动项，并关注岗位候选人供给和面试反馈质量问题。`
      : "当前招聘数据正常，未检测到需要立即关注的风险信号。系统将持续监控招聘过程数据。";

  const healthSummary = {
    title: "系统招聘洞察",
    summary: summaryText,
    generatedBy: "system_rule" as const,
    triggerConditions,
    evidenceCount:
      actionMetrics.openActionCount +
      jobMetrics.activeCandidateCount +
      feedbackMetrics.pendingFeedbackCount,
    updatedAt: new Date().toISOString(),
  };

  // ============================================================
  // Build Risk Insights (from real Action data)
  // ============================================================
  const insights: RiskInsight[] = [];

  // Insight 1: Overdue actions
  if (actionMetrics.overdueActionCount > 0) {
    const overdueActions = await getPriorityActions(params);
    const overdueItems = overdueActions.filter(
      (a) => a.dueAt && new Date(a.dueAt) < new Date()
    );
    if (overdueItems.length > 0) {
      const item = overdueItems[0];
      insights.push({
        id: `insight-overdue-${Date.now()}`,
        title: `逾期行动项需优先处理`,
        category: "feedback_followup",
        severity: actionMetrics.overdueActionCount > 2 ? "urgent" : "high",
        summary: `当前存在 ${actionMetrics.overdueActionCount} 条逾期行动项，已超过截止时间。建议立即处理以避免招聘流程进一步延迟。`,
        evidence: [
          `逾期行动项总数：${actionMetrics.overdueActionCount}`,
          item.job?.title ? `关联岗位：${item.job.title}` : "",
          item.candidate?.name ? `关联候选人：${item.candidate.name}` : "",
        ].filter(Boolean),
        suggestedAction: "优先处理逾期行动项，确认当前状态后关闭或更新截止时间",
        linkedActionId: item.id,
        linkedJobId: item.jobId ?? undefined,
        linkedCandidateId: item.candidateId ?? undefined,
        generatedBy: "system_rule",
        triggerCondition: `Action overdue count > 0 (current: ${actionMetrics.overdueActionCount})`,
        humanReviewStatus: "not_required",
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Insight 2: High priority actions
  if (actionMetrics.highPriorityActionCount > 0) {
    insights.push({
      id: `insight-high-priority-${Date.now()}`,
      title: "高优先级行动项需要关注",
      category: "process_blocker",
      severity: actionMetrics.highPriorityActionCount > 3 ? "urgent" : "high",
      summary: `当前存在 ${actionMetrics.highPriorityActionCount} 条高优先级行动项，涉及流程卡点和风险问题。建议逐一评估并推动闭环。`,
      evidence: [
        `高优先级行动项：${actionMetrics.highPriorityActionCount} 条`,
        `逾期行动项：${actionMetrics.overdueActionCount} 条`,
      ],
      suggestedAction: "按优先级顺序处理行动项，优先解决流程卡点",
      generatedBy: "system_rule",
      triggerCondition: `High priority action count > 0 (current: ${actionMetrics.highPriorityActionCount})`,
      humanReviewStatus: "not_required",
      createdAt: new Date().toISOString(),
    });
  }

  // Insight 3: Feedback pending
  if (feedbackMetrics.pendingFeedbackCount > 0) {
    insights.push({
      id: `insight-feedback-${Date.now()}`,
      title: "面试反馈待提交",
      category: "feedback_followup",
      severity: feedbackMetrics.pendingFeedbackCount > 3 ? "high" : "medium",
      summary: `当前存在 ${feedbackMetrics.pendingFeedbackCount} 场面���已完成但未提交反馈。反馈延迟可能影响候选人体验和招聘推进节奏。`,
      evidence: [
        `待提交面评数：${feedbackMetrics.pendingFeedbackCount}`,
      ],
      suggestedAction: "提醒面试官在24小时内完成结构化反馈提交",
      generatedBy: "system_rule",
      triggerCondition: `Pending feedback count > 0 (current: ${feedbackMetrics.pendingFeedbackCount})`,
      humanReviewStatus: "not_required",
      createdAt: new Date().toISOString(),
    });
  }

  // Insight 4: Low quality feedback
  if (feedbackMetrics.lowQualityFeedbackCount > 0) {
    insights.push({
      id: `insight-quality-${Date.now()}`,
      title: "面试反馈质量需提升",
      category: "data_quality",
      severity: "medium",
      summary: `当前存在 ${feedbackMetrics.lowQualityFeedbackCount} 条低质量面试反馈（评分 < 60）。低质量反馈可能影响候选人评估准确性和后续复盘。`,
      evidence: [
        `低质量面评数：${feedbackMetrics.lowQualityFeedbackCount}`,
      ],
      suggestedAction: "提醒相关面试官补充具体项目案例和数据支撑",
      generatedBy: "system_rule",
      triggerCondition: `Low quality feedback count > 0 (current: ${feedbackMetrics.lowQualityFeedbackCount})`,
      humanReviewStatus: "not_required",
      createdAt: new Date().toISOString(),
    });
  }

  // Insight 5: Supply shortage (from Job Health)
  const supplyShortJobs = jobHealth.filter(
    (j) => (j as Record<string, unknown>).candidateCount === 0
  );
  if (supplyShortJobs.length > 0) {
    insights.push({
      id: `insight-supply-${Date.now()}`,
      title: "岗位候选人供给不足",
      category: "process_blocker",
      severity: "high",
      summary: `${supplyShortJobs.length} 个在招岗位暂无候选人。建议检查招聘渠道投放效果或重新评估岗位画像和薪资竞争力。`,
      evidence: supplyShortJobs.map((j) => {
        const r = j as Record<string, unknown>;
        return `岗位：${r.jobTitle}`;
      }),
      suggestedAction: "拓展招聘渠道或与业务方重新校准岗位画像",
      generatedBy: "system_rule",
      triggerCondition: `Jobs with 0 candidates (count: ${supplyShortJobs.length})`,
      humanReviewStatus: "not_required",
      createdAt: new Date().toISOString(),
    });
  }

  // ============================================================
  // Build Risk Radar
  // ============================================================
  const riskRadar: RiskRadarItem[] = riskDistribution.map((r) => ({
    riskName: r.riskName,
    riskLabel: CATEGORY_LABELS[r.riskName] || r.riskName,
    riskLevel: r.highestPriority as RiskRadarItem["riskLevel"],
    totalActionCount: r.totalActionCount,
    overdueCount: r.overdueCount,
    suggestedAction: RISK_SUGGESTIONS[r.riskName] || "评估并处理相关行动项",
  }));

  // ============================================================
  // Format priority actions
  // ============================================================
  const formattedActions = priorityActions.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    priority: a.priority,
    status: a.status,
    dueAt: a.dueAt?.toISOString() ?? null,
    ownerName: a.owner?.name ?? "—",
    jobTitle: a.job?.title ?? null,
    jobId: a.jobId ?? null,
    candidateName: a.candidate?.name ?? null,
    candidateId: a.candidateId ?? null,
  }));

  // ============================================================
  // Format recent activity
  // ============================================================
  const formattedActivity = recentActivity.map((log) => ({
    id: log.id,
    action: log.action,
    resourceType: log.resourceType,
    actorName: log.actor?.name ?? "系统",
    createdAt: log.createdAt.toISOString(),
    detail: log.detail,
  }));

  return {
    metrics,
    healthSummary,
    insights,
    riskRadar,
    priorityActions: formattedActions,
    jobHealth,
    candidateRisk,
    recentActivity: formattedActivity,
  };
}
