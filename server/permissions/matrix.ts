// Phase 1: 权限矩阵定义

import type { Role, Resource, Scope } from "./types";

/**
 * 权限矩阵:
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
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "OWNED",
    business_owner: "DEPARTMENT",
    interviewer: "DENY",
  },
  workbench: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "OWNED",
    business_owner: "RELATED",
    interviewer: "RELATED",
  },
  jobs: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "OWNED",
    business_owner: "DEPARTMENT",
    interviewer: "RELATED",
  },
  candidates: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "OWNED",
    business_owner: "RELATED",
    interviewer: "RELATED",
  },
  applications: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "OWNED",
    business_owner: "RELATED",
    interviewer: "RELATED",
  },
  interviews: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "OWNED",
    business_owner: "RELATED",
    interviewer: "RELATED",
  },
  actions: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "OWNED",
    business_owner: "RELATED",
    interviewer: "RELATED",
  },
  imports: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "DENY",
    business_owner: "DENY",
    interviewer: "DENY",
  },
  offerRisks: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "OWNED",
    business_owner: "RELATED",
    interviewer: "DENY",
  },
  reports: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "OWNED",
    business_owner: "DEPARTMENT",
    interviewer: "DENY",
  },
  aiAssistant: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "OWNED",
    business_owner: "DENY",
    interviewer: "DENY",
  },
  interviewerEnablement: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DEPARTMENT",
    recruiter: "DEPARTMENT",
    business_owner: "DEPARTMENT",
    interviewer: "RELATED",
  },
  settings: {
    admin: "ALL",
    leader: "ALL",
    hrbp: "DENY",
    recruiter: "DENY",
    business_owner: "DENY",
    interviewer: "DENY",
  },
};

/**
 * Action 权限检查（基于 Scope 和 Action 语义）
 *
 * 规则:
 *   - DENY scope → 所有 action 拒绝
 *   - confirm / generate / analyze / import / export → 仅 ALL/DEPARTMENT/OWNED
 *   - delete → 仅 ALL/OWNED
 */
// denylist not needed — handled inline in hasPermission()

// Scope 下可执行 confirm 的角色限制
const confirmAllowed: Scope[] = ["ALL", "DEPARTMENT", "OWNED"];
const generateAllowed: Scope[] = ["ALL", "DEPARTMENT", "OWNED"];
const analyzeAllowed: Scope[] = ["ALL", "DEPARTMENT", "OWNED"];
const importExportAllowed: Scope[] = ["ALL", "DEPARTMENT"];
const deleteAllowed: Scope[] = ["ALL", "OWNED"];

export function hasPermission(
  role: Role,
  resource: Resource,
  action: string
): boolean {
  const scope = permissionMatrix[resource]?.[role];
  if (scope === undefined || scope === "DENY") return false;

  // RELATED: only view, update
  if (scope === "RELATED") {
    return action === "view" || action === "update";
  }

  // Confirm action restrictions
  if (action === "confirm" && !confirmAllowed.includes(scope)) return false;
  if (action === "generate" && !generateAllowed.includes(scope)) return false;
  if (action === "analyze" && !analyzeAllowed.includes(scope)) return false;
  if ((action === "import" || action === "export") && !importExportAllowed.includes(scope)) return false;
  if (action === "delete" && !deleteAllowed.includes(scope)) return false;

  return true;
}

export function getScopeFor(
  role: Role,
  resource: Resource
): Scope {
  return permissionMatrix[resource]?.[role] ?? "DENY";
}
