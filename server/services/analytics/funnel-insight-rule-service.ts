// Phase 8.2R: System Rule Insights for Recruitment Funnel
// generatedBy = "system_rule" — NOT LLM
// Each insight must have: insightKey, triggerCondition, evidence, suggestedAction, severity

import type { DataQualityWarning } from "./funnel-data-quality-service";

export interface FunnelInsight {
  insightKey: string;
  generatedBy: "system_rule";
  severity: "info" | "warning" | "critical";
  triggerCondition: string;
  evidence: string;
  suggestedAction: string;
  metadata?: Record<string, unknown>;
}

export interface FunnelInsightContext {
  stages: {
    key: string;
    count: number;
    conversionRate: number | null;
    dropoffRate: number | null;
    avgDurationDays: number | null;
  }[];
  applications: unknown[];
  interviews: unknown[];
  feedbacks: unknown[];
  actions: unknown[];
  jobs: unknown[];
  dataQualityWarnings: DataQualityWarning[];
}

export function generateSystemInsights(ctx: FunnelInsightContext): FunnelInsight[] {
  const insights: FunnelInsight[] = [];

  insights.push(...checkResumeDropoffHigh(ctx));
  insights.push(...checkInterviewNoShowHigh(ctx));
  insights.push(...checkFeedbackSubmitDelay(ctx));
  insights.push(...checkStageDurationOverdue(ctx));
  insights.push(...checkChannelQualityLow(ctx));
  insights.push(...checkOfferRiskConcentrated(ctx));
  insights.push(...checkActionOverdueAffectsFunnel(ctx));

  return insights;
}

// 1. 简历评估到通过掉落率 > 40%
function checkResumeDropoffHigh(ctx: FunnelInsightContext): FunnelInsight[] {
  const reviewed = ctx.stages.find((s) => s.key === "resume_reviewed");
  const passed = ctx.stages.find((s) => s.key === "screen_passed");
  if (!reviewed || !passed || reviewed.count === 0) return [];

  const dropoffRate = passed.count > 0
    ? 1 - (passed.count / reviewed.count)
    : 1;
  if (dropoffRate <= 0.4) return [];

  return [{
    insightKey: "resume_dropoff_high",
    generatedBy: "system_rule",
    severity: "warning",
    triggerCondition: `简历评估到通过掉落率 ${Math.round(dropoffRate * 100)}% > 40%`,
    evidence: `${reviewed.count} 份简历已评估，仅 ${passed.count} 份通过，掉落率 ${Math.round(dropoffRate * 100)}%`,
    suggestedAction: "建议检查简历筛选标准是否过严，或岗位需求是否与市场供给不匹配",
  }];
}

// 2. 面试安排后到场率 < 80%
function checkInterviewNoShowHigh(ctx: FunnelInsightContext): FunnelInsight[] {
  const scheduled = ctx.stages.find((s) => s.key === "interview_scheduled");
  const completed = ctx.stages.find((s) => s.key === "interview_completed");
  if (!scheduled || !completed || scheduled.count === 0) return [];

  const showRate = scheduled.count > 0 ? completed.count / scheduled.count : 0;
  if (showRate >= 0.8) return [];

  return [{
    insightKey: "interview_no_show_high",
    generatedBy: "system_rule",
    severity: "warning",
    triggerCondition: `面试到场率 ${Math.round(showRate * 100)}% < 80%`,
    evidence: `${scheduled.count} 场面试已安排，仅 ${completed.count} 场完成，到场率 ${Math.round(showRate * 100)}%`,
    suggestedAction: "建议检查面试通知是否提前发送，或候选人是否有时间冲突",
  }];
}

// 3. 面试完成后48h内面评未提交
function checkFeedbackSubmitDelay(ctx: FunnelInsightContext): FunnelInsight[] {
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overdueFeedbacks = ctx.interviews.filter((i: any) => {
    if (!i.completedAt) return false;
    const completedTime = new Date(i.completedAt as string).getTime();
    const hoursSinceComplete = (now.getTime() - completedTime) / (1000 * 60 * 60);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasFeedback = ctx.feedbacks.some((f: any) => f.interviewId === (i as any).id);
    return hoursSinceComplete > 48 && !hasFeedback;
  });

  if (overdueFeedbacks.length === 0) return [];

  return [{
    insightKey: "feedback_submit_delay",
    generatedBy: "system_rule",
    severity: "warning",
    triggerCondition: `${overdueFeedbacks.length} 场面试完成超过48h仍未提交面评`,
    evidence: `${overdueFeedbacks.length} 场面试已完成超过48小时但面评未提交`,
    suggestedAction: "建议提醒面试官及时提交面评，避免候选人等待过久",
    metadata: { overdueCount: overdueFeedbacks.length },
  }];
}

