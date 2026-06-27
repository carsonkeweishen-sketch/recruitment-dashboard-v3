// Phase 8.4: Interview Quality Repository
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface IQParams { scope: ScopeWhere; userId: string; role: string; departmentId?: string; }

function buildJobWhere(params: IQParams): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (params.scope.scope === "DEPARTMENT" && params.scope.departmentId) where.departmentId = params.scope.departmentId;
  else if (params.scope.scope === "OWNED" && params.scope.userId) where.ownerId = params.scope.userId;
  else if (params.scope.scope === "RELATED" && params.scope.userId) where.businessOwnerId = params.scope.userId;
  else if (params.scope.scope === "DENY") where.id = "__none__";
  return where;
}

export async function getInterviewFeedbacksForAnalysis(params: IQParams) {
  const jobWhere = buildJobWhere(params);
  const jobIds = (await prisma.job.findMany({ where: jobWhere, select: { id: true } })).map(j => j.id);

  if (params.role === "interviewer") {
    return prisma.interviewFeedback.findMany({
      where: { interviewerId: params.userId },
      include: {
        interview: { include: { application: { include: { candidate: { select: { id: true, name: true } }, job: { select: { id: true, title: true } } } }, interviewer: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.interviewFeedback.findMany({
    where: { interview: { application: { jobId: { in: jobIds } } } },
    include: {
      interview: { include: { application: { include: { candidate: { select: { id: true, name: true } }, job: { select: { id: true, title: true } } } }, interviewer: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeedbackDetail(id: string) {
  return prisma.interviewFeedback.findUnique({
    where: { id },
    include: {
      interview: {
        include: {
          application: { include: { candidate: { select: { id: true, name: true, currentCompany: true, currentTitle: true } }, job: { select: { id: true, title: true } } } },
          interviewer: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function getFeedbackActions(feedbackId: string) {
  return prisma.actionItem.findMany({
    where: { OR: [{ sourceRefId: feedbackId }, { interview: { feedbacks: { some: { id: feedbackId } } } }] },
    orderBy: [{ priority: "asc" }, { dueAt: { sort: "asc", nulls: "last" } }],
    include: { owner: { select: { name: true } }, job: { select: { title: true } } },
    take: 20,
  });
}

export async function getFeedbackActivity(feedbackId: string) {
  return prisma.activityLog.findMany({
    where: { OR: [{ resourceType: "interview_feedback", resourceId: feedbackId }] },
    orderBy: { createdAt: "desc" }, take: 10,
    include: { actor: { select: { name: true } } },
  });
}
