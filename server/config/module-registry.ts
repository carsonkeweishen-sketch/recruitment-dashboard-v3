/**
 * 理然智能招聘 AI 看板 — Module Registry
 *
 * 集中管理所有产品模块的注册信息。
 * 每个模块定义：路由、导航分组、中文命名、当前阶段、角色可见性。
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

export type NavGroup = "概览" | "招聘运营" | "面试" | "风险与行动" | "分析" | "设置";

export interface ModuleDefinition {
  /** 路由路径 */
  route: string;
  /** 导航分组 */
  navGroup: NavGroup;
  /** 中文命名 */
  label: string;
  /** 模块描述 */
  description: string;
  /** 当前阶段 */
  phase: ModulePhase;
  /** 是否在导航中启用 */
  navEnabled: boolean;
  /** 可见角色（空数组 = 全部可见） */
  visibleRoles?: string[];
  /** 是否产生 Action */
  producesActions: boolean;
  /** 是否使用 AI */
  usesAI: boolean;
  /** AI 层级 */
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
    navGroup: "招聘运营",
    label: "岗位",
    description: "岗位全生命周期管理与卡点诊断 — 哪些岗位在招？哪个卡住了？",
    phase: "phase-8.2",
    navEnabled: true,
    producesActions: true,
    usesAI: true,
    aiLayer: "layer1",
  },
  {
    route: "/candidates",
    navGroup: "招聘运营",
    label: "候选人",
    description: "候选人全链路追踪与评估 — 有哪些候选人？每个人在哪个阶段？",
    phase: "phase-8.3",
    navEnabled: true,
    producesActions: true,
    usesAI: true,
    aiLayer: "layer2",
  },
  {
    route: "/interviews",
    navGroup: "面试",
    label: "面试管理",
    description: "面试安排、反馈收集与质量管理。",
    phase: "phase-8.4",
    navEnabled: true,
    producesActions: true,
    usesAI: true,
    aiLayer: "layer2",
  },
  {
    route: "/offer-risks",
    navGroup: "风险与行动",
    label: "Offer 风险",
    description: "Offer 阶段风险预警与加速决策。",
    phase: "phase-8.5",
    navEnabled: false,
    producesActions: true,
    usesAI: true,
    aiLayer: "layer1",
  },
  {
    route: "/reports",
    navGroup: "分析",
    label: "周报 / 复盘",
    description: "招聘数据的周期性复盘与决策支持。",
    phase: "phase-8.5",
    navEnabled: false,
    producesActions: false,
    usesAI: true,
    aiLayer: "layer2",
  },
  {
    route: "/knowledge",
    navGroup: "设置",
    label: "知识库",
    description: "岗位画像模板、面试评估模板的结构化管理。",
    phase: "phase-8.6",
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
    phase: "phase-8.6",
    navEnabled: false,
    producesActions: false,
    usesAI: false,
  },
];

/**
 * 获取已启用的模块列表
 */
export function getEnabledModules(): ModuleDefinition[] {
  return moduleRegistry.filter((m) => m.navEnabled);
}

/**
 * 获取指定阶段的模块
 */
export function getModulesByPhase(phase: ModulePhase): ModuleDefinition[] {
  return moduleRegistry.filter((m) => m.phase === phase);
}
