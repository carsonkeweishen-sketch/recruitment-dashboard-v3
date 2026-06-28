// Phase 8.11: Copilot Chat Service — 核心流程
// session → context → no-evidence短路 → 三路脱敏 → LLM → 持久化 + ActivityLog
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getProviderStatus, generateCompletion } from "./ai-provider-service";
import { buildCopilotContext } from "./copilot-context-builder-v2";
import { getDefaultPrompt } from "./copilot-prompt-registry-v2";
import { redactAll } from "./copilot-redaction-service";
import { logCall } from "./ai-audit-service";
import { logCopilotActivity, COPILOT_ACTIVITIES } from "./copilot-activity-helper";
import { createSession } from "./copilot-session-service";
import type { ScopeWhere } from "@/server/permissions/types";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) { const pool = new Pool({ connectionString: process.env.DATABASE_URL }); _prisma = new PrismaClient({ adapter: new PrismaPg(pool) }); }
  return _prisma;
}

export interface ChatParams {
  sessionId?: string;
  moduleKey: string;
  objectType: string;
  objectId: string;
  question: string;
  extraRefIds?: string[];
}

export async function chat(params: ChatParams, ctx: { userId: string; role: string; scope: ScopeWhere }): Promise<Record<string, unknown>> {
  const p = getPrisma();

  // 1. Create/reuse session
  const session = await createSession({ userId: ctx.userId, role: ctx.role, moduleKey: params.moduleKey, objectType: params.objectType, objectId: params.objectId });

  // 2. Persist user message
  await p.aICopilotMessage.create({ data: { sessionId: session.id, role: "user", content: params.question } });

  // 3. Build context (v2, with scope)
  const built = await buildCopilotContext({
    moduleKey: params.moduleKey, objectType: params.objectType, objectId: params.objectId,
    scope: ctx.scope, question: params.question, extraRefIds: params.extraRefIds,
  });

  // 4. Write contextRefs
  for (const src of built.sources) {
    await p.aICopilotContextRef.create({ data: { sessionId: session.id, messageId: null, refType: src.refType, refId: src.refId, objectType: src.objectType, objectId: src.objectId, sourceLabel: src.sourceLabel, excerpt: src.excerpt?.substring(0, 1000), redactionStatus: src.redactionStatus } });
  }

  // 5. ActivityLog: CONTEXT_BUILT
  await logCopilotActivity(ctx.userId, COPILOT_ACTIVITIES.CONTEXT_BUILT, "ai_copilot_session", session.id, { sourceCount: built.sources.length, noEvidence: built.noEvidence });

  // 6. no-evidence short circuit — do NOT call LLM
  if (built.noEvidence) {
    const msg = await p.aICopilotMessage.create({ data: { sessionId: session.id, role: "assistant", content: "当前上下文证据不足，无法生成 AI 建议。请补充相关数据后再试。", answerStatus: "no_evidence" } });
    await logCopilotActivity(ctx.userId, COPILOT_ACTIVITIES.NO_EVIDENCE, "ai_copilot_session", session.id, { missingSources: built.sources.filter((s) => s.isRequired && !s.hasEvidence).map((s) => s.refType) });
    return { status: "no_evidence", messageId: msg.id, sessionId: session.id, contextRefs: built.sources, providerStatus: "not_called" };
  }

  // 7. Provider status check
  const providerStatus = getProviderStatus();
  if (providerStatus.status === "not_configured") {
    const msg = await p.aICopilotMessage.create({ data: { sessionId: session.id, role: "assistant", content: providerStatus.message || "AI Provider 未配置", answerStatus: "not_configured" } });
    return { status: "not_configured", messageId: msg.id, sessionId: session.id, contextRefs: built.sources };
  }

  // 8. Load prompt
  const prompt = await getDefaultPrompt(params.moduleKey, params.objectType);
  if (!prompt) throw new Error("No prompt template found");

  // 9. Three-way redaction
  const sanitizedSystem = redactAll(prompt.systemPrompt);
  const sanitizedUser = redactAll(prompt.userPromptTemplate.replace("{{context}}", built.aggregatedContext).replace("{{question}}", params.question || "").replace("{{scope}}", `${ctx.role} / ${built.scopeInfo.scope}`));

  // 10. Call LLM
  const requestHash = crypto.createHash("sha256").update(sanitizedUser).digest("hex").substring(0, 16);
  const startTime = Date.now();
  let response;
  try {
    response = await generateCompletion(sanitizedSystem, sanitizedUser, prompt.promptVersion);
  } catch (e) {
    await logCall({ provider: providerStatus.provider || "deepseek", model: providerStatus.model || "unknown", objectType: params.objectType, objectId: params.objectId, promptVersion: prompt.promptVersion, requestHash, status: "error", errorCode: "PROVIDER_ERROR", errorMessage: (e as Error).message, createdById: ctx.userId });
    const msg = await p.aICopilotMessage.create({ data: { sessionId: session.id, role: "assistant", content: "AI 助手暂时不可用，请稍后重试", answerStatus: "error" } });
    return { status: "error", messageId: msg.id, sessionId: session.id };
  }

  // 11. Persist assistant message
  const assistantMsg = await p.aICopilotMessage.create({ data: { sessionId: session.id, role: "assistant", content: response.answer, answerStatus: "generated", provider: response.provider, model: response.model, promptVersion: response.promptVersion } });

  // 12. Backfill contextRefs messageId
  await p.aICopilotContextRef.updateMany({ where: { sessionId: session.id, messageId: null }, data: { messageId: assistantMsg.id } });

  // 13. Create draft actions (AI generates drafts, does NOT create real actions)
  const draftActions = [];
  const rawDrafts = (response as Record<string, unknown>).draftActions as Array<Record<string, string>> | undefined;
  if (rawDrafts && Array.isArray(rawDrafts)) {
    for (const da of rawDrafts) {
      const draft = await p.aIDraftAction.create({ data: { sourceMessageId: assistantMsg.id, title: da.title || "AI 建议行动", description: da.description || "", category: da.category || "ai_suggestion", priority: da.priority || "medium" } });
      draftActions.push(draft);
      await logCopilotActivity(ctx.userId, COPILOT_ACTIVITIES.DRAFT_ACTION_CREATED, "ai_draft_action", draft.id, { title: draft.title });
    }
  }

  // 14. ActivityLog + AICallLog
  await logCopilotActivity(ctx.userId, COPILOT_ACTIVITIES.ANSWER_GENERATED, "ai_copilot_message", assistantMsg.id, { provider: response.provider, model: response.model, latencyMs: Date.now() - startTime, draftCount: draftActions.length });
  await logCall({ provider: response.provider, model: response.model, objectType: params.objectType, objectId: params.objectId, promptVersion: prompt.promptVersion, requestHash, status: "success", latencyMs: Date.now() - startTime, createdById: ctx.userId, tokenUsageInput: response.tokenUsageInput, tokenUsageOutput: response.tokenUsageOutput });

  return { status: "generated", messageId: assistantMsg.id, sessionId: session.id, answer: response.answer, suggestedAction: response.suggestedAction, evidence: response.evidence, draftActions, contextRefs: built.sources, provider: response.provider, model: response.model, promptVersion: response.promptVersion, disclaimer: "AI 辅助建议，仅供参考" };
}
