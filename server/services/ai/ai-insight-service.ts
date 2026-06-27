// Phase 8.6: AI Insight Service
import { getProviderStatus, generateCompletion } from "@/server/services/ai/ai-provider-service";
import { buildContext } from "@/server/services/ai/ai-context-builder";
import { getPrompt } from "@/server/services/ai/ai-prompt-registry";
import { logCall } from "@/server/services/ai/ai-audit-service";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import crypto from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function generateInsight(objectType: string, objectId: string, question: string, mode: string, userId: string) {
  const providerStatus = getProviderStatus();
  if (providerStatus.status === "not_configured") {
    return { status: "not_configured", message: providerStatus.message };
  }

  const context = await buildContext(objectType, objectId);
  const promptKey = `${objectType}-${mode}-v1` || `${objectType}-risk-explainer-v1`;
  const prompt = getPrompt(promptKey) || getPrompt("job-risk-explainer-v1");
  if (!prompt) throw new Error("No prompt template found");

  const userPrompt = prompt.userPromptTemplate.replace("{{context}}", context).replace("{{question}}", question);
  const requestHash = crypto.createHash("sha256").update(userPrompt).digest("hex").substring(0, 16);

  const startTime = Date.now();
  try {
    const response = await generateCompletion(prompt.systemPrompt, userPrompt, prompt.promptVersion);
    const latencyMs = Date.now() - startTime;

    await logCall({
      provider: providerStatus.provider || "deepseek",
      model: providerStatus.model || "deepseek-v4-flash",
      objectType, objectId, promptVersion: prompt.promptVersion,
      requestHash, status: "success", latencyMs, createdById: userId,
      tokenUsageInput: response.tokenUsageInput, tokenUsageOutput: response.tokenUsageOutput,
    });

    const insight = await prisma.aIInsight.create({
      data: {
        objectType, objectId, insightType: mode,
        title: `${objectType} AI 辅助分析`,
        summary: response.answer,
        suggestedAction: response.suggestedAction,
        generatedBy: "llm",
        provider: response.provider,
        model: response.model,
        promptVersion: response.promptVersion,
        confidence: response.confidence,
        createdById: userId,
      },
    });

    return {
      answer: response.answer,
      suggestedAction: response.suggestedAction,
      confidence: response.confidence,
      generatedBy: "llm",
      provider: response.provider,
      model: response.model,
      promptVersion: response.promptVersion,
      evidence: response.evidence,
      humanReviewStatus: "pending",
      disclaimer: "AI 辅助建议，仅供参考",
      insightId: insight.id,
    };
  } catch (e) {
    console.error("generateInsight error:", e);
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    await logCall({
      provider: providerStatus.provider || "openai",
      model: providerStatus.model || "gpt-4o-mini",
      objectType, objectId, promptVersion: prompt?.promptVersion || "v1",
      requestHash, status: "error", errorCode: "PROVIDER_ERROR", errorMessage: errorMsg, createdById: userId,
    });
    throw e;
  }
}

export async function listInsights(objectType?: string, objectId?: string) {
  const where: Record<string, unknown> = {};
  if (objectType) where.objectType = objectType;
  if (objectId) where.objectId = objectId;
  return prisma.aIInsight.findMany({ where, orderBy: { createdAt: "desc" }, take: 20 });
}

export async function getInsight(id: string) {
  return prisma.aIInsight.findUnique({ where: { id }, include: { evidences: true, reviews: true } });
}

export async function reviewInsight(insightId: string, reviewerId: string, status: string, reviewNote?: string, editedSummary?: string, editedSuggestedAction?: string) {
  await prisma.aIHumanReview.create({
    data: { aiInsightId: insightId, reviewerId, status, reviewNote, editedSummary, editedSuggestedAction },
  });
  return prisma.aIInsight.update({ where: { id: insightId }, data: { humanReviewStatus: status } });
}
