// Phase 8.1: GET /api/jobs/:id/overview
// Returns job overview: headcount, progress, success rate, risk signals, candidate mapping.

import { getSession } from "@/server/auth/session";
import { getJobByIdWithScope } from "@/server/repositories/job-repository";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const scope = buildScopeWhere(
    { role: session.role, userId: session.userId, departmentId: session.departmentId },
    "jobs"
  );

  const job = await getJobByIdWithScope(id, scope);
  if (!job) {
    return Response.json({ success: false, error: "Job not found" }, { status: 404 });
  }

  // Stage distribution
  const stageCounts: Record<string, number> = {};
  for (const app of job.applications) {
    stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1;
  }

  const totalApps = job.applications.length;
  const activeApps = job.applications.filter((a) => a.status === "active").length;
  const hiredCount = stageCounts["hired"] || 0;
  const successRate = job.headcount > 0 ? Math.round((hiredCount / job.headcount) * 100) : 0;
  const progressRate = job.headcount > 0 ? Math.round((totalApps / job.headcount) * 100) : 0;

  // Risk signals from Rule Engine
  const risks: Array<{ type: string; label: string; detail: string }> = [];

  // Check for stuck candidates (same stage > 14 days)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stuckApps: any[] = await prisma.application.findMany({
    where: {
      jobId: id,
      status: "active",
      stage: { notIn: ["hired", "rejected", "withdrawn", "closed"] },
      updatedAt: { lt: fourteenDaysAgo },
    },
    select: { stage: true, candidate: { select: { name: true } } },
    take: 10,
  });

  if (stuckApps.length > 0) {
    risks.push({
      type: "bottleneck",
      label: "流程卡点",
      detail: `${stuckApps.length}位候选人在当前阶段停留超过14天`,
    });
  }

  // Check for low candidate pipeline
  if (totalApps < job.headcount * 2) {
    risks.push({
      type: "low_pipeline",
      label: "候选人不足",
      detail: `当前${totalApps}人，目标编制${job.headcount}人，建议拓展招聘渠道`,
    });
  }

  // Check for open actions
  const openActions = await prisma.actionItem.count({
    where: { jobId: id, status: "open" },
  });
  if (openActions > 0) {
    risks.push({
      type: "pending_actions",
      label: "待处理行动项",
      detail: `${openActions}个行动项待处理`,
    });
  }

  // Candidate mapping: list all candidates with stage + risk
  const candidateMapping = job.applications.map((app) => {
    const isStuck =
      app.status === "active" &&
      app.stage !== "hired" &&
      app.stage !== "rejected" &&
      app.stage !== "withdrawn" &&
      app.stage !== "closed";
    return {
      candidateId: app.candidate.id,
      candidateName: app.candidate.name,
      stage: app.stage,
      status: app.status,
      isStuck,
    };
  });

  return Response.json({
    success: true,
    data: {
      jobId: id,
      jobTitle: job.title,
      jobCode: job.jobCode,
      department: job.department?.name,
      owner: job.owner?.name,
      businessOwner: job.businessOwner?.name,
      headcount: job.headcount,
      totalCandidates: totalApps,
      activeCandidates: activeApps,
      hiredCount,
      successRate,
      progressRate,
      risks,
      openActions,
      candidateMapping,
    },
  });
}
