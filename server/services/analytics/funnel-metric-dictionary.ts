// Phase 8.2R: Unified metric dictionary for recruitment funnel
// All formulas, rate calculations, and stage configs live here.
// Every API and UI MUST use these functions — no frontend calculation.

export function safeRate(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
  if (denominator <= 0) return null;
  return Number((numerator / denominator).toFixed(4));
}

export function formatRateForUi(rate: number | null): string {
  if (rate === null) return '---';
  return `${Math.round(rate * 100)}%`;
}

export function safeAvg(total: number, count: number): number | null {
  if (!Number.isFinite(total) || !Number.isFinite(count) || count <= 0) return null;
  return Number((total / count).toFixed(1));
}

export const FUNNEL_STAGES = [
  { key: 'sourced', label: '已进入人才池', dataSource: 'Candidate.createdAt' },
  { key: 'applied', label: '已投递', dataSource: 'Application.createdAt' },
  { key: 'resume_reviewed', label: '简历已评估', dataSource: 'Application.stage >= hr_screen' },
  { key: 'screen_passed', label: '简历通过', dataSource: 'Application.stage >= business_screen' },
  { key: 'interview_scheduled', label: '已安排面试', dataSource: 'Interview.scheduledAt' },
  { key: 'interview_completed', label: '面试完成', dataSource: 'Interview.completedAt' },
  { key: 'feedback_submitted', label: '面评已提交', dataSource: 'InterviewFeedback.submittedAt' },
  { key: 'interview_passed', label: '面试通过', dataSource: 'InterviewFeedback.overallRecommendation in HIRE/STRONG_HIRE' },
  { key: 'offer_risk', label: 'Offer 风险', dataSource: 'OfferRisk' },
  { key: 'closed', label: '已关闭/已入职', dataSource: 'Application.stage = closed' },
] as const;

export type FunnelStageKey = typeof FUNNEL_STAGES[number]['key'];
