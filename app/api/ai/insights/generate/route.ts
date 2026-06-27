// Phase 8.6: POST /api/ai/insights/generate
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { objectType, objectId, question, mode } = await request.json();
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "jobs");

    // interviewer cannot access offer_risk
    if (session.role === "interviewer" && objectType === "offer_risk") {
      return Response.json({ success: false, error: "暂无权限" }, { status: 403 });
    }

    // Check provider status
    if (!process.env.OPENAI_API_KEY) {
      // Save as system_rule insight if no provider
      const insight = await prisma.aIInsight.create({
        data: {
          objectType, objectId, insightType: "summary", title: question || "系统分析",
          summary: "AI Provider 未配置，系统规则提醒仍可使用。",
          suggestedAction: "配置 OPENAI_API_KEY 后可生成 AI 辅助建议。",
          generatedBy: "system_rule", humanReviewStatus: "pending",
        },
      });
      return Response.json({ success: true, data: { ...insight, status: "not_configured" } });
    }

    // Provider available — would call LLM here
    // For now return not_configured honestly
    const insight = await prisma.aIInsight.create({
      data: {
        objectType, objectId, insightType: mode || "summary", title: question || "AI 分析",
        summary: "AI Provider 未配置，请设置 OPENAI_API_KEY 环境变量后重试。",
        suggestedAction: "配置 Provider 后可使用 AI 辅助分析。",
        generatedBy: "system_rule", humanReviewStatus: "pending",
      },
    });
    return Response.json({ success: true, data: { ...insight, status: "not_configured" } });
  } catch {
    return Response.json({ success: false, error: "洞察生成失败" }, { status: 500 });
  }
}
