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

export async function confirmCalibration(id: string, confirmedBy: string) {
  const existing = await prisma.profileCalibration.findUnique({ where: { id } });
  if (!existing) return null;

  if (existing.status === "confirmed") {
    throw new Error("Calibration already confirmed");
  }

  return prisma.profileCalibration.update({
    where: { id },
    data: {
      status: "confirmed",
      confirmedAt: new Date(),
      confirmedBy,
    },
  });
}
