// Phase 8.2: Job Analysis Repository
// Scope-aware aggregation queries for Job Center.
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface JobAnalysisParams { scope: ScopeWhere; userId: string; role: string; departmentId?: string; }

export async function getJobIdsByScope(params: JobAnalysisParams): Promise<string[]> {
  const where: Record<string, unknown> = {};
  if (params.scope.scope === "DEPARTMENT" && params.scope.departmentId) where.departmentId = params.scope.departmentId;
  else if (params.scope.scope === "OWNED" && params.scope.userId) where.ownerId = params.scope.userId;
  else if (params.scope.scope === "RELATED" && params.scope.userId) where.businessOwnerId = params.scope.userId;
  else if (params.scope.scope === "DENY") return [];
  const jobs = await prisma.job.findMany({ where, select: { id: true } });
  return jobs.map(j => j.id);
}

export async function getJobsForAnalysis(params: JobAnalysisParams) {
  const where: Record<string, unknown> = {};
  if (params.scope.scope === "DEPARTMENT" && params.scope.departmentId) where.departmentId = params.scope.departmentId;
  else if (params.scope.scope === "OWNED" && params.scope.userId) where.ownerId = params.scope.userId;
  else if (params.scope.scope === "RELATED" && params.scope.userId) where.businessOwnerId = params.scope.userId;
  else if (params.scope.scope === "DENY") return [];

  return prisma.job.findMany({
    where: { ...where, status: { not: "closed" } },
    include: {
      owner: { select: { name: true } },
      businessOwner: { select: { name: true } },
      department: { select: { name: true } },
      applications: { select: { id: true, stage: true, status: true, candidateId: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getJobAnalysisDetail(jobId: string) {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: {
      owner: { select: { id: true, name: true } },
      businessOwner: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
      applications: {
        include: {
          candidate: { select: { id: true, name: true, currentCompany: true, currentTitle: true } },
          interviews: {
            include: {
              interviewer: { select: { id: true, name: true } },
              feedbacks: { select: { id: true, overallRecommendation: true, feedbackQualityScore: true, qualityLevel: true, evidenceText: true, submittedAt: true } },
            },
          },
        },
      },
    },
  });
}

export async function getJobActions(jobId: string) {
  return prisma.actionItem.findMany({
    where: { jobId, status: "open" },
    orderBy: [{ priority: "asc" }, { dueAt: { sort: "asc", nulls: "last" } }],
    include: { owner: { select: { name: true } }, candidate: { select: { name: true } } },
    take: 20,
  });
}

export async function getJobActivity(jobId: string) {
  return prisma.activityLog.findMany({
    where: { OR: [{ resourceType: "job", resourceId: jobId }, { resourceType: "action_item", resourceId: { in: await getJobActionIds(jobId) } }] },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { actor: { select: { name: true } } },
  });
}

async function getJobActionIds(jobId: string): Promise<string[]> {
  const actions = await prisma.actionItem.findMany({ where: { jobId }, select: { id: true }, take: 50 });
  return actions.map(a => a.id);
}
