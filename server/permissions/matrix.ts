// Phase 1.1: 权限矩阵定义 + 精细 action 控制

import type { Role, Resource, Scope } from "./types";

/**
 * 权限矩阵 (Scope 级别):
 *   key: resource
 *   value: Record<Role, Scope>
 *
 * Scope 语义:
 *   ALL         - 全量数据
 *   DEPARTMENT  - 部门范围
 *   OWNED       - 自己负责范围
 *   RELATED     - 与自己相关
 *   DENY        - 无权限
 */
type MatrixMap = Record<Resource, Record<Role, Scope>>;

export const permissionMatrix: MatrixMap = {
  dashboard: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "OWNED", business_owner: "DEPARTMENT", interviewer: "DENY",
  },
  workbench: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "OWNED", business_owner: "RELATED", interviewer: "RELATED",
  },
  jobs: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "OWNED", business_owner: "DEPARTMENT", interviewer: "RELATED",
  },
  candidates: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "OWNED", business_owner: "RELATED", interviewer: "RELATED",
  },
  applications: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "OWNED", business_owner: "RELATED", interviewer: "RELATED",
  },
  interviews: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "OWNED", business_owner: "RELATED", interviewer: "RELATED",
  },
  actions: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "OWNED", business_owner: "RELATED", interviewer: "RELATED",
  },
  imports: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "DENY", business_owner: "DENY", interviewer: "DENY",
  },
  offerRisks: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "OWNED", business_owner: "RELATED", interviewer: "DENY",
  },
  reports: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "OWNED", business_owner: "DEPARTMENT", interviewer: "DENY",
  },
  aiAssistant: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "OWNED", business_owner: "DENY", interviewer: "DENY",
  },
  interviewerEnablement: {
    admin: "ALL", leader: "ALL", hrbp: "DEPARTMENT",
    recruiter: "DEPARTMENT", business_owner: "DEPARTMENT", interviewer: "RELATED",
  },
  settings: {
    admin: "ALL", leader: "ALL", hrbp: "DENY",
    recruiter: "DENY", business_owner: "DENY", interviewer: "DENY",
  },
};

/**
 * 精细 action 规则（resource × role 级别覆盖）
 *
 * 格式: `${resource}:${role}` → 允许的 action 白名单
 * 不在白名单中的 action 由通用 Scope 规则处理。
 * 只记录需要"收窄"的规则，不记录全量允许。
 */
type ActionOverrideKey = `${Resource}:${Role}`;

const actionOverrides: Partial<Record<ActionOverrideKey, string[]>> = {
  // === reports ===
  // recruiter: OWNED scope, 可 view+generate, 不可 confirm
  "reports:recruiter": ["view", "generate"],
  // business_owner: DEPARTMENT scope, 仅 view（不可 generate/confirm）
  "reports:business_owner": ["view"],

  // === imports ===
  // admin/leader/hrbp: 仅 view+import（无 export/delete 等）
  "imports:admin": ["view", "import"],
  "imports:leader": ["view", "import"],
  "imports:hrbp": ["view", "import"],

  // === aiAssistant ===
  // admin/leader/hrbp/recruiter: 仅 view+analyze
  "aiAssistant:admin": ["view", "analyze"],
  "aiAssistant:leader": ["view", "analyze"],
  "aiAssistant:hrbp": ["view", "analyze"],
  "aiAssistant:recruiter": ["view", "analyze"],

  // === offerRisks ===
  // admin/leader: view+create+update
  "offerRisks:admin": ["view", "create", "update"],
  "offerRisks:leader": ["view", "create", "update"],
  // hrbp: DEPARTMENT scope, view+create+update
  "offerRisks:hrbp": ["view", "create", "update"],
  // recruiter: OWNED scope, view+create+update
  "offerRisks:recruiter": ["view", "create", "update"],
  // business_owner: RELATED scope, 仅 view
  "offerRisks:business_owner": ["view"],

  // === settings ===
  "settings:admin": ["view", "create", "update", "delete"],
  "settings:leader": ["view"],

  // === interviews ===
  // interviewer: RELATED scope, 可 view+create (create = submit feedback)
  "interviews:interviewer": ["view", "create"],
};

/**
 * 通用 Scope → Action 规则
 *   RELATED: only view, update
 *   OWNED/DEPARTMENT/ALL: 所有 action 允许（除非被 actionOverrides 收窄）
 *   DENY: 无
 */
export function hasPermission(
  role: Role,
  resource: Resource,
  action: string
): boolean {
  const scope = permissionMatrix[resource]?.[role];
  if (scope === undefined || scope === "DENY") return false;

  // 1. 检查精细 override（resource × role 白名单）
  const key: ActionOverrideKey = `${resource}:${role}`;
  const allowed = actionOverrides[key];
  if (allowed !== undefined) {
    return allowed.includes(action);
  }

  // 2. 通用 Scope 规则
  if (scope === "RELATED") {
    return action === "view" || action === "update";
  }

  // OWNED / DEPARTMENT / ALL: 允许所有 action
  return true;
}

export function getScopeFor(
  role: Role,
  resource: Resource
): Scope {
  return permissionMatrix[resource]?.[role] ?? "DENY";
}
