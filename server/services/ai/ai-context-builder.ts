// Phase 8.6: AI Context Builder
// Builds scope-aware context for each object type. No sensitive data.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { redact } from "@/server/services/ai/ai-redaction-service";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function buildContext(objectType: string, objectId: string): Promise<string> {
  let context = "";
  switch (objectType) {
    case "job": {
      const job = await prisma.job.findUnique({ where: { id: objectId }, select: { title: true, jdText: true, profileSummary: true, headcount: true } });
      if (!job) return "{}";
      const appCount = await prisma.application.count({ where: { jobId: objectId } });
      const openActions = await prisma.actionItem.count({ where: { jobId: objectId, status: "open" } });
      context = JSON.stringify({ title: job.title, jdSummary: job.jdText?.substring(0, 500), profileSummary: job.profileSummary, headcount: job.headcount, applicationCount: appCount, openActions });
      break;
    }
    case "candidate": {
      const app = await prisma.application.findFirst({ where: { candidateId: objectId }, select: { stage: true, job: { select: { title: true } }, candidate: { select: { name: true, currentCompany: true, currentTitle: true } } } });
      if (!app) return "{}";
      const openActions = await prisma.actionItem.count({ where: { candidateId: objectId, status: "open" } });
      context = JSON.stringify({ candidateName: app.candidate.name, jobTitle: app.job.title, stage: app.stage, currentCompany: app.candidate.currentCompany, currentTitle: app.candidate.currentTitle, openActions });
      break;
    }
    case "interview_quality": {
      const fb = await prisma.interviewFeedback.findUnique({ where: { id: objectId }, select: { feedbackQualityScore: true, overallRecommendation: true, evidenceText: true, scores: true } });
      if (!fb) return "{}";
      context = JSON.stringify({ feedbackQualityScore: fb.feedbackQualityScore, recommendation: fb.overallRecommendation, evidenceText: fb.evidenceText?.substring(0, 500), scores: fb.scores });
      break;
    }
    case "offer_risk": {
      const risk = await prisma.offerRisk.findUnique({ where: { id: objectId }, select: { riskType: true, level: true, description: true } });
      if (!risk) return "{}";
      context = JSON.stringify({ riskType: risk.riskType, riskLevel: risk.level, description: risk.description });
      break;
    }
    case "action": {
      const action = await prisma.actionItem.findUnique({ where: { id: objectId }, select: { title: true, category: true, priority: true, status: true, description: true } });
      if (!action) return "{}";
      context = JSON.stringify(action);
      break;
    }
    default:
      context = "{}";
  }
  return redact(context);
}
