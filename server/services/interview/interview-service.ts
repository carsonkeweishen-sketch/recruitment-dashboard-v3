// Phase 6: Interview Service
// All detail/list operations use scope guardrail.
// No unscoped fallbacks. No optional role/userId.

import type { Role, ScopeWhere } from "@/server/permissions/types";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import { guardDetailScope, guardListScope } from "@/server/permissions/scope-guards";
import {
  listInterviews,
  getInterviewByIdWithScope,
  getInterviewMetrics,
} from "@/server/repositories/interview/interview-repository";

export async function listInterviewList(
  role: Role,
  userId: string,
  departmentId: string | undefined,
  filters?: { status?: string; round?: string }
) {
  requirePermission({ role, userId, departmentId }, "interviews", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "interviews");
  guardListScope(scope);

  const [interviews, metrics] = await Promise.all([
    listInterviews(scope, filters),
    getInterviewMetrics(scope),
  ]);

  return { interviews, metrics, scope: scope.scope };
}

export async function getInterviewDetail(
  id: string,
  role: Role,
  userId: string,
  departmentId: string | undefined
) {
  requirePermission({ role, userId, departmentId }, "interviews", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "interviews");
  guardDetailScope(scope);

  const interview = await getInterviewByIdWithScope(id, scope);
  if (!interview) return null;

  return interview;
}