// 4. 某阶段平均停留 > 7天
function checkStageDurationOverdue(ctx: FunnelInsightContext): FunnelInsight[] {
  const overdueStages = ctx.stages.filter((s) => s.avgDurationDays !== null && s.avgDurationDays > 7);
  if (overdueStages.length === 0) return [];

  const stageNames = overdueStages.map((s) => `${s.key}(${s.avgDurationDays?.toFixed(1)}天)`).join(", ");

  return [{
    insightKey: "stage_duration_overdue",
    generatedBy: "system_rule",
    severity: "warning",
    triggerCondition: `${overdueStages.length} 个阶段平均停留超过7天`,
    evidence: `${stageNames} 阶段停留时间过长`,
    suggestedAction: "建议检查瓶颈阶段，优化审批流程或增加资源投入",
    metadata: { overdueStages: overdueStages.map((s) => ({ key: s.key, avgDurationDays: s.avgDurationDays })) },
  }];
}

// 5. 渠道投递多但面试通过 < 20%
function checkChannelQualityLow(ctx: FunnelInsightContext): FunnelInsight[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelStats = new Map<string, { total: number; passed: number }>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx.applications.forEach((app: any) => {
    const channel = app.candidate?.source || app.source || "unknown";
    const stat = channelStats.get(channel) || { total: 0, passed: 0 };
    stat.total++;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasPassedInterview = ctx.feedbacks.some((f: any) =>
      f.interview?.applicationId === (app as any).id &&
      ((f as any).overallRecommendation === "HIRE" || (f as any).overallRecommendation === "STRONG_HIRE")
    );
    if (hasPassedInterview) stat.passed++;
    channelStats.set(channel, stat);
  });

  const lowQualityChannels: string[] = [];
  channelStats.forEach((stat, channel) => {
    if (stat.total >= 5 && stat.passed / stat.total < 0.2) {
      lowQualityChannels.push(`${channel}(${stat.passed}/${stat.total})`);
    }
  });

  if (lowQualityChannels.length === 0) return [];

  return [{
    insightKey: "channel_quality_low",
    generatedBy: "system_rule",
    severity: "warning",
    triggerCondition: `${lowQualityChannels.length} 个渠道投递≥5但面试通过率<20%`,
    evidence: `渠道 ${lowQualityChannels.join(", ")} 投递多但面试通过率低`,
    suggestedAction: "建议评估渠道质量，调整渠道投放策略",
    metadata: { channels: lowQualityChannels },
  }];
}

// 6. 某岗位Offer风险率 > 30%
function checkOfferRiskConcentrated(ctx: FunnelInsightContext): FunnelInsight[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobOfferRisks = new Map<string, { risks: number; apps: number }>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx.applications.forEach((app: any) => {
    const jobId = (app as any).jobId || "unknown";
    const stat = jobOfferRisks.get(jobId) || { risks: 0, apps: 0 };
    stat.apps++;
    jobOfferRisks.set(jobId, stat);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx.applications.forEach((app: any) => {
    const jobId = (app as any).jobId || "unknown";
    const stat = jobOfferRisks.get(jobId);
    if (!stat) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasOfferRisk = ctx.applications.some((a: any) =>
      (a as any).id === (app as any).id && (app as any).offerRisks?.length > 0
    );
    if (hasOfferRisk) stat.risks++;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const highRiskJobs = (ctx.jobs || []).filter((j: any) => {
    const stat = jobOfferRisks.get((j as any).id);
    if (!stat || stat.apps === 0) return false;
    return stat.risks / stat.apps > 0.3;
  });

  if (highRiskJobs.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobNames = highRiskJobs.map((j: any) => (j as any).title || (j as any).id).join(", ");

  return [{
    insightKey: "offer_risk_concentrated",
    generatedBy: "system_rule",
    severity: "critical",
    triggerCondition: `${highRiskJobs.length} 个岗位Offer风险率 > 30%`,
    evidence: `岗位 ${jobNames} Offer风险率过高`,
    suggestedAction: "建议重点关注该岗位的Offer风险，检查薪酬竞争力及候选人意向",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: { jobIds: highRiskJobs.map((j: any) => (j as any).id) },
  }];
}

// 7. 逾期Action集中在卡点阶段
function checkActionOverdueAffectsFunnel(ctx: FunnelInsightContext): FunnelInsight[] {
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overdueActions = ctx.actions.filter((a: any) => {
    if (!a.dueAt) return false;
    return new Date(a.dueAt as string) < now && (a as any).status !== "resolved" && (a as any).status !== "dismissed";
  });

  if (overdueActions.length === 0) return [];

  // Count overdue actions per job
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perJob = new Map<string, number>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  overdueActions.forEach((a: any) => {
    const jobId = (a as any).jobId || "unknown";
    perJob.set(jobId, (perJob.get(jobId) || 0) + 1);
  });

  // Find bottleneck stages
  const bottleneckStages = ctx.stages
    .filter((s) => s.avgDurationDays !== null && s.avgDurationDays > 5)
    .map((s) => s.key);

  return [{
    insightKey: "action_overdue_affects_funnel",
    generatedBy: "system_rule",
    severity: "warning",
    triggerCondition: `${overdueActions.length} 个逾期Action，可能影响漏斗进度`,
    evidence: `${overdueActions.length} 个Action已逾期未处理${bottleneckStages.length > 0 ? `，卡点阶段: ${bottleneckStages.join(", ")}` : ""}`,
    suggestedAction: "建议优先处理逾期Action，尤其是处于瓶颈阶段的待办事项",
    metadata: {
      overdueCount: overdueActions.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      perJob: Object.fromEntries(perJob),
      bottleneckStages,
    },
  }];
}
