import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface CandidateListParams {
  scope: ScopeWhere;
  search?: string;
  source?: string;
  currentCompany?: string;
  tag?: string;
  stage?: string;
  jobId?: string;
}

export async function getCandidates(params: CandidateListParams) {
  const { scope, search, source, currentCompany, tag, stage, jobId } = params;
  const where: Record<string, unknown> = {};
  const appWhere: Record<string, unknown> = {};

  if (scope.scope === "DENY") return [];

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { currentCompany: { contains: search, mode: "insensitive" } },
      { currentTitle: { contains: search, mode: "insensitive" } },
    ];
  }
  if (source) where.source = source;
  if (currentCompany) where.currentCompany = currentCompany;
  if (tag) where.tags = { has: tag };
  if (stage) appWhere.stage = stage;
  if (jobId) appWhere.jobId = jobId;

  if (Object.keys(appWhere).length > 0) {
    where.applications = { some: appWhere };
  }

  // Scope: filter candidates by related applications
  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    where.applications = { ...(where.applications as object ?? {}), some: { ...appWhere, job: { departmentId: scope.departmentId } } };
  } else if (scope.scope === "OWNED" && scope.userId) {
    where.applications = { ...(where.applications as object ?? {}), some: { ...appWhere, ownerId: scope.userId } };
  } else if (scope.scope === "RELATED" && scope.userId) {
    // RELATED semantics differ by role:
    // - interviewer: only candidates they have been assigned to interview
    // - business_owner: candidates whose application ownerId or job.businessOwnerId matches
    if (scope.role === "interviewer") {
      where.applications = { ...(where.applications as object ?? {}), some: { ...appWhere, interviews: { some: { interviewerId: scope.userId } } } };
    } else {
      where.applications = { ...(where.applications as object ?? {}), some: { ...appWhere, OR: [{ ownerId: scope.userId }, { job: { businessOwnerId: scope.userId } }] } };
    }
  }

  return prisma.candidate.findMany({
    where,
    include: {
      applications: {
        include: { job: { select: { title: true, department: { select: { name: true } } } } },
        orderBy: { updatedAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/** @internal Internal use only — API routes must use getCandidateByIdWithScope() */
export async function getCandidateById(id: string) {
  return prisma.candidate.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } }, level: true } },
          owner: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}

export async function getCandidateByIdWithScope(id: string, scope: ScopeWhere) {
  if (scope.scope === "DENY") return null;
  const where: Record<string, unknown> = { id };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    where.applications = { some: { job: { departmentId: scope.departmentId } } };
  } else if (scope.scope === "OWNED" && scope.userId) {
    where.applications = { some: { ownerId: scope.userId } };
  } else if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      where.applications = { some: { interviews: { some: { interviewerId: scope.userId } } } };
    } else {
      where.applications = { some: { OR: [{ ownerId: scope.userId }, { job: { businessOwnerId: scope.userId } }] } };
    }
  }

  return prisma.candidate.findFirst({
    where,
    include: {
      applications: {
        include: {
          job: { select: { id: true, title: true, jobCode: true, department: { select: { name: true } }, level: true } },
          owner: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}
