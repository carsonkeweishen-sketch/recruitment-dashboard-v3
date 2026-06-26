// Phase 6.0: Unified Scope Context
// All detail services MUST use ScopeContext — no optional role/userId allowed.
// This prevents the "service fallback to unscoped query" pattern that caused
// Phase 5.2.x rework.

import type { Role, ScopeWhere } from "./types";

export type ScopeContext = {
  role: Role;
  userId: string;
  departmentId?: string | null;
};

/**
 * Validate that a scope context is complete.
 * Throws if role or userId is missing — prevents silent fallback.
 */
export function assertScopeContext(
  scope: ScopeContext | { role?: string; userId?: string }
): asserts scope is ScopeContext {
  if (!scope.role) {
    throw new ScopeContextError("Permission context is required: missing role");
  }
  if (!scope.userId) {
    throw new ScopeContextError("Permission context is required: missing userId");
  }
}

/**
 * Create a ScopeContext from a partial context, with runtime validation.
 */
export function createScopeContext(
  role: Role,
  userId: string,
  departmentId?: string | null
): ScopeContext {
  const ctx: ScopeContext = { role, userId, departmentId: departmentId ?? null };
  assertScopeContext(ctx);
  return ctx;
}

/**
 * Convert a ScopeWhere (from buildScopeWhere) to a ScopeContext.
 * ScopeWhere comes from the permission check pipeline; this normalizes it
 * for use in repository functions.
 */
export function scopeWhereToContext(scope: ScopeWhere): ScopeContext {
  if (!scope.userId) {
    throw new ScopeContextError(
      "Cannot convert ScopeWhere to ScopeContext: missing userId"
    );
  }
  if (!scope.role) {
    throw new ScopeContextError(
      "Cannot convert ScopeWhere to ScopeContext: missing role"
    );
  }
  return {
    role: scope.role,
    userId: scope.userId,
    departmentId: scope.departmentId ?? null,
  };
}

export class ScopeContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScopeContextError";
  }
}
