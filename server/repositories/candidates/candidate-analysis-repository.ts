// Phase 8.3: Candidate Analysis Repository
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface CandidateAnalysisParams { scope: ScopeWhere; userId: string; role: string; departmentId?: string; }

export async function getCandidatesForAnalysis(params: CandidateAnalysisParams) {
  const where: Record<string, unknown> = {};
  if (params.scope.scope === "DEPARTMENT" && params.scope.departmentId) {
    where.applications = { some: { job: { departmentId: params.scope.departmentId } } };
  } else if (params.scope.scope === "OWNED" && params.scope.userId) {
    where.applications = { some: { job: { ownerId: params.scope.userId } } };
  } else if (params.scope.scope === "RELATED" && params.scope.userId) {
    where.applications = { some: { job: { businessOwnerId: params.scope.userId } } };
  } else if (params.scope.scope === "DENY") return [];

  return prisma.candidate.findMany({
    where,
    include: {
      applications: {
        include: {
          job: { select: { id: true, title: true, ownerId: true, businessOwnerId: true } },
          interviews: {
            include: { feedbacks: { select: { overallRecommendation: true, feedbackQualityScore: true, evidenceText: true } } }
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCandidateDetail(id: string) {
  return prisma.candidate.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          job: { select: { id: true, title: true, jdText: true, profileSummary: true, mustHave: true, niceToHave: true, headcount: true } },
          interviews: {
            include: {
              interviewer: { select: { id: true, name: true } },
              feedbacks: { select: { id: true, overallRecommendation: true, feedbackQualityScore: true, qualityLevel: true, evidenceText: true, riskSignals: true, submittedAt: true } },
            },
          },
        },
      },
    },
  });
}

export async function getCandidateActions(candidateId: string) {
  return prisma.actionItem.findMany({
    where: { candidateId, status: "open" },
    orderBy: [{ priority: "asc" }, { dueAt: { sort: "asc", nulls: "last" } }],
    include: { owner: { select: { name: true } }, job: { select: { title: true } } },
    take: 20,
  });
}

export async function getCandidateActivity(candidateId: string) {
  return prisma.activityLog.findMany({
    where: { OR: [{ resourceType: "candidate", resourceId: candidateId }, { resourceType: "action_item", resourceId: { in: await getCandidateActionIds(candidateId) } }] },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { actor: { select: { name: true } } },
  });
}

async function getCandidateActionIds(candidateId: string): Promise<string[]> {
  const actions = await prisma.actionItem.findMany({ where: { candidateId }, select: { id: true }, take: 50 });
  return actions.map(a => a.id);
}
