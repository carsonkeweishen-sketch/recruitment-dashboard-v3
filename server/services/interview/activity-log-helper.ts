// Phase 6: ActivityLog for interview events
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function logInterviewFeedbackSubmitted(params: {
  actorId: string;
  interviewId: string;
  feedbackId: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  overallRecommendation: string;
  feedbackQualityScore?: number;
}) {
  await prisma.activityLog.create({
    data: {
      actorId: params.actorId,
      action: "INTERVIEW_FEEDBACK_SUBMITTED",
      resourceType: "interview_feedback",
      resourceId: params.feedbackId,
      detail: {
        interviewId: params.interviewId,
        applicationId: params.applicationId,
        candidateId: params.candidateId,
        jobId: params.jobId,
        overallRecommendation: params.overallRecommendation,
        feedbackQualityScore: params.feedbackQualityScore,
      },
    },
  });
}
