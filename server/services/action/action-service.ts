// Phase 7: Action Service
// CRUD + resolve/dismiss with scope guardrail and ActivityLog.

import type { Role } from "@/server/permissions/types";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import { guardDetailScope, guardListScope, guardWriteScope } from "@/server/permissions/scope-guards";
import {
  listActions,
  getActionByIdWithScope,
  createAction,
  updateAction,
  resolveAction,
  dismissAction,
  getActionsByJob,
  getActionsByCandidate,
  getActionMetrics,
} from "@/server/repositories/action/action-repository";
import {
  logActionCreated,
  logActionResolved,
  logActionDismissed,
} from "@/server/services/business-feedback/activity-log-helper";
import type { CreateActionInput, UpdateActionInput } from "@/server/repositories/action/action-repository";

const VALID_CATEGORIES = [
  "feedback_followup", "interview_followup", "candidate_risk_followup",
  "job_calibration", "business_feedback", "offer_risk",
  "process_blocker", "data_quality", "manual",
];
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];
const VALID_STATUSES = ["open", "in_progress", "blocked", "resolved", "dismissed"];

export class ActionError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ActionError";
    this.statusCode = statusCode;
  }
}

export async function listActionList(
  role: Role, userId: string, departmentId: string | undefined,
  filters?: Record<string, string>
) {
  requirePermission({ role, userId, departmentId }, "actions", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "actions");
  guardListScope(scope);

  const [actions, metrics] = await Promise.all([
    listActions(scope, {
      status: filters?.status,
      priority: filters?.priority,
      category: filters?.category,
      ownerId: filters?.ownerId,
      jobId: filters?.jobId,
      candidateId: filters?.candidateId,
      overdueOnly: filters?.overdueOnly === "true",
    }),
    getActionMetrics(scope),
  ]);

  return { actions, metrics, scope: scope.scope };
}

export async function getActionDetail(
  id: string, role: Role, userId: string, departmentId: string | undefined
) {
  requirePermission({ role, userId, departmentId }, "actions", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "actions");
  guardDetailScope(scope);
  return getActionByIdWithScope(id, scope);
}

export async function createActionItem(
  role: Role, userId: string, departmentId: string | undefined,
  input: Omit<CreateActionInput, "createdById">
) {
  requirePermission({ role, userId, departmentId }, "actions", "create");
  const scope = buildScopeWhere({ role, userId, departmentId }, "actions");
  guardWriteScope(scope);

  if (!input.title?.trim()) throw new ActionError("title is required", 400);
  if (!VALID_CATEGORIES.includes(input.category)) throw new ActionError(`Invalid category: ${input.category}`, 400);
  if (!VALID_PRIORITIES.includes(input.priority)) throw new ActionError(`Invalid priority: ${input.priority}`, 400);

  const action = await createAction({ ...input, createdById: userId });

  await logActionCreated({
    actorId: userId, actionId: action.id,
    category: action.category, priority: action.priority,
    ownerId: action.ownerId ?? undefined, jobId: action.jobId ?? undefined,
    candidateId: action.candidateId ?? undefined, applicationId: action.applicationId ?? undefined,
    interviewId: action.interviewId ?? undefined,
    sourceType: action.sourceType, sourceRefId: action.sourceRefId ?? undefined,
  });

  return action;
}

export async function updateActionItem(
  id: string, role: Role, userId: string, departmentId: string | undefined,
  input: UpdateActionInput
) {
  requirePermission({ role, userId, departmentId }, "actions", "update");
  const scope = buildScopeWhere({ role, userId, departmentId }, "actions");
  guardDetailScope(scope);

  const existing = await getActionByIdWithScope(id, scope);
  if (!existing) throw new ActionError("Action not found or access denied", 404);
  if (input.priority && !VALID_PRIORITIES.includes(input.priority)) throw new ActionError(`Invalid priority: ${input.priority}`, 400);
  if (input.status && !VALID_STATUSES.includes(input.status)) throw new ActionError(`Invalid status: ${input.status}`, 400);

  return updateAction(id, input);
}

export async function resolveActionItem(
  id: string, role: Role, userId: string, departmentId: string | undefined,
  resolutionNote: string
) {
  requirePermission({ role, userId, departmentId }, "actions", "update");
  const scope = buildScopeWhere({ role, userId, departmentId }, "actions");
  guardDetailScope(scope);

  if (!resolutionNote?.trim()) throw new ActionError("resolutionNote is required", 400);

  const existing = await getActionByIdWithScope(id, scope);
  if (!existing) throw new ActionError("Action not found or access denied", 404);
  if (existing.status === "resolved") throw new ActionError("Action already resolved", 409);

  const resolved = await resolveAction(id, userId, resolutionNote.trim());

  await logActionResolved({
    actorId: userId, actionId: resolved.id,
    category: resolved.category, priority: resolved.priority,
    ownerId: resolved.ownerId ?? undefined, jobId: resolved.jobId ?? undefined,
    candidateId: resolved.candidateId ?? undefined, applicationId: resolved.applicationId ?? undefined,
    interviewId: resolved.interviewId ?? undefined,
    sourceType: resolved.sourceType, sourceRefId: resolved.sourceRefId ?? undefined,
  });

  return resolved;
}

export async function dismissActionItem(
  id: string, role: Role, userId: string, departmentId: string | undefined,
  dismissedReason: string
) {
  requirePermission({ role, userId, departmentId }, "actions", "update");
  const scope = buildScopeWhere({ role, userId, departmentId }, "actions");
  guardDetailScope(scope);

  if (!dismissedReason?.trim()) throw new ActionError("dismissedReason is required", 400);

  const existing = await getActionByIdWithScope(id, scope);
  if (!existing) throw new ActionError("Action not found or access denied", 404);

  const dismissed = await dismissAction(id, userId, dismissedReason.trim());

  await logActionDismissed({
    actorId: userId, actionId: dismissed.id,
    category: dismissed.category, priority: dismissed.priority,
    ownerId: dismissed.ownerId ?? undefined, jobId: dismissed.jobId ?? undefined,
    candidateId: dismissed.candidateId ?? undefined, applicationId: dismissed.applicationId ?? undefined,
    interviewId: dismissed.interviewId ?? undefined,
    sourceType: dismissed.sourceType, sourceRefId: dismissed.sourceRefId ?? undefined,
  });

  return dismissed;
}

export async function getJobActionList(
  jobId: string, role: Role, userId: string, departmentId: string | undefined
) {
  requirePermission({ role, userId, departmentId }, "actions", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "actions");
  guardListScope(scope);
  return getActionsByJob(jobId, scope);
}

export async function getCandidateActionList(
  candidateId: string, role: Role, userId: string, departmentId: string | undefined
) {
  requirePermission({ role, userId, departmentId }, "actions", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "actions");
  guardListScope(scope);
  return getActionsByCandidate(candidateId, scope);
}

export async function getDashboardActionSummary(
  role: Role, userId: string, departmentId: string | undefined
) {
  requirePermission({ role, userId, departmentId }, "actions", "view");
  const scope = buildScopeWhere({ role, userId, departmentId }, "actions");
  guardListScope(scope);
  return getActionMetrics(scope);
}
