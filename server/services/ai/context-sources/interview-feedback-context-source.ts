// Phase 8.11: Interview Feedback Context Source
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

export async function fetch(_objectType: string, objectId: string, _scope: ScopeWhere): Promise<ContextSourceResult[]> {
  const sources: ContextSourceResult[] = [];
  const p = getPrisma();
  const fb = await p.interviewFeedback.findUnique({
    where: { id: objectId },
    select: { id: true, overallRecommendation: true, scores: true, evidenceText: true, riskNotes: true, suggestedFollowUpQuestions: true, feedbackQualityScore: true, qualityLevel: true, riskSignals: true, interview: { select: { id: true, round: true, application: { select: { job: { select: { title: true } }, candidate: { select: { name: true } } } } } } },
  });
  if (!fb) {
    sources.push({ refType: "interview_feedback", refId: objectId, objectType: "interview_quality", objectId, sourceLabel: "面试反馈", excerpt: "未找到该面试反馈", redactionStatus: "not_required", hasEvidence: false, isRequired: true });
    return sources;
  }
  sources.push({
    refType: "interview_feedback", refId: fb.id, objectType: "interview_quality", objectId: fb.id,
    sourceLabel: `面试反馈 · ${fb.interview?.application?.candidate?.name || ""} / ${fb.interview?.application?.job?.title || ""}`,
    excerpt: JSON.stringify({ recommendation: fb.overallRecommendation, scores: fb.scores, evidenceExcerpt: fb.evidenceText?.substring(0, 800), riskNotes: fb.riskNotes, followUpQuestions: fb.suggestedFollowUpQuestions, qualityScore: fb.feedbackQualityScore, qualityLevel: fb.qualityLevel, riskSignals: fb.riskSignals, round: fb.interview?.round }),
    redactionStatus: "applied", hasEvidence: true, isRequired: true,
  });
  return sources;
}
