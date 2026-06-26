// Phase 7: Action Rule Engine
// Rule-based action generation (no AI). 6 rules with dedup.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";
import { buildActionScopeWhere } from "@/server/permissions/resource-scope-builder";
import { createActionIfNotExists } from "@/server/repositories/action/action-repository";
import type { CreateActionInput } from "@/server/repositories/action/action-repository";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface GenerateResult {
  createdCount: number;
  skippedDuplicateCount: number;
  actions: Array<{ id: string; title: string; category: string }>;
}

export async function generateActions(
  scope: ScopeWhere,
  userId: string
): Promise<GenerateResult> {
  const scopeWhere = buildActionScopeWhere(scope);
  const results: GenerateResult = { createdCount: 0, skippedDuplicateCount: 0, actions: [] };

  // Rule 1: Interview completed 24h+ ago, no feedback → feedback_followup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staleInterviews: any[] = await prisma.interview.findMany({
    where: {
      ...scopeWhere,
      status: "completed",
      completedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      feedbacks: { none: {} },
    },
    include: {
      application: {
        include: {
          job: { select: { title: true } },
          candidate: { select: { name: true } },
        },
      },
    },
    take: 20,
  });

  for (const iv of staleInterviews) {
    const input: CreateActionInput = {
      title: `面试反馈催办：${iv.application.candidate.name} - ${iv.application.job.title}`,
      description: `面试已完成超过24小时，未提交反馈。`,
      category: "feedback_followup", priority: "high",
      ownerId: iv.interviewerId, createdById: userId,
      jobId: iv.application.jobId, candidateId: iv.application.candidateId,
      applicationId: iv.application.id, interviewId: iv.id,
      sourceType: "interview_feedback", sourceRefId: iv.id,
      sourceSummary: `Interview ${iv.id} completed without feedback`,
    };
    const result = await createActionIfNotExists(input);
    if (result.created) { results.createdCount++; results.actions.push({ id: result.actionId!, title: input.title, category: input.category }); }
    else { results.skippedDuplicateCount++; }
  }

  // Rule 2: Feedback quality score < 60 → feedback_quality
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lowQualityFeedbacks: any[] = await prisma.interviewFeedback.findMany({
    where: {
      feedbackQualityScore: { lt: 60 },
      interview: { ...scopeWhere },
    },
    include: {
      interview: {
        include: {
          application: {
            include: {
              job: { select: { title: true } },
              candidate: { select: { name: true } },
            },
          },
        },
      },
    },
    take: 20,
  });

  for (const fb of lowQualityFeedbacks) {
    const input: CreateActionInput = {
      title: `面试反馈质量待提升：${fb.interview.application.candidate.name}`,
      description: `反馈质量评分${fb.feedbackQualityScore}分，建议补充具体项目案例和数据。`,
      category: "feedback_quality", priority: "medium",
      ownerId: fb.interviewerId, createdById: userId,
      jobId: fb.interview.application.jobId, candidateId: fb.interview.application.candidateId,
      applicationId: fb.interview.application.id, interviewId: fb.interviewId,
      sourceType: "feedback_quality", sourceRefId: fb.id,
      sourceSummary: `Quality score: ${fb.feedbackQualityScore}`,
    };
    const result = await createActionIfNotExists(input);
    if (result.created) { results.createdCount++; results.actions.push({ id: result.actionId!, title: input.title, category: input.category }); }
    else { results.skippedDuplicateCount++; }
  }

  // Rule 3: riskSignals with high risk → candidate_risk_followup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allFeedbacksWithSignals: any[] = await prisma.interviewFeedback.findMany({
    where: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      riskSignals: { not: undefined as any },
      interview: { ...scopeWhere },
    },
    include: {
      interview: {
        include: {
          application: {
            include: {
              job: { select: { title: true } },
              candidate: { select: { name: true } },
            },
          },
        },
      },
    },
    take: 20,
  });

  for (const fb of allFeedbacksWithSignals) {
    const signals = (fb.riskSignals as Array<{ riskLevel: string }>) || [];
    const hasHigh = signals.some((s: { riskLevel: string }) => s.riskLevel === "high");
    if (!hasHigh) continue;

    const input: CreateActionInput = {
      title: `候选人风险追问：${fb.interview.application.candidate.name}`,
      description: `面试风险信号检测到高风险项，建议补充追问或验证。`,
      category: "candidate_risk_followup", priority: "high",
      ownerId: fb.interviewerId, createdById: userId,
      jobId: fb.interview.application.jobId, candidateId: fb.interview.application.candidateId,
      applicationId: fb.interview.application.id, interviewId: fb.interviewId,
      sourceType: "interview_risk_signal", sourceRefId: fb.id,
      sourceSummary: `High risk signals detected`,
    };
    const result = await createActionIfNotExists(input);
    if (result.created) { results.createdCount++; results.actions.push({ id: result.actionId!, title: input.title, category: input.category }); }
    else { results.skippedDuplicateCount++; }
  }

  // Rule 4: HIRE/STRONG_HIRE but riskNotes empty → candidate_risk_followup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noRiskNotesFeedbacks: any[] = await prisma.interviewFeedback.findMany({
    where: {
      overallRecommendation: { in: ["STRONG_HIRE", "HIRE"] },
      OR: [{ riskNotes: null }, { riskNotes: "" }],
      interview: { ...scopeWhere },
    },
    include: {
      interview: {
        include: {
          application: {
            include: {
              job: { select: { title: true } },
              candidate: { select: { name: true } },
            },
          },
        },
      },
    },
    take: 20,
  });

  for (const fb of noRiskNotesFeedbacks) {
    const input: CreateActionInput = {
      title: `补充风险记录：${fb.interview.application.candidate.name}`,
      description: `推荐结论为${fb.overallRecommendation}但未记录风险点，建议补充待验证项。`,
      category: "candidate_risk_followup", priority: "medium",
      ownerId: fb.interviewerId, createdById: userId,
      jobId: fb.interview.application.jobId, candidateId: fb.interview.application.candidateId,
      applicationId: fb.interview.application.id, interviewId: fb.interviewId,
      sourceType: "interview_risk_signal", sourceRefId: fb.id,
      sourceSummary: `${fb.overallRecommendation} without risk notes`,
    };
    const result = await createActionIfNotExists(input);
    if (result.created) { results.createdCount++; results.actions.push({ id: result.actionId!, title: input.title, category: input.category }); }
    else { results.skippedDuplicateCount++; }
  }

  // Rule 5: BusinessFeedback 48h+ old → business_feedback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staleBusinessFeedbacks: any[] = await (prisma as any).businessFeedback.findMany({
    where: {
      createdAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      job: { ...scopeWhere },
    },
    include: {
      job: { select: { title: true, businessOwnerId: true } },
    },
    take: 20,
  });

  for (const bf of staleBusinessFeedbacks) {
    const input: CreateActionInput = {
      title: `业务反馈待处理：${bf.job.title}`,
      description: `业务反馈提交超过48小时，decision=${bf.decision}，建议跟进处理。`,
      category: "business_feedback", priority: "medium",
      ownerId: bf.job.businessOwnerId ?? undefined, createdById: userId,
      jobId: bf.jobId,
      candidateId: bf.applicationId ?? undefined,
      applicationId: bf.applicationId ?? undefined,
      sourceType: "business_feedback", sourceRefId: bf.id,
      sourceSummary: `Business feedback pending: ${bf.decision}`,
    };
    const result = await createActionIfNotExists(input);
    if (result.created) { results.createdCount++; results.actions.push({ id: result.actionId!, title: input.title, category: input.category }); }
    else { results.skippedDuplicateCount++; }
  }

  // Rule 6: Job open 7+ days with 0 applications → process_blocker
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staleJobs: any[] = await prisma.job.findMany({
    where: {
      ...scopeWhere,
      status: "ACTIVE",
      createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      applications: { none: {} },
    },
    select: { id: true, title: true, ownerId: true, businessOwnerId: true },
    take: 20,
  });

  for (const job of staleJobs) {
    const input: CreateActionInput = {
      title: `岗位招聘卡点：${job.title}`,
      description: `岗位已开放超过7天，暂无有效候选人投递，建议检查渠道策略或调整画像。`,
      category: "process_blocker", priority: "urgent",
      ownerId: job.ownerId, createdById: userId,
      jobId: job.id,
      sourceType: "job_pipeline", sourceRefId: job.id,
      sourceSummary: `Job open 7+ days with 0 applications`,
    };
    const result = await createActionIfNotExists(input);
    if (result.created) { results.createdCount++; results.actions.push({ id: result.actionId!, title: input.title, category: input.category }); }
    else { results.skippedDuplicateCount++; }
  }

  return results;
}
