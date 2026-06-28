// Phase 8.11: Dashboard Context Source — 聚合全局统计数据
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
  question?: string,
): Promise<ContextSourceResult[]> {
  const sources: ContextSourceResult[] = [];
  const p = getPrisma();

  // 1. Open actions count
  const openActions = await p.actionItem.count({ where: { status: "open" } });
  sources.push({
    refType: "dashboard",
    refId: "global_actions",
    objectType: "dashboard",
    objectId: "global",
    sourceLabel: "行动项概览",
    excerpt: `当前有 ${openActions} 个未处理行动项`,
    redactionStatus: "not_required",
    hasEvidence: true,
    isRequired: false,
  });

  // 2. Active offer risks
  const activeRisks = await p.offerRisk.count({ where: { status: "active" } });
  sources.push({
    refType: "dashboard",
    refId: "global_risks",
    objectType: "dashboard",
    objectId: "global",
    sourceLabel: "Offer 风险概览",
    excerpt: `当前有 ${activeRisks} 个活跃 Offer 风险`,
    redactionStatus: "not_required",
    hasEvidence: true,
    isRequired: false,
  });

  // 3. Recent interviews with feedback
  const recentFeedbacks = await p.interviewFeedback.findMany({
    take: 5,
    orderBy: { submittedAt: "desc" },
    select: { id: true, overallRecommendation: true, feedbackQualityScore: true, qualityLevel: true },
  });
  if (recentFeedbacks.length > 0) {
    const summary = recentFeedbacks
      .map((f) => `${f.overallRecommendation}（质量：${f.qualityLevel || "未评"}）`)
      .join("、");
    sources.push({
      refType: "dashboard",
      refId: "recent_feedbacks",
      objectType: "dashboard",
      objectId: "global",
      sourceLabel: "近期面试反馈",
      excerpt: `最近 ${recentFeedbacks.length} 条面试反馈：${summary}`,
      redactionStatus: "not_required",
      hasEvidence: true,
      isRequired: false,
    });
  }

  // 4. Job pipeline summary
  const openJobs = await p.job.count({ where: { status: "open" } });
  const totalApplications = await p.application.count();
  sources.push({
    refType: "dashboard",
    refId: "job_pipeline",
    objectType: "dashboard",
    objectId: "global",
    sourceLabel: "招聘漏斗概览",
    excerpt: `在招岗位 ${openJobs} 个，总投递 ${totalApplications} 份`,
    redactionStatus: "not_required",
    hasEvidence: true,
    isRequired: false,
  });

  return sources;
}
