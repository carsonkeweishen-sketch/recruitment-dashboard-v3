// Phase 8.12: Module Registry — 统一模块元数据
export const MODULES: Record<string, { label: string; path: string; group: string; enabled: boolean }> = {
  dashboard: { label: "招聘总览", path: "/dashboard", group: "概览", enabled: true },
  jobs: { label: "岗位中心", path: "/jobs", group: "招聘运营", enabled: true },
  candidates: { label: "候选人中心", path: "/candidates", group: "招聘运营", enabled: true },
  interviews: { label: "面试管理", path: "/interviews", group: "面试", enabled: true },
  "interview-quality": { label: "面试质量", path: "/interview-quality", group: "面试", enabled: true },
  actions: { label: "行动中心", path: "/actions", group: "风险与行动", enabled: true },
  "offer-risks": { label: "Offer 风险", path: "/offer-risks", group: "风险与行动", enabled: true },
  "analytics/recruitment-funnel": { label: "招聘漏斗", path: "/analytics/recruitment-funnel", group: "分析", enabled: true },
  media: { label: "音视频转写", path: "/media", group: "AI 与知识", enabled: true },
  knowledge: { label: "知识库", path: "/knowledge", group: "AI 与知识", enabled: true },
  "data-sources": { label: "资料接入", path: "/data-sources", group: "AI 与知识", enabled: true },
  integrations: { label: "集成中心", path: "/integrations", group: "集成与设置", enabled: true },
};
