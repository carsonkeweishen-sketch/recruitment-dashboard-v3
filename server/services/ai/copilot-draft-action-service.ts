// Phase 8.11: Copilot Draft Action Service
// AI 只生成草稿，confirm 才创建真实 ActionItem
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { logCopilotActivity, COPILOT_ACTIVITIES } from "./copilot-activity-helper";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) { const pool = new Pool({ connectionString: process.env.DATABASE_URL }); _prisma = new PrismaClient({ adapter: new PrismaPg(pool) }); }
  return _prisma;
}

export async function createDraftAction(params: { sourceMessageId: string; title: string; description?: string; category?: string; priority?: string; suggestedOwnerId?: string; dueAt?: Date }) {
  return getPrisma().aIDraftAction.create({ data: { sourceMessageId: params.sourceMessageId, title: params.title, description: params.description || "", category: params.category || "ai_suggestion", priority: params.priority || "medium", suggestedOwnerId: params.suggestedOwnerId, dueAt: params.dueAt } });
}

export async function confirmDraftAction(draftId: string, userId: string, confirmParams: { ownerId: string; dueAt?: Date; note?: string }) {
  const p = getPrisma();
  const draft = await p.aIDraftAction.findUnique({ where: { id: draftId }, include: { sourceMessage: { include: { session: true } } } });
  if (!draft) throw new Error("Draft not found");
  if (draft.status !== "draft") throw new Error("Draft already processed");

  // Create real ActionItem
  const session = draft.sourceMessage.session;
  const action = await p.actionItem.create({ data: {
    title: draft.title, description: draft.description || "", category: draft.category, priority: draft.priority,
    ownerId: confirmParams.ownerId, createdById: userId,
    sourceType: "ai_copilot", sourceRefId: draft.sourceMessageId, sourceSummary: draft.description || "",
    dueAt: confirmParams.dueAt,
    jobId: session.objectType === "job" ? session.objectId : null,
    candidateId: session.objectType === "candidate" ? session.objectId : null,
  }});

  await p.aIDraftAction.update({ where: { id: draftId }, data: { status: "confirmed", confirmedActionId: action.id } });
  await logCopilotActivity(userId, COPILOT_ACTIVITIES.DRAFT_ACTION_CONFIRMED, "action_item", action.id, { draftId, title: draft.title });
  return { action, draft };
}

export async function dismissDraftAction(draftId: string) {
  return getPrisma().aIDraftAction.update({ where: { id: draftId }, data: { status: "dismissed" } });
}

export async function listDraftActions(messageId: string) {
  return getPrisma().aIDraftAction.findMany({ where: { sourceMessageId: messageId }, orderBy: { createdAt: "desc" } });
}
