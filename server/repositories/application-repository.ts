import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface ApplicationListParams {
  scope: ScopeWhere;
  jobId?: string;
  candidateId?: string;
  stage?: string;
  status?: string;
  ownerId?: string;
  source?: string;
}

export async function getApplications(params: ApplicationListParams) {
  const { scope, jobId, candidateId, stage, status, ownerId, source } = params;
  const where: Record<string, unknown> = {};

  if (scope.scope === "DENY") return [];

  if (jobId) where.jobId = jobId;
  if (candidateId) where.candidateId = candidateId;
  if (stage) where.stage = stage;
  if (status) where.status = status;
  if (ownerId) where.ownerId = ownerId;
  if (source) where.source = source;

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    where.job = { departmentId: scope.departmentId };
  } else if (scope.scope === "OWNED" && scope.userId) {
    where.ownerId = scope.userId;
  } else if (scope.scope === "RELATED" && scope.userId) {
    // - interviewer: only applications where they have been assigned to interview
    // - business_owner: only applications on jobs where they are businessOwner
    if (scope.role === "interviewer") {
      where.interviews = { some: { interviewerId: scope.userId } };
    } else {
      where.job = { businessOwnerId: scope.userId };
    }
  }

  return prisma.application.findMany({
    where,
    include: {
      candidate: { select: { id: true, name: true, currentCompany: true, currentTitle: true } },
      job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } } } },
      owner: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/** @internal Internal use only — API routes must use getApplicationByIdWithScope() */
export async function getApplicationById(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: {
      candidate: { select: { id: true, name: true, currentCompany: true, currentTitle: true, source: true, tags: true } },
      job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } }, level: true } },
      owner: { select: { id: true, name: true } },
    },
  });
}

export async function getApplicationByIdWithScope(id: string, scope: ScopeWhere) {
  if (scope.scope === "DENY") return null;
  const where: Record<string, unknown> = { id };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    where.job = { departmentId: scope.departmentId };
  } else if (scope.scope === "OWNED" && scope.userId) {
    where.OR = [{ ownerId: scope.userId }, { job: { ownerId: scope.userId } }];
  } else if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      where.interviews = { some: { interviewerId: scope.userId } };
    } else {
      where.job = { businessOwnerId: scope.userId };
    }
  }

  return prisma.application.findFirst({
    where,
    include: {
      candidate: { select: { id: true, name: true, currentCompany: true, currentTitle: true, source: true, tags: true } },
      job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } }, level: true } },
      owner: { select: { id: true, name: true } },
    },
  });
}
