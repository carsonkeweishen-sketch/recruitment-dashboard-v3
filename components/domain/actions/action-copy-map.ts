// Phase 7.4A: Action Center copy map

export const STATUS_LABELS: Record<string, string> = {
  open: "待处理",
  in_progress: "处理中",
  blocked: "已阻塞",
  resolved: "已解决",
  dismissed: "已忽略",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "紧急",
};

export const CATEGORY_LABELS: Record<string, string> = {
  feedback_followup: "反馈催办",
  interview_followup: "面试跟进",
  candidate_risk_followup: "候选人风险追问",
  job_calibration: "岗位画像校准",
  business_feedback: "业务反馈补充",
  offer_risk: "Offer 风险跟进",
  process_blocker: "流程卡点处理",
  data_quality: "数据质量修正",
  manual: "手动创建",
};

export const SOURCE_LABELS: Record<string, string> = {
  manual: "手动创建",
  interview_feedback: "面试反馈",
  interview_risk_signal: "面试风险信号",
  feedback_quality: "反馈质量",
  business_feedback: "业务反馈",
  profile_calibration: "岗位画像校准",
  job_pipeline: "岗位流程",
  candidate_application: "候选人投递",
  offer_risk: "Offer 风险",
  system_rule: "系统规则",
  future_ai: "未来 AI",
};

export const STATUS_BADGE_STYLES: Record<string, string> = {
  open: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  blocked: "bg-red-50 text-red-700",
  resolved: "bg-green-50 text-green-700",
  dismissed: "bg-gray-100 text-gray-500",
};

export const PRIORITY_BADGE_STYLES: Record<string, string> = {
  low: "bg-gray-100 text-gray-500",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-red-50 text-red-700",
};
