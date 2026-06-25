// Phase 1: 权限系统类型定义

export type Role =
  | "admin"
  | "leader"
  | "hrbp"
  | "recruiter"
  | "business_owner"
  | "interviewer";

export type Scope = "ALL" | "DEPARTMENT" | "OWNED" | "RELATED" | "DENY";

export type Resource =
  | "dashboard"
  | "workbench"
  | "jobs"
  | "candidates"
  | "applications"
  | "interviews"
  | "actions"
  | "imports"
  | "offerRisks"
  | "reports"
  | "aiAssistant"
  | "interviewerEnablement"
  | "settings";

export type Action =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "confirm"
  | "generate"
  | "analyze"
  | "import"
  | "export";

export interface PermissionContext {
  role: Role;
  userId?: string;
  departmentId?: string;
}

export interface ScopeWhere {
  scope: Scope;
  userId?: string;
  departmentId?: string;
  role?: Role;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "系统管理员",
  leader: "管理层",
  hrbp: "HRBP",
  recruiter: "招聘负责人",
  business_owner: "业务负责人",
  interviewer: "面试官",
};

export const SCOPE_LABELS: Record<Scope, string> = {
  ALL: "全量数据",
  DEPARTMENT: "部门范围",
  OWNED: "自己负责",
  RELATED: "与我相关",
  DENY: "无权限",
};

export const RESOURCE_LABELS: Record<Resource, string> = {
  dashboard: "仪表盘",
  workbench: "工作台",
  jobs: "岗位管理",
  candidates: "候选人",
  applications: "投递管理",
  interviews: "面试反馈",
  actions: "协同任务",
  imports: "数据导入",
  offerRisks: "Offer 风险",
  reports: "招聘周报",
  aiAssistant: "AI 分析",
  interviewerEnablement: "面试官赋能",
  settings: "系统设置",
};

export const ACTION_LABELS: Record<Action, string> = {
  view: "查看",
  create: "创建",
  update: "更新",
  delete: "删除",
  confirm: "确认",
  generate: "生成",
  analyze: "分析",
  import: "导入",
  export: "导出",
};
