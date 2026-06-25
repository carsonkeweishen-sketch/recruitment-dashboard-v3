// Phase 5: Profile Calibration Repository
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
  if (scope.scope === "DENY" || scope.scope === "RELATED" && scope.role === "interviewer") return [];

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

export async function getCalibrationById(id: string) {
  return prisma.profileCalibration.findUnique({
    where: { id },
  });
}

export async function createCalibration(input: CreateCalibrationInput) {
  // Store status in afterSnapshot as a workaround (Schema lacks status field)
  const afterWithStatus = {
    ...(input.afterSnapshot || {}),
    _status: "draft",
    _confirmedAt: null,
  };

  return prisma.profileCalibration.create({
    data: {
      jobId: input.jobId,
      sourceFeedbackIds: input.sourceFeedbackIds,
      calibrationReason: input.calibrationReason,
      beforeSnapshot: (input.beforeSnapshot || {}) as any,
      afterSnapshot: afterWithStatus as any,
      createdBy: input.createdBy,
    },
  });
}

export async function confirmCalibration(id: string, confirmedBy: string) {
  const existing = await prisma.profileCalibration.findUnique({ where: { id } });
  if (!existing) return null;

  const currentAfter = (existing.afterSnapshot as Record<string, unknown>) || {};
  if (currentAfter._status === "confirmed") {
    throw new Error("Calibration already confirmed");
  }

  const updatedAfter = {
    ...currentAfter,
    _status: "confirmed",
    _confirmedAt: new Date().toISOString(),
    _confirmedBy: confirmedBy,
  };

  return prisma.profileCalibration.update({
    where: { id },
    data: { afterSnapshot: updatedAfter as unknown as Parameters<typeof prisma.profileCalibration.update>[0]["data"]["afterSnapshot"] },
  });
}
