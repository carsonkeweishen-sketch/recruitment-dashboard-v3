// Phase 6.0: Scope Guards
// Runtime guard functions that enforce scope discipline.
// These are called at the entry point of detail services to prevent
// the "optional role → unscoped fallback" anti-pattern.
//
// Usage in a service:
//   import { guardDetailScope, requireScoped } from "./scope-guards";
//   export async function getInterviewDetail(id, scope) {
//     guardDetailScope(scope);
//     const result = await interviewRepo.getInterviewByIdWithScope(id, scope);
//     if (!result) throw notFoundOrDenied(id, "Interview");
//     return result;
//   }

import type { ScopeWhere } from "./types";

/**
 * Guard: detail service MUST receive a valid scope.
 * Throws if scope is missing, incomplete, or would cause an unscoped query.
 */
export function guardDetailScope(scope: ScopeWhere): void {
  if (!scope) {
    throw new ScopeGuardError(
      "Scope is required for detail access. Do not call detail service without scope."
    );
  }
  if (!scope.scope) {
    throw new ScopeGuardError(
      "Scope.scope is required for detail access."
    );
  }
  if (scope.scope === "DENY") {
    throw new ScopeGuardError(
      "Access denied: scope is DENY."
    );
  }
  // RELATED scope must have a role to differentiate interviewer vs business_owner
  if (scope.scope === "RELATED" && !scope.role) {
    throw new ScopeGuardError(
      "Scope.role is required when scope is RELATED."
    );
  }
}

/**
 * Guard: list service MUST receive a valid scope.
 */
export function guardListScope(scope: ScopeWhere): void {
  guardDetailScope(scope);
}

/**
 * Guard: write operation MUST have a valid userId.
 */
export function guardWriteScope(scope: ScopeWhere): void {
  guardDetailScope(scope);
  if (!scope.userId) {
    throw new ScopeGuardError(
      "userId is required for write operations."
    );
  }
}

/**
 * Guard: confirm operation (business_owner) — must NOT use ownerId.
 * Enforces the rule that business_owner only accesses via businessOwnerId.
 */
export function guardBusinessOwnerScope(scope: ScopeWhere): void {
  guardDetailScope(scope);
  if (scope.role === "business_owner" && scope.scope !== "RELATED") {
    throw new ScopeGuardError(
      "business_owner must have RELATED scope (via businessOwnerId), not " + scope.scope
    );
  }
}

/**
 * Guard: interviewer write — can only operate on their own interviews.
 */
export function guardInterviewerWriteScope(
  scope: ScopeWhere,
  targetInterviewerId: string
): void {
  guardWriteScope(scope);
  if (scope.role === "interviewer" && scope.userId !== targetInterviewerId) {
    throw new ScopeGuardError(
      "interviewer can only submit feedback for their own interviews"
    );
  }
}

/**
 * Error class for scope guard failures.
 */
export class ScopeGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScopeGuardError";
  }
}

/**
 * Re-export the scope context assertion from scope-context.ts
 * for convenient single-import usage.
 */
export { assertScopeContext, createScopeContext } from "./scope-context";
