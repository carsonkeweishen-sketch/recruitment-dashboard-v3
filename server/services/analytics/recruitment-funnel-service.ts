// Phase 8.2R: Recruitment Funnel Service — main aggregation
// All computation happens here, NOT in API routes or frontend.

import type { ScopeWhere } from "@/server/permissions/types";
import * as repo from "./recruitment-funnel-repository";
import type { FunnelFilter } from "./recruitment-funnel-repository";
import { safeRate, safeAvg, FUNNEL_STAGES } from "./funnel-metric-dictionary";
import { detectFunnelDataQuality } from "./funnel-data-quality-service";
import { generateSystemInsights } from "./funnel-insight-rule-service";

// Ordered stage progression: later stages imply earlier stages were completed
const STAGE_ORDER = [
  "sourced",
  "applied",
  "resume_reviewed",
  "screen_passed",
  "interview_scheduled",
  "interview_completed",
  "feedback_submitted",
  "interview_passed",
  "offer_risk",
  "closed",
];

// Map ApplicationStage enum to funnel stage key
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function funnelStageOf(app: any): string {
  const s = app.stage as string;
  if (!s) return "sourced";
  const stageMap: Record<string, string> = {
    sourced: "sourced",
    applied: "applied",
    hr_screen: "resume_reviewed",
    business_screen: "screen_passed",
    first_interview: "interview_scheduled",
    second_interview: "interview_scheduled",
    final_interview: "interview_scheduled",
    offer_risk: "offer_risk",
    rejected: "closed",
    withdrawn: "closed",
    closed: "closed",
  };
  return stageMap[s] || s;
}

// Get the numeric index of a stage in the funnel progression
function stageIndex(key: string): number {
  const idx = STAGE_ORDER.indexOf(key);
  return idx >= 0 ? idx : STAGE_ORDER.length;
}

