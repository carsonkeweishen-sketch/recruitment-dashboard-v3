// Phase 6: Interview Feedback Repository
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface SubmitFeedbackInput {
  interviewId: string;
  interviewerId: string;
  scores: Record<string, number>;
  overallRecommendation: string;
  evidenceText?: string;
  riskNotes?: string;
  suggestedFollowUpQuestions?: string[];
  strengths?: string;
}

export async function submitFeedback(input: SubmitFeedbackInput) {
  return prisma.interviewFeedback.create({
    data: {
      interviewId: input.interviewId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scores: input.scores as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overallRecommendation: input.overallRecommendation as any,
      evidence: input.evidenceText,
      concerns: input.riskNotes,
      strengths: input.strengths,
      suggestedFollowUps: input.suggestedFollowUpQuestions || [],
      submittedAt: new Date(),
    },
  });
}

export async function getFeedbackByInterviewId(interviewId: string) {
  return prisma.interviewFeedback.findFirst({
    where: { interviewId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeedbacksByInterviewer(interviewerId: string) {
  return prisma.interviewFeedback.findMany({
    where: { interview: { interviewerId } },
    include: {
      interview: {
        select: {
          id: true,
          round: true,
          application: {
            select: {
              candidate: { select: { id: true, name: true } },
              job: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getFeedbacksByJob(jobId: string) {
  return prisma.interviewFeedback.findMany({
    where: { interview: { application: { jobId } } },
    include: {
      interview: {
        select: {
          id: true,
          round: true,
          interviewer: { select: { id: true, name: true } },
          application: {
            select: {
              candidate: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
}
