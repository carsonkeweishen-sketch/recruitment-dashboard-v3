// Phase 5.1: Profile Calibration Repository (with structured status fields)
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface CreateCalibrationInput {
  jobId: string;
  sourceFeedbackIds: string[];
  calibrationReason?: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  createdBy: string;
}

export async function getCalibrationsByJob(jobId: string, scope: ScopeWhere) {
  if (scope.scope === "DENY" || (scope.scope === "RELATED" && scope.role === "interviewer")) return [];

  const where: Record<string, unknown> = { jobId };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    where.job = { departmentId: scope.departmentId };
  } else if (scope.scope === "OWNED" && scope.userId) {
    where.OR = [{ job: { ownerId: scope.userId } }, { createdBy: scope.userId }];
  } else if (scope.scope === "RELATED" && scope.userId) {
    where.OR = [{ job: { businessOwnerId: scope.userId } }, { createdBy: scope.userId }];
  }

  return prisma.profileCalibration.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

/** @internal Internal use only — API routes must use getCalibrationByIdWithScope() */
export async function getCalibrationById(id: string) {
  return prisma.profileCalibration.findUnique({
    where: { id },
  });
}

export async function getCalibrationByIdWithScope(id: string, scope: ScopeWhere) {
  if (scope.scope === "DENY" || (scope.scope === "RELATED" && scope.role === "interviewer")) return null;
  const where: Record<string, unknown> = { id };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    where.job = { departmentId: scope.departmentId };
  } else if (scope.scope === "OWNED" && scope.userId) {
    where.OR = [{ job: { ownerId: scope.userId } }, { createdBy: scope.userId }];
  } else if (scope.scope === "RELATED" && scope.userId) {
    where.OR = [{ job: { businessOwnerId: scope.userId } }, { createdBy: scope.userId }];
  }

  return prisma.profileCalibration.findFirst({ where });
}

export async function createCalibration(input: CreateCalibrationInput) {
  return prisma.profileCalibration.create({
    data: {
      jobId: input.jobId,
      sourceFeedbackIds: input.sourceFeedbackIds,
      calibrationReason: input.calibrationReason,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      beforeSnapshot: (input.beforeSnapshot || {}) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      afterSnapshot: (input.afterSnapshot || {}) as any,
      createdBy: input.createdBy,
      status: "draft",
    },
  });
}

/**
 * Confirm a calibration — scoped update.
 *
 * Uses updateMany with scope + status check in WHERE clause,
 * eliminating the unscoped findUnique that was here previously.
 *
 * Returns the updated calibration, or null if:
 * - calibration doesn't exist
 * - scope doesn't match (access denied)
 * - status is already "confirmed" (conflict)
 *
 * Callers should distinguish 404 vs 409 by checking the return value
 * and optionally doing a scoped read to determine which case applies.
 */
export async function confirmCalibration(id: string, confirmedBy: string, scope: ScopeWhere) {
  // Build scope condition — mirrors getCalibrationByIdWithScope
  const scopeWhere: Record<string, unknown> = { id, status: "draft" };

  if (scope.scope === "ALL") {
    // admin/leader: no extra scope filter needed beyond id + status
  } else if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    scopeWhere.job = { departmentId: scope.departmentId };
  } else if (scope.scope === "OWNED" && scope.userId) {
    scopeWhere.OR = [{ job: { ownerId: scope.userId } }, { createdBy: scope.userId }];
  } else if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") return null;
    scopeWhere.OR = [{ job: { businessOwnerId: scope.userId } }, { createdBy: scope.userId }];
  } else {
    // DENY or no userId — cannot confirm
    return null;
  }

  const result = await prisma.profileCalibration.updateMany({
    where: scopeWhere,
    data: {
      status: "confirmed",
      confirmedAt: new Date(),
      confirmedBy,
    },
  });

  if (result.count === 0) {
    // Could be: not found, access denied, or already confirmed
    // All map to null — caller should do scoped read to disambiguate if needed
    return null;
  }

  // Fetch the updated record (scoped) to return full data
  return prisma.profileCalibration.findFirst({
    where: { id, status: "confirmed" },
  });
}
