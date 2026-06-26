// Phase 5: ActivityLog helper for business feedback events
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function logBusinessFeedbackCreated(params: {
  actorId: string;
  feedbackId: string;
  jobId: string;
  applicationId?: string;
  decision: string;
  reasonCode?: string;
}) {
  await prisma.activityLog.create({
    data: {
      actorId: params.actorId,
      action: "BUSINESS_FEEDBACK_CREATED",
      resourceType: "business_feedback",
      resourceId: params.feedbackId,
      detail: {
        jobId: params.jobId,
        applicationId: params.applicationId,
        decision: params.decision,
        reasonCode: params.reasonCode,
      },
    },
  });
}

export async function logProfileCalibrationCreated(params: {
  actorId: string;
  calibrationId: string;
  jobId: string;
  sourceFeedbackIds: string[];
}) {
  await prisma.activityLog.create({
    data: {
      actorId: params.actorId,
      action: "PROFILE_CALIBRATION_CREATED",
      resourceType: "profile_calibration",
      resourceId: params.calibrationId,
      detail: {
        jobId: params.jobId,
        sourceFeedbackIds: params.sourceFeedbackIds,
      },
    },
  });
}

export async function logProfileCalibrationConfirmed(params: {
  actorId: string;
  calibrationId: string;
  jobId: string;
}) {
  await prisma.activityLog.create({
    data: {
      actorId: params.actorId,
      action: "PROFILE_CALIBRATION_CONFIRMED",
      resourceType: "profile_calibration",
      resourceId: params.calibrationId,
      detail: {
        jobId: params.jobId,
      },
    },
  });
}

// Phase 6: Interview feedback activity log
export async function logInterviewFeedbackSubmitted(params: {
  actorId: string;
  feedbackId: string;
  interviewId: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  overallRecommendation: string;
  feedbackQualityScore: number;
  riskSignals: unknown;
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
        riskSignalCount: Array.isArray(params.riskSignals)
          ? (params.riskSignals as unknown[]).length
          : 0,
      },
    },
  });
}
