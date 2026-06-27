// Phase 8.1: GET /api/jobs/:id/pipeline
// Returns pipeline stage breakdown + bottleneck intelligence for a single job.

import { getSession } from "@/server/auth/session";
import { getJobByIdWithScope } from "@/server/repositories/job-repository";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const PIPELINE_STAGES = [
  "sourced",
  "hr_screen",
  "business_screen",
  "first_interview",
  "second_interview",
  "final_interview",
  "offer_risk",
  "pre_onboarding",
  "hired",
] as const;

const STAGE_LABELS: Record<string, string> = {
  sourced: "入库",
  hr_screen: "HR筛选",
  business_screen: "业务筛选",
  first_interview: "初试",
  second_interview: "复试",
  final_interview: "终面",
  offer_risk: "Offer风险",
  pre_onboarding: "入职前",
  hired: "已入职",
};

interface StageInfo {
  stage: string;
  label: string;
  count: number;
  conversionFromPrev: number | null; // %
  isBottleneck: boolean;
  bottleneckReason: string | null;
}

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

  // Aggregate applications by stage
  const stageCounts: Record<string, number> = {};
  for (const app of job.applications) {
    stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1;
  }

  // Detect bottlenecks: any non-terminal stage with candidates but conversion < 30%
  // Also check for stuck applications (same stage > 14 days)
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stuckApps: any[] = await prisma.application.findMany({
    where: {
      jobId: id,
      status: "active",
      stage: { notIn: ["hired", "rejected", "withdrawn", "closed"] },
      updatedAt: { lt: fourteenDaysAgo },
    },
    select: { id: true, stage: true, candidate: { select: { name: true } } },
    take: 10,
  });

  const stuckByStage: Record<string, string[]> = {};
  for (const app of stuckApps) {
    if (!stuckByStage[app.stage]) stuckByStage[app.stage] = [];
    stuckByStage[app.stage].push(app.candidate.name);
  }

  const totalCandidates = job.applications.length;
  const stages: StageInfo[] = [];
  let prevCount: number | null = null;

  for (let i = 0; i < PIPELINE_STAGES.length; i++) {
    const stage = PIPELINE_STAGES[i];
    const count = stageCounts[stage] || 0;
    const label = STAGE_LABELS[stage] || stage;

    let conversionFromPrev: number | null = null;
    if (prevCount !== null && prevCount > 0) {
      conversionFromPrev = Math.round((count / prevCount) * 100);
    }

    const stuckCandidates = stuckByStage[stage] || [];
    const isBottleneck =
      count > 0 &&
      stage !== "hired" &&
      (stuckCandidates.length > 0 ||
        (conversionFromPrev !== null && conversionFromPrev < 30 && prevCount! >= 3));

    let bottleneckReason: string | null = null;
    if (isBottleneck) {
      if (stuckCandidates.length > 0) {
        bottleneckReason = `${stuckCandidates.length}位候选人停留超14天：${stuckCandidates.slice(0, 3).join("、")}`;
      } else if (conversionFromPrev !== null && conversionFromPrev < 30) {
        bottleneckReason = `从上一阶段转化率仅${conversionFromPrev}%，可能存在筛选标准或面试安排问题`;
      }
    }

    stages.push({
      stage,
      label,
      count,
      conversionFromPrev,
      isBottleneck,
      bottleneckReason,
    });

    prevCount = count;
  }

  // Action count for this job
  const actionCount = await prisma.actionItem.count({
    where: { jobId: id, status: "open" },
  });

  return Response.json({
    success: true,
    data: {
      jobId: id,
      jobTitle: job.title,
      totalCandidates,
      activeCandidates: job.applications.filter((a) => a.status === "active").length,
      hiredCount: stageCounts["hired"] || 0,
      stages,
      bottleneckCount: stages.filter((s) => s.isBottleneck).length,
      openActions: actionCount,
    },
  });
}
