// Phase 3.1: Job Repository — Prisma query layer

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { Role, ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export interface JobListParams {
  role: Role;
  scope: ScopeWhere;
  search?: string;
  departmentId?: string;
  status?: string;
  priority?: string;
  level?: string;
  ownerId?: string;
  brandLine?: string;
}

export async function getJobs(params: JobListParams) {
  const { scope, search, departmentId, status, priority, level, ownerId, brandLine } = params;

  const where: Record<string, unknown> = {};

  // Scope filter
  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    where.departmentId = scope.departmentId;
  } else if (scope.scope === "OWNED" && scope.userId) {
    where.ownerId = scope.userId;
  } else if (scope.scope === "RELATED" && scope.userId) {
    where.OR = [{ ownerId: scope.userId }, { businessOwnerId: scope.userId }];
  } else if (scope.scope === "DENY") {
    return [];
  }

  if (search) where.title = { contains: search, mode: "insensitive" };
  if (departmentId) where.departmentId = departmentId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (level) where.level = level;
  if (ownerId) where.ownerId = ownerId;
  if (brandLine) where.brandLine = brandLine;

  return prisma.job.findMany({
    where,
    include: {
      department: { select: { name: true } },
      owner: { select: { id: true, name: true } },
      businessOwner: { select: { id: true, name: true } },
      applications: { select: { id: true, stage: true, status: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
      businessOwner: { select: { id: true, name: true } },
      applications: {
        select: { id: true, stage: true, status: true, candidate: { select: { id: true, name: true } } },
      },
    },
  });
}
