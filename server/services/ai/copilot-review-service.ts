// Phase 8.11: Copilot Review Service — accepted/edited/rejected 三态
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { logCopilotActivity, COPILOT_ACTIVITIES } from "./copilot-activity-helper";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) { const pool = new Pool({ connectionString: process.env.DATABASE_URL }); _prisma = new PrismaClient({ adapter: new PrismaPg(pool) }); }
  return _prisma;
}

export async function reviewMessage(params: { messageId: string; reviewerId: string; status: "accepted" | "edited" | "rejected"; editedContent?: string; reviewNote?: string }) {
  const p = getPrisma();
  const event = await p.aIReviewEvent.create({ data: { messageId: params.messageId, reviewStatus: params.status, editedContent: params.editedContent, reviewedById: params.reviewerId, reviewNote: params.reviewNote } });
  await p.aICopilotMessage.update({ where: { id: params.messageId }, data: { humanReviewStatus: params.status } });

  const activityMap = {
    accepted: COPILOT_ACTIVITIES.REVIEW_ACCEPTED,
    edited: COPILOT_ACTIVITIES.REVIEW_EDITED,
    rejected: COPILOT_ACTIVITIES.REVIEW_REJECTED,
  };
  await logCopilotActivity(params.reviewerId, activityMap[params.status], "ai_copilot_message", params.messageId, { status: params.status });
  return event;
}