// Cumulative stage counts: each app counts for its stage AND all earlier stages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeStageCounts(applications: any[]) {
  const counts: Record<string, number> = {};
  for (const stage of FUNNEL_STAGES) {
    counts[stage.key] = 0;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const app of applications as any[]) {
    const currentStage = funnelStageOf(app);
    const currentIdx = stageIndex(currentStage);
    // Count this app in all stages up to and including its current stage
    for (const stageConfig of FUNNEL_STAGES) {
      const si = stageIndex(stageConfig.key);
      if (si <= currentIdx) {
        counts[stageConfig.key]++;
      }
    }
  }
  return counts;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeStageMetrics(applications: any[], interviews: any[], feedbacks: any[], actions: any[]) {
  const stageCounts = computeStageCounts(applications);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stages: any[] = [];
  let prevCount: number | null = null;

  // Duration threshold (days) per stage
  const durationThresholds: Record<string, number> = {
    resume_reviewed: 3,
    screen_passed: 5,
    interview_scheduled: 7,
    interview_completed: 3,
    feedback_submitted: 2,
  };

  // Calculate action summary per stage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getActionSummary(stageKey: string): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stageActions = actions.filter((a: any) => {
      // Match action to stage via application stage
      return true; // For now, aggregate all actions — per-stage filtering via job/app linkage
    });
    const now = new Date();
    return {
      open: stageActions.filter((a: any) => a.status === "open" && (!a.dueAt || new Date(a.dueAt) >= now)).length,
      inProgress: stageActions.filter((a: any) => a.status === "in_progress").length,
      overdue: stageActions.filter((a: any) => a.status !== "resolved" && a.status !== "dismissed" && a.dueAt && new Date(a.dueAt) < now).length,
      resolved: stageActions.filter((a: any) => a.status === "resolved" || a.status === "dismissed").length,
    };
  }

  for (const stageConfig of FUNNEL_STAGES) {
    const count = stageCounts[stageConfig.key] || 0;

    const conversionRate = prevCount !== null && prevCount > 0
      ? safeRate(count, prevCount)
      : stageConfig.key === "sourced" ? 1 : null;

    const dropoffCount = prevCount !== null ? prevCount - count : null;
    const dropoffRate = prevCount !== null && prevCount > 0
      ? safeRate(dropoffCount!, prevCount)
      : null;

    // Estimate stage duration from interview data
    let avgDurationDays: number | null = null;
    if (stageConfig.key === "interview_scheduled" || stageConfig.key === "interview_completed") {
      const relevantInterviews = interviews.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (i: any) => i.scheduledAt && i.completedAt
      );
      if (relevantInterviews.length > 0) {
        const totalDuration = relevantInterviews.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (sum: number, i: any) => sum + (new Date(i.completedAt!).getTime() - new Date(i.scheduledAt!).getTime()),
          0
        ) / (1000 * 60 * 60 * 24);
        avgDurationDays = safeAvg(totalDuration, relevantInterviews.length);
      }
    }

    const threshold = durationThresholds[stageConfig.key] || null;
    const actionSummary = getActionSummary(stageConfig.key);

    stages.push({
      stageKey: stageConfig.key,
      label: stageConfig.label,
      count,
      conversionRate,
      dropoffCount,
      dropoffRate,
      avgDurationDays,
      durationThresholdDays: threshold,
      isBottleneck: false, // computed below
      bottleneckReason: undefined as string | undefined,
      actionSummary,
      systemInsight: null as any,
    });

    prevCount = count;
  }

  // Compute bottlenecks: find max dropoff stage (excluding sourced/closed)
  let maxDropoff = 0;
  let bottleneckIdx = -1;
  for (let i = 1; i < stages.length - 1; i++) {
    const dc = stages[i].dropoffCount;
    if (dc !== null && dc > maxDropoff) {
      maxDropoff = dc;
      bottleneckIdx = i;
    }
  }
  // Also check for low conversion
  if (bottleneckIdx < 0) {
    let minConv = 1;
    for (let i = 1; i < stages.length - 1; i++) {
      const cr = stages[i].conversionRate;
      if (cr !== null && cr < minConv && cr < 0.7) {
        minConv = cr;
        bottleneckIdx = i;
      }
    }
  }
  if (bottleneckIdx >= 0) {
    stages[bottleneckIdx].isBottleneck = true;
    stages[bottleneckIdx].bottleneckReason = maxDropoff > 0
      ? `最大流失阶段：流失 ${maxDropoff} 人`
      : "最低转化率阶段";
  }

  return stages;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeSummary(stages: ReturnType<typeof computeStageMetrics>, actions: any[]) {
  const totalApplications = stages.find(s => s.stageKey === "applied")?.count || 0;
  const screenPassed = stages.find(s => s.stageKey === "screen_passed")?.count || 0;
  const interviewCompleted = stages.find(s => s.stageKey === "interview_completed")?.count || 0;
  const feedbackSubmitted = stages.find(s => s.stageKey === "feedback_submitted")?.count || 0;
  const interviewPassed = stages.find(s => s.stageKey === "interview_passed")?.count || 0;
  const offerRisk = stages.find(s => s.stageKey === "offer_risk")?.count || 0;
  const closed = stages.find(s => s.stageKey === "closed")?.count || 0;

  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overdueActions = actions.filter((a: any) => {
    if (!a.dueAt) return false;
    return new Date(a.dueAt) < now && a.status !== "resolved" && a.status !== "dismissed";
  });

  return {
    applications: totalApplications,
    resumePassRate: safeRate(screenPassed, totalApplications),
    feedbackSubmitRate: safeRate(feedbackSubmitted, interviewCompleted),
    offerRiskRate: safeRate(offerRisk, totalApplications),
    avgStageDurationDays: safeAvg(
      stages.reduce((sum, s) => sum + (s.avgDurationDays || 0), 0),
      stages.filter(s => s.avgDurationDays !== null).length
    ),
    overdueActionRate: safeRate(overdueActions.length, actions.length),
    closedCount: closed,
    interviewPassCount: interviewPassed,
    totalCandidates: stages.find(s => s.stageKey === "sourced")?.count || 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeByJob(applications: any[], stages: ReturnType<typeof computeStageMetrics>, interviews: any[], feedbacks: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobMap = new Map<string, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const app of applications as any[]) {
    const jobId = app.jobId || "unknown";
    const job = app.job;
    if (!jobMap.has(jobId)) {
      jobMap.set(jobId, {
        jobId,
        jobTitle: job?.title || "Unknown",
        departmentId: job?.departmentId,
        applications: 0,
        screenPassed: 0,
        interviewCompleted: 0,
        interviewPassed: 0,
        offerRisks: 0,
        closed: 0,
      });
    }
    const entry = jobMap.get(jobId);
    entry.applications++;
    const s = funnelStageOf(app);
    if (s === "screen_passed" || s === "interview_scheduled" || s === "interview_completed" || s === "feedback_submitted" || s === "interview_passed") entry.screenPassed++;
    if (s === "interview_completed" || s === "feedback_submitted" || s === "interview_passed") entry.interviewCompleted++;
    if (s === "interview_passed") entry.interviewPassed++;
    if (s === "offer_risk") entry.offerRisks++;
    if (s === "closed") entry.closed++;
  }

  return Array.from(jobMap.values()).map((entry) => ({
    ...entry,
    screenPassRate: safeRate(entry.screenPassed, entry.applications),
    interviewPassRate: safeRate(entry.interviewPassed, entry.interviewCompleted),
    offerRiskRate: safeRate(entry.offerRisks, entry.applications),
  })).sort((a, b) => {
    // Sort: worst conversion first (by screenPassRate, then interviewPassRate)
    const aRate = a.screenPassRate ?? 1;
    const bRate = b.screenPassRate ?? 1;
    return aRate - bRate;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeByChannel(applications: any[], feedbacks: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelMap = new Map<string, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const app of applications as any[]) {
    const channel = app.candidate?.source || app.source || "unknown";
    if (!channelMap.has(channel)) {
      channelMap.set(channel, {
        channel,
        applications: 0,
        screenPassed: 0,
        interviewCompleted: 0,
        interviewPassed: 0,
      });
    }
    const entry = channelMap.get(channel);
    entry.applications++;
    const s = funnelStageOf(app);
    if (s === "screen_passed" || s === "interview_scheduled" || s === "interview_completed" || s === "feedback_submitted" || s === "interview_passed") entry.screenPassed++;
    if (s === "interview_completed" || s === "feedback_submitted" || s === "interview_passed") entry.interviewCompleted++;
    if (s === "interview_passed") entry.interviewPassed++;
  }

  return Array.from(channelMap.values()).map((entry) => ({
    ...entry,
    screenPassRate: safeRate(entry.screenPassed, entry.applications),
    interviewPassRate: safeRate(entry.interviewPassed, entry.interviewCompleted),
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeActionImpact(actions: any[], applications: any[]) {
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const open = actions.filter((a: any) => a.status === "open");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overdue = actions.filter((a: any) => {
    if (!a.dueAt) return false;
    return new Date(a.dueAt) < now && a.status !== "resolved" && a.status !== "dismissed";
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolved = actions.filter((a: any) => a.status === "resolved" || a.status === "dismissed");

  // Calculate closure rate
  const closureRate = actions.length > 0 ? safeRate(resolved.length, actions.length) : null;

  // Count actions per category
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perCategory: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const a of actions as any[]) {
    const cat = a.category || "other";
    perCategory[cat] = (perCategory[cat] || 0) + 1;
  }

  return {
    total: actions.length,
    open: open.length,
    overdue: overdue.length,
    resolved: resolved.length,
    closureRate,
    perCategory,
    overdueList: overdue.slice(0, 10).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => ({
        id: a.id,
        title: a.title,
        dueAt: a.dueAt,
        priority: a.priority,
        jobTitle: a.job?.title || null,
      })
    ),
  };
}

// ============================================================================
// Main export — the only function API routes should call
// ============================================================================
export async function getFunnelAnalysis(
  scope: ScopeWhere,
  filter: FunnelFilter
) {
  // 1. Fetch all scoped data
  const [applications, interviews, feedbacks, actions, offerRisks, jobs] = await Promise.all([
    repo.findApplicationsForFunnel(scope, filter),
    repo.findInterviewsForFunnel(scope, filter),
    repo.findFeedbacksForFunnel(scope, filter),
    repo.findActionsForFunnel(scope, filter),
    repo.findOfferRisksForFunnel(scope, filter),
    repo.findJobsForFunnel(scope),
  ]);

  // 2. Compute stage metrics
  const stages = computeStageMetrics(applications, interviews, feedbacks, actions);

  // 3. Compute summary
  const summary = computeSummary(stages, actions);

  // 4. Compute by-job and by-channel
  const byJob = computeByJob(applications, stages, interviews, feedbacks);
  const byChannel = computeByChannel(applications, feedbacks);

  // 5. Compute action impact
  const actionImpact = computeActionImpact(actions, applications);

  // 6. Data quality
  const dataQualityWarnings = detectFunnelDataQuality({ applications, interviews, feedbacks, actions });

  // 7. System rule insights (map stageKey → key for insight context)
  const stagesForInsight = stages.map(s => ({
    key: s.stageKey,
    count: s.count,
    conversionRate: s.conversionRate,
    dropoffRate: s.dropoffRate,
    avgDurationDays: s.avgDurationDays,
  }));
  const insights = generateSystemInsights({
    stages: stagesForInsight,
    applications,
    interviews,
    feedbacks,
    actions,
    jobs,
    dataQualityWarnings,
  });

  // 8. Attach insights to bottleneck stages
  const bottleneckStage = stages.find(s => s.isBottleneck);
  if (bottleneckStage && insights.length > 0) {
    bottleneckStage.systemInsight = {
      title: insights[0].insightKey,
      triggerCondition: insights[0].triggerCondition,
      evidence: [insights[0].evidence],
      suggestedAction: insights[0].suggestedAction,
      generatedBy: "system_rule",
    };
  }

  // 9. Compute top bottleneck summary for header
  const topBottleneck = bottleneckStage
    ? {
        stageKey: bottleneckStage.stageKey,
        stageLabel: bottleneckStage.label,
        dropoffCount: bottleneckStage.dropoffCount,
        conversionRate: bottleneckStage.conversionRate,
        avgDurationDays: bottleneckStage.avgDurationDays,
        durationThresholdDays: bottleneckStage.durationThresholdDays,
        reason: bottleneckStage.bottleneckReason,
        actionSummary: bottleneckStage.actionSummary,
        systemInsight: bottleneckStage.systemInsight,
      }
    : null;

  return {
    summary,
    stages,
    topBottleneck,
    byJob,
    byChannel,
    actionImpact,
    insights,
    dataQualityWarnings,
    scopeInfo: {
      role: scope.scope,
      scope: scope.scope === "ALL" ? "global" : scope.scope === "DENY" ? "none" : "scoped",
    },
    generatedAt: new Date().toISOString(),
  };
}
