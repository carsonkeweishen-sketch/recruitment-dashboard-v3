// Phase 8.11: Funnel Context Source — 实时计算 + 60s 缓存
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ContextSourceResult } from "../copilot-context-builder-v2";
import type { ScopeWhere } from "@/server/permissions/types";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) { const pool = new Pool({ connectionString: process.env.DATABASE_URL }); _prisma = new PrismaClient({ adapter: new PrismaPg(pool) }); }
  return _prisma;
}

// 60 秒内存缓存
let cache: { data: ContextSourceResult[]; timestamp: number } | null = null;
const CACHE_TTL = 60_000;

export async function fetch(_objectType: string, _objectId: string, scope: ScopeWhere): Promise<ContextSourceResult[]> {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const p = getPrisma();
  const where = scope.scope === "ALL" ? {} : scope.scope === "DEPARTMENT" && scope.departmentId ? { job: { departmentId: scope.departmentId } } : scope.scope === "OWNED" && scope.userId ? { job: { ownerId: scope.userId } } : {};

  const stages = await p.application.groupBy({ by: ["stage"], where, _count: true });
  const total = stages.reduce((sum, s) => sum + s._count, 0);

  // Calculate conversion rates
  const stageData = stages.map((s) => ({ stage: s.stage, count: s._count, ratio: total > 0 ? ((s._count / total) * 100).toFixed(1) : "0.0" }));

  // Identify bottleneck (stage with most candidates stuck)
  const bottleneck = stageData.sort((a, b) => b.count - a.count)[0];

  const sources: ContextSourceResult[] = [{
    refType: "funnel",
    refId: "funnel_global",
    objectType: "funnel",
    objectId: "global",
    sourceLabel: "招聘漏斗概览",
    excerpt: JSON.stringify({ totalApplications: total, stages: stageData, bottleneck: bottleneck ? { stage: bottleneck.stage, count: bottleneck.count, ratio: bottleneck.ratio } : null }),
    redactionStatus: "not_required",
    hasEvidence: total > 0,
    isRequired: false,
  }];

  cache = { data: sources, timestamp: Date.now() };
  return sources;
}
