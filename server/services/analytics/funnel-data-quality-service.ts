// Phase 8.2R: Data Quality Detection for Recruitment Funnel
export interface DataQualityWarning {
  field: string;
  message: string;
  severity: 'info' | 'warning';
}

export function detectFunnelDataQuality(data: {
  applications: unknown[];
  interviews: unknown[];
  feedbacks: unknown[];
  actions: unknown[];
}): DataQualityWarning[] {
  const warnings: DataQualityWarning[] = [];

  if (data.applications.length === 0) {
    warnings.push({ field: 'applications', message: '当前筛选条件下无投递数据', severity: 'info' });
  }

  // Check for missing stage transitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const missingStage = data.applications.filter((a: any) => !a.stage);
  if (missingStage.length > 0) {
    warnings.push({ field: 'stage', message: `${missingStage.length} 条投递缺少阶段信息，阶段停留时长按可用数据计算`, severity: 'warning' });
  }

  // Check for missing interview dates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const missingDates = data.interviews.filter((i: any) => !i.scheduledAt || !i.completedAt);
  if (missingDates.length > 0) {
    warnings.push({ field: 'interview_dates', message: `${missingDates.length} 条面试缺少时间信息`, severity: 'warning' });
  }

  // Check for denominator zeros
  if (data.applications.length > 0 && data.interviews.length === 0) {
    warnings.push({ field: 'interviews', message: '有投递但无面试数据，面试相关转化率无法计算', severity: 'warning' });
  }

  // Check for feedback completeness
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const missingFeedback = data.interviews.filter((i: any) => i.completedAt && data.feedbacks.filter((f: any) => f.interviewId === i.id).length === 0);
  if (missingFeedback.length > 0) {
    warnings.push({ field: 'feedbacks', message: `${missingFeedback.length} 场已完成面试缺少面评，可能影响面试通过率`, severity: 'warning' });
  }

  return warnings;
}
