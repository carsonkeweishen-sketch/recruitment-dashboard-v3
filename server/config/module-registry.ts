/**
 * 理然智能招聘 AI 看板 — Module Registry（产品边界收口后）
 *
 * 本产品定位：招聘判断、风险识别、面试质量、候选人评估、岗位卡点、行动闭环
 * 周报由外部产品承接，面试流程推进由 Moka 承接
 */

export type ModulePhase =
  | "done"
  | "phase-8.1"
  | "phase-8.2"
  | "phase-8.3"
  | "phase-8.4"
  | "phase-8.5"
  | "phase-8.6"
  | "phase-8.7"
  | "phase-9+";

export type NavGroup = "概览" | "风险与行动" | "招聘分析" | "面试质量" | "风险分析" | "知识资产" | "设置";

export interface ModuleDefinition {
  route: string;
  navGroup: NavGroup;
  label: string;
  description: string;
  phase: ModulePhase;
  navEnabled: boolean;
  visibleRoles?: string[];
  producesActions: boolean;
  usesAI: boolean;
  aiLayer?: "layer1" | "layer2" | "layer3";
}

export const moduleRegistry: ModuleDefinition[] = [
  {
    route: "/dashboard",
    navGroup: "概览",
    label: "招聘总览",
    description: "基于招聘过程数据，辅助识别招聘风险、流程卡点和优先处理事项。",
    phase: "phase-8.1",
    navEnabled: true,
    producesActions: true,
    usesAI: true,
    aiLayer: "layer1",
  },
  {
    route: "/actions",
    navGroup: "风险与行动",
    label: "风险行动中心",
    description: "所有招聘风险的统一处理入口 — 待办、逾期、闭环管理。",
    phase: "done",
    navEnabled: true,
    producesActions: true,
    usesAI: true,
    aiLayer: "layer1",
  },
  {
    route: "/jobs",
    navGroup: "招聘分析",
    label: "岗位分析",
    description: "岗位全生命周期分析与卡点诊断 — 哪些岗位在招？哪个卡住了？为什么？",
    phase: "phase-8.2",
    navEnabled: true,
    producesActions: true,
    usesAI: true,
    aiLayer: "layer1",
  },
  {
    route: "/candidates",
    navGroup: "招聘分析",
    label: "候选人评估",
    description: "候选人全链路追踪与风险评估 — 有哪些候选人？每个人在哪个阶段？有什么风险？",
    phase: "phase-8.3",
    navEnabled: true,
    producesActions: true,
    usesAI: true,
    aiLayer: "layer2",
  },
  {
    route: "/interviews",
    navGroup: "面试质量",
    label: "面试质量",
    description: "面试反馈质量分析、证据完整度评估、偏差风险识别。",
    phase: "phase-8.4",
    navEnabled: true,
    producesActions: true,
    usesAI: true,
    aiLayer: "layer2",
  },
  {
    route: "/offer-risks",
    navGroup: "风险分析",
    label: "Offer 风险",
    description: "Offer 阶段风险预警与分析 — 薪资差距、竞品Offer、决策延迟。",
    phase: "phase-8.6",
    navEnabled: false,
    producesActions: true,
    usesAI: true,
    aiLayer: "layer1",
  },
  {
    route: "/knowledge",
    navGroup: "知识资产",
    label: "知识库 / 模板库",
    description: "岗位画像模板、面试评估模板的结构化管理。",
    phase: "phase-8.7",
    navEnabled: false,
    producesActions: false,
    usesAI: true,
    aiLayer: "layer2",
  },
  {
    route: "/settings",
    navGroup: "设置",
    label: "设置",
    description: "部门、用户、角色与权限的基础管理。",
    phase: "phase-9+",
    navEnabled: false,
    producesActions: false,
    usesAI: false,
  },
];

export function getEnabledModules(): ModuleDefinition[] {
  return moduleRegistry.filter((m) => m.navEnabled);
}

export function getModulesByPhase(phase: ModulePhase): ModuleDefinition[] {
  return moduleRegistry.filter((m) => m.phase === phase);
}
