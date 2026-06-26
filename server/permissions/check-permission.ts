// Phase 1: 服务端权限校验工具
// Phase 6.0: 新增 ScopeContext 和 scope guards 导出

import type { Role, Resource, Action, PermissionContext, ScopeWhere } from "./types";
import { hasPermission, getScopeFor } from "./matrix";

// Re-export scope guardrail for convenience
export {
  type ScopeContext,
  assertScopeContext,
  createScopeContext,
  scopeWhereToContext,
  ScopeContextError,
} from "./scope-context";

export {
  guardDetailScope,
  guardListScope,
  guardWriteScope,
  guardBusinessOwnerScope,
  guardInterviewerWriteScope,
  ScopeGuardError,
} from "./scope-guards";

export {
  buildJobScopeWhere,
  buildApplicationScopeWhere,
  buildInterviewScopeWhere,
  buildInterviewFeedbackScopeWhere,
  buildCandidateApplicationScopeWhere,
} from "./resource-scope-builder";

/**
 * 检查当前用户是否���有指定资源/操作的权限。
 * 无权限时抛出 PermissionDeniedError。
 */
export function requirePermission(
  context: PermissionContext,
  resource: Resource,
  action: Action
): void {
  if (!hasPermission(context.role, resource, action)) {
    throw new PermissionDeniedError(context.role, resource, action);
  }
}

/**
 * 构建数据范围过滤条件。
 * Phase 1 返回结构化占位，Phase 2+ 用于 Prisma where 子句。
 */
export function buildScopeWhere(
  context: PermissionContext,
  resource: Resource
): ScopeWhere {
  const scope = getScopeFor(context.role, resource);
  return {
    scope,
    userId: context.userId,
    departmentId: context.departmentId,
    role: context.role,
  };
}

/**
 * 获取当前角色在指定资源上的所有允许操作
 */
export function getAllowedActions(
  role: Role,
  resource: Resource
): Action[] {
  const allActions: Action[] = [
    "view", "create", "update", "delete",
    "confirm", "generate", "analyze", "import", "export",
  ];
  return allActions.filter((a) => hasPermission(role, resource, a));
}

export class PermissionDeniedError extends Error {
  public readonly role: Role;
  public readonly resource: Resource;
  public readonly action: Action;

  constructor(role: Role, resource: Resource, action: Action) {
    super(`Permission denied: ${role} cannot ${action} on ${resource}`);
    this.name = "PermissionDeniedError";
    this.role = role;
    this.resource = resource;
    this.action = action;
  }
}
