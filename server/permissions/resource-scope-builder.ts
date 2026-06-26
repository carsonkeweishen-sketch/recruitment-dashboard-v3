// Phase 6.0: Resource Scope Builders
// Each resource type gets its own scope builder function.
// These replace ad-hoc scope logic scattered across repositories.
//
// Permission rules (per external review, Phase 5.2.x):
// - business_owner: only via job.businessOwnerId, NEVER via ownerId
// - recruiter: only via ownerId (application.ownerId or job.ownerId)
// - interviewer: only via interview.interviewerId
// - hrbp: via job.departmentId === scope.departmentId

import type { ScopeWhere } from "./types";

// ============================================================
// Job scope
// ============================================================
export function buildJobScopeWhere(scope: ScopeWhere): Record<string, unknown> {
  if (scope.scope === "ALL") return {};
  if (scope.scope === "DENY") return { id: "__DENY__" };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    return { departmentId: scope.departmentId };
  }

  if (scope.scope === "OWNED" && scope.userId) {
    return { ownerId: scope.userId };
  }

  if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      // interviewer sees jobs where they have interviews
      return {
        applications: { some: { interviews: { some: { interviewerId: scope.userId } } } },
      };
    }
    // business_owner: only via businessOwnerId (NOT ownerId)
    return { businessOwnerId: scope.userId };
  }

  return { id: "__DENY__" };
}

// ============================================================
// Application scope
// ============================================================
export function buildApplicationScopeWhere(
  scope: ScopeWhere
): Record<string, unknown> {
  if (scope.scope === "ALL") return {};
  if (scope.scope === "DENY") return { id: "__DENY__" };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    return { job: { departmentId: scope.departmentId } };
  }

  if (scope.scope === "OWNED" && scope.userId) {
    return { ownerId: scope.userId };
  }

  if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      return { interviews: { some: { interviewerId: scope.userId } } };
    }
    // business_owner: only via job.businessOwnerId
    return { job: { businessOwnerId: scope.userId } };
  }

  return { id: "__DENY__" };
}

// ============================================================
// Interview scope
// ============================================================
export function buildInterviewScopeWhere(
  scope: ScopeWhere
): Record<string, unknown> {
  if (scope.scope === "ALL") return {};
  if (scope.scope === "DENY") return { id: "__DENY__" };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    return {
      application: { job: { departmentId: scope.departmentId } },
    };
  }

  if (scope.scope === "OWNED" && scope.userId) {
    return {
      OR: [
        { application: { ownerId: scope.userId } },
        { application: { job: { ownerId: scope.userId } } },
      ],
    };
  }

  if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      // interviewer: only their own interviews
      return { interviewerId: scope.userId };
    }
    // business_owner: via job.businessOwnerId (NOT ownerId)
    return { application: { job: { businessOwnerId: scope.userId } } };
  }

  return { id: "__DENY__" };
}

// ============================================================
// InterviewFeedback scope
// ============================================================
export function buildInterviewFeedbackScopeWhere(
  scope: ScopeWhere
): Record<string, unknown> {
  if (scope.scope === "ALL") return {};
  if (scope.scope === "DENY") return { id: "__DENY__" };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    return {
      interview: {
        application: { job: { departmentId: scope.departmentId } },
      },
    };
  }

  if (scope.scope === "OWNED" && scope.userId) {
    return {
      OR: [
        { interview: { application: { ownerId: scope.userId } } },
        { interview: { application: { job: { ownerId: scope.userId } } } },
      ],
    };
  }

  if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      // interviewer: only their own feedback
      return { interviewerId: scope.userId };
    }
    // business_owner: via job.businessOwnerId (NOT ownerId)
    return {
      interview: {
        application: { job: { businessOwnerId: scope.userId } },
      },
    };
  }

  return { id: "__DENY__" };
}

// ============================================================
// Candidate scope (for nested application filtering)
// ============================================================
export function buildCandidateApplicationScopeWhere(
  scope: ScopeWhere
): Record<string, unknown> {
  if (scope.scope === "ALL") return {};
  if (scope.scope === "DENY") return { id: "__DENY__" };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    return { job: { departmentId: scope.departmentId } };
  }

  if (scope.scope === "OWNED" && scope.userId) {
    return { ownerId: scope.userId };
  }

  if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      return { interviews: { some: { interviewerId: scope.userId } } };
    }
    return { job: { businessOwnerId: scope.userId } };
  }

  return { id: "__DENY__" };
}

// ============================================================
// Action scope
// ============================================================
export function buildActionScopeWhere(
  scope: ScopeWhere
): Record<string, unknown> {
  if (scope.scope === "ALL") return {};
  if (scope.scope === "DENY") return { id: "__DENY__" };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    return {
      OR: [
        { job: { departmentId: scope.departmentId } },
        { application: { job: { departmentId: scope.departmentId } } },
        { interview: { application: { job: { departmentId: scope.departmentId } } } },
      ],
    };
  }

  if (scope.scope === "OWNED" && scope.userId) {
    return {
      OR: [
        { ownerId: scope.userId },
        { job: { ownerId: scope.userId } },
        { application: { ownerId: scope.userId } },
        { interview: { application: { ownerId: scope.userId } } },
      ],
    };
  }

  if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      return {
        OR: [
          { ownerId: scope.userId },
          { interview: { interviewerId: scope.userId } },
        ],
      };
    }
    // business_owner: via job.businessOwnerId (NOT ownerId)
    return {
      OR: [
        { ownerId: scope.userId },
        { job: { businessOwnerId: scope.userId } },
        { application: { job: { businessOwnerId: scope.userId } } },
        { interview: { application: { job: { businessOwnerId: scope.userId } } } },
      ],
    };
  }

  return { id: "__DENY__" };
}
