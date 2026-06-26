// Phase 6: Interview Feedback Repository
// Scoped write operations. Interviewer can only submit feedback for their own interviews.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";
import { buildInterviewFeedbackScopeWhere } from "@/server/permissions/resource-scope-builder";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface CreateFeedbackInput {
  interviewId: string;
  interviewerId: string;
  scores: Record<string, number>;
  overallRecommendation: string;
  evidenceText: string;
  riskNotes?: string;
  suggestedFollowUpQuestions?: string[];
}

export interface FeedbackOutput {
  id: string;
  interviewId: string;
  interviewerId: string;
  scores: Record<string, unknown> | null;
  overallRecommendation: string | null;
  evidenceText: string | null;
  riskNotes: string | null;
  suggestedFollowUpQuestions: string[];
  feedbackQualityScore: number | null;
  qualityLevel: string | null;
  riskSignals: unknown;
  submittedAt: Date | null;
  interview?: {
    id: string;
    round: string;
    scheduledAt?: Date | null;
    application?: {
      candidate?: { id: string; name: string } | null;
    } | null;
  } | null;
  interviewer?: { id: string; name: string } | null;
}

export async function getFeedbackByIdWithScope(id: string, scope: ScopeWhere) {
  if (scope.scope === "DENY") return null;
  if (scope.scope === "RELATED" && scope.role === "interviewer" && !scope.userId) return null;

  const scopeWhere = buildInterviewFeedbackScopeWhere(scope);
  const where: Record<string, unknown> = { id, ...scopeWhere };

  return prisma.interviewFeedback.findFirst({
    where,
    include: {
      interview: {
        select: {
          id: true,
          round: true,
          application: {
            select: {
              id: true,
              candidate: { select: { id: true, name: true } },
              job: { select: { id: true, title: true } },
            },
          },
        },
      },
      interviewer: { select: { id: true, name: true } },
    },
  });
}

export async function submitFeedback(
  input: CreateFeedbackInput,
  feedbackQualityScore: number,
  qualityLevel: string,
  riskSignals: unknown
): Promise<FeedbackOutput> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {
    interviewId: input.interviewId,
    interviewerId: input.interviewerId,
    scores: input.scores,
    overallRecommendation: input.overallRecommendation,
    evidenceText: input.evidenceText,
    riskNotes: input.riskNotes,
    suggestedFollowUpQuestions: input.suggestedFollowUpQuestions ?? [],
    feedbackQualityScore,
    qualityLevel,
    riskSignals: riskSignals,
    submittedAt: new Date(),
  };

  return prisma.interviewFeedback.create({ data }) as unknown as FeedbackOutput;
}

export async function checkDuplicateFeedback(interviewId: string): Promise<boolean> {
  const existing = await prisma.interviewFeedback.findFirst({
    where: { interviewId },
    select: { id: true },
  });
  return existing !== null;
}

export async function getFeedbacksByInterviewId(interviewId: string) {
  return prisma.interviewFeedback.findMany({
    where: { interviewId },
    include: {
      interviewer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeedbacksByJobId(
  jobId: string,
  scope: ScopeWhere
): Promise<FeedbackOutput[]> {
  if (scope.scope === "DENY") return [];

  const where: Record<string, unknown> = {
    interview: { application: { jobId } },
  };

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    where.interview = {
      application: { job: { departmentId: scope.departmentId, id: jobId } },
    };
  }

  return prisma.interviewFeedback.findMany({
    where,
    include: {
      interview: {
        select: {
          id: true,
          round: true,
          scheduledAt: true,
          application: {
            select: {
              candidate: { select: { id: true, name: true } },
            },
          },
        },
      },
      interviewer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  }) as unknown as FeedbackOutput[];
}

export async function getInterviewerFeedbackStats(interviewerId: string) {
  const feedbacks = await prisma.interviewFeedback.findMany({
    where: { interviewerId },
    select: {
      id: true,
      feedbackQualityScore: true,
      evidenceText: true,
      riskSignals: true,
      submittedAt: true,
      createdAt: true,
      interview: {
        select: {
          scheduledAt: true,
          status: true,
        },
      },
    },
  });

  const total = feedbacks.length;
  const withQuality = feedbacks.filter((f) => f.feedbackQualityScore !== null);
  const onTime = feedbacks.filter((f) => {
    const fbTime = f.submittedAt;
    const refTime = f.interview.scheduledAt;
    if (!fbTime || !refTime) return false;
    return fbTime.getTime() - refTime.getTime() < 24 * 60 * 60 * 1000;
  });

  const withEvidence = feedbacks.filter(
    (f) => f.evidenceText && f.evidenceText.length >= 50
  );

  const withRiskSignals = feedbacks.filter(
    (f) => f.riskSignals && Array.isArray(f.riskSignals) && (f.riskSignals as unknown[]).length > 0
  );

  return {
    total,
    avgQualityScore:
      withQuality.length > 0
        ? Math.round(
            withQuality.reduce((a, b) => a + (b.feedbackQualityScore ?? 0), 0) /
              withQuality.length
          )
        : 0,
    onTimeRate: total > 0 ? Math.round((onTime.length / total) * 100) : 0,
    evidenceSufficiencyRate:
      total > 0 ? Math.round((withEvidence.length / total) * 100) : 0,
    riskNotesCoverageRate:
      total > 0 ? Math.round((withRiskSignals.length / total) * 100) : 0,
  };
}
