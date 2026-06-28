// Phase 8.11: Job Context Source — 岗位 + 申请 + 行动项 + 面试反馈
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ContextSourceResult } from "../copilot-context-builder-v2";
import type { ScopeWhere } from "@/server/permissions/types";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  }
  return _prisma;
}

export async function fetch(
  objectType: string,
  objectId: string,
  scope: ScopeWhere,
): Promise<ContextSourceResult[]> {
  const sources: ContextSourceResult[] = [];
  const p = getPrisma();

  // objectId could be "all" for list view, or a specific job ID
  if (objectId === "all" || objectId === "job_list") {
    // List mode: aggregate job stats
    const where = scope.scope === "ALL" ? {} : scope.scope === "DEPARTMENT" && scope.departmentId ? { departmentId: scope.departmentId } : scope.scope === "OWNED" && scope.userId ? { ownerId: scope.userId } : {};
    const jobs = await p.job.findMany({
      where,
      select: { id: true, title: true, status: true, priority: true, headcount: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    sources.push({
      refType: "job",
      refId: "job_list",
      objectType: "job",
      objectId: "all",
      sourceLabel: "岗位列表",
      excerpt: JSON.stringify(jobs.map((j) => ({ title: j.title, status: j.status, priority: j.priority, headcount: j.headcount }))),
      redactionStatus: "not_required",
      hasEvidence: jobs.length > 0,
      isRequired: false,
    });
    return sources;
  }

  // Single job mode
  const job = await p.job.findUnique({
    where: { id: objectId },
    select: {
      id: true, title: true, jobCode: true, status: true, priority: true,
      headcount: true, jdText: true, profileSummary: true,
      mustHave: true, niceToHave: true, interviewFocus: true,
      departmentId: true, ownerId: true, businessOwnerId: true,
    },
  });

  if (!job) {
    sources.push({
      refType: "job",
      refId: objectId,
      objectType: "job",
      objectId,
      sourceLabel: "岗位信息",
      excerpt: "未找到该岗位",
      redactionStatus: "not_required",
      hasEvidence: false,
      isRequired: true,
    });
    return sources;
  }

  // 1. Job basic info
  sources.push({
    refType: "job",
    refId: job.id,
    objectType: "job",
    objectId: job.id,
    sourceLabel: `岗位画像 · ${job.title}`,
    excerpt: JSON.stringify({
      title: job.title, jobCode: job.jobCode, status: job.status, priority: job.priority,
      headcount: job.headcount,
      jdSummary: job.jdText?.substring(0, 800),
      profileSummary: job.profileSummary,
      mustHave: job.mustHave,
      niceToHave: job.niceToHave,
      interviewFocus: job.interviewFocus,
    }),
    redactionStatus: "applied",
    hasEvidence: true,
    isRequired: true,
  });

  // 2. Application stats
  const [appCount, stageBreakdown] = await Promise.all([
    p.application.count({ where: { jobId: objectId } }),
    p.application.groupBy({ by: ["stage"], where: { jobId: objectId }, _count: true }),
  ]);
  sources.push({
    refType: "job",
    refId: `${job.id}_applications`,
    objectType: "job",
    objectId: job.id,
    sourceLabel: `申请统计 · ${job.title}`,
    excerpt: JSON.stringify({ totalApplications: appCount, stageBreakdown }),
    redactionStatus: "not_required",
    hasEvidence: appCount > 0,
    isRequired: false,
  });

  // 3. Open actions
  const openActions = await p.actionItem.findMany({
    where: { jobId: objectId, status: "open" },
    select: { id: true, title: true, priority: true, category: true, dueAt: true },
    take: 10,
    orderBy: { priority: "desc" },
  });
  if (openActions.length > 0) {
    sources.push({
      refType: "action",
      refId: `${job.id}_actions`,
      objectType: "job",
      objectId: job.id,
      sourceLabel: `行动项 · ${job.title}`,
      excerpt: JSON.stringify(openActions.map((a) => ({ title: a.title, priority: a.priority, category: a.category }))),
      redactionStatus: "not_required",
      hasEvidence: true,
      isRequired: false,
    });
  }

  // 4. Interview feedbacks summary
  const feedbacks = await p.interviewFeedback.findMany({
    where: { interview: { application: { jobId: objectId } } },
    select: { id: true, overallRecommendation: true, feedbackQualityScore: true, qualityLevel: true, evidenceText: true, riskSignals: true },
    take: 5,
    orderBy: { submittedAt: "desc" },
  });
  if (feedbacks.length > 0) {
    sources.push({
      refType: "interview_feedback",
      refId: `${job.id}_feedbacks`,
      objectType: "job",
      objectId: job.id,
      sourceLabel: `面试反馈摘要 · ${job.title}`,
      excerpt: JSON.stringify(feedbacks.map((f) => ({
        recommendation: f.overallRecommendation,
        quality: f.qualityLevel,
        qualityScore: f.feedbackQualityScore,
        evidenceExcerpt: f.evidenceText?.substring(0, 300),
        riskSignals: f.riskSignals,
      }))),
      redactionStatus: "applied",
      hasEvidence: true,
      isRequired: false,
    });
  }

  return sources;
}
