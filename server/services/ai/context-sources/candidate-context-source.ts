// Phase 8.11: Candidate Context Source — 申请 + 面试 + 风险（phone/email 不进入 excerpt）
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

  if (objectId === "all" || objectId === "candidate_list") {
    // List mode
    const candidates = await p.candidate.findMany({
      select: { id: true, name: true, currentCompany: true, currentTitle: true, source: true, tags: true },
      take: 15,
      orderBy: { createdAt: "desc" },
    });
    sources.push({
      refType: "candidate",
      refId: "candidate_list",
      objectType: "candidate",
      objectId: "all",
      sourceLabel: "候选人列表",
      excerpt: JSON.stringify(candidates.map((c) => ({ name: c.name, company: c.currentCompany, title: c.currentTitle, tags: c.tags }))),
      redactionStatus: "applied",
      hasEvidence: candidates.length > 0,
      isRequired: false,
    });
    return sources;
  }

  // Single candidate
  const candidate = await p.candidate.findUnique({
    where: { id: objectId },
    select: { id: true, name: true, currentCompany: true, currentTitle: true, resumeSummary: true, tags: true, source: true },
  });

  if (!candidate) {
    sources.push({
      refType: "candidate", refId: objectId, objectType: "candidate", objectId,
      sourceLabel: "候选人信息", excerpt: "未找到该候选人",
      redactionStatus: "not_required", hasEvidence: false, isRequired: true,
    });
    return sources;
  }

  // 1. Candidate basic (NO phone/email)
  sources.push({
    refType: "candidate", refId: candidate.id, objectType: "candidate", objectId: candidate.id,
    sourceLabel: `候选人 · ${candidate.name}`,
    excerpt: JSON.stringify({ name: candidate.name, currentCompany: candidate.currentCompany, currentTitle: candidate.currentTitle, resumeSummary: candidate.resumeSummary?.substring(0, 800), tags: candidate.tags, source: candidate.source }),
    redactionStatus: "applied", hasEvidence: true, isRequired: true,
  });

  // 2. Applications & interviews
  const applications = await p.application.findMany({
    where: { candidateId: objectId },
    select: { id: true, stage: true, status: true, job: { select: { id: true, title: true } }, interviews: { select: { id: true, round: true, status: true, interviewerId: true, feedbacks: { select: { id: true, overallRecommendation: true, qualityLevel: true, evidenceText: true } } } } },
  });
  if (applications.length > 0) {
    sources.push({
      refType: "candidate", refId: `${candidate.id}_applications`, objectType: "candidate", objectId: candidate.id,
      sourceLabel: `申请与面试记录 · ${candidate.name}`,
      excerpt: JSON.stringify(applications.map((a) => ({ jobTitle: a.job.title, stage: a.stage, status: a.status, interviews: a.interviews.map((i) => ({ round: i.round, status: i.status, hasFeedback: i.feedbacks.length > 0, recommendation: i.feedbacks[0]?.overallRecommendation, quality: i.feedbacks[0]?.qualityLevel, evidenceExcerpt: i.feedbacks[0]?.evidenceText?.substring(0, 200) })) }))),
      redactionStatus: "applied", hasEvidence: true, isRequired: false,
    });
  }

  // 3. Offer risks
  const risks = await p.offerRisk.findMany({
    where: { application: { candidateId: objectId } },
    select: { id: true, riskType: true, level: true, description: true, status: true },
  });
  if (risks.length > 0) {
    sources.push({
      refType: "offer_risk", refId: `${candidate.id}_risks`, objectType: "candidate", objectId: candidate.id,
      sourceLabel: `Offer 风险 · ${candidate.name}`,
      excerpt: JSON.stringify(risks.map((r) => ({ type: r.riskType, level: r.level, status: r.status, description: r.description?.substring(0, 200) }))),
      redactionStatus: "applied", hasEvidence: true, isRequired: false,
    });
  }

  return sources;
}
