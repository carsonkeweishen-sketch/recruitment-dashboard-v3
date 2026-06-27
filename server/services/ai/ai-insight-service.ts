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
    const content = await generateCompletion(prompt.systemPrompt, userPrompt);
    const latencyMs = Date.now() - startTime;

    await logCall({
      provider: providerStatus.provider || "openai",
      model: providerStatus.model || "gpt-4o-mini",
      objectType, objectId, promptVersion: prompt.promptVersion,
      requestHash, status: "success", latencyMs, createdById: userId,
    });

    // Parse response content
    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = { summary: content }; }

    const insight = await prisma.aIInsight.create({
      data: {
        objectType, objectId, insightType: mode,
        title: parsed.title || `AI 辅助分析: ${objectType}`,
        summary: parsed.summary || content.substring(0, 500),
        suggestedAction: parsed.suggestedAction || "",
        generatedBy: "llm",
        provider: providerStatus.provider,
        model: providerStatus.model,
        promptVersion: prompt.promptVersion,
        confidence: parsed.confidence || 0.8,
        createdById: userId,
      },
    });

    return {
      answer: parsed.summary || content,
      suggestedAction: parsed.suggestedAction || "",
      confidence: parsed.confidence || 0.8,
      generatedBy: "llm",
      provider: providerStatus.provider,
      model: providerStatus.model,
      promptVersion: prompt.promptVersion,
      evidence: [],
      humanReviewStatus: "pending",
      disclaimer: "AI 辅助建议，仅供参考",
      insightId: insight.id,
    };
  } catch (e) {
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
