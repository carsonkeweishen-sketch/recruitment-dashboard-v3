// Phase 8.6: POST /api/ai/copilot
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { generateInsight } from "@/server/services/ai/ai-insight-service";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // interviewer cannot access offer_risk AI
  const { objectType, objectId, question, mode } = await request.json();
  if (session.role === "interviewer" && objectType === "offer_risk") {
    return Response.json({ success: false, error: "暂无权限使用 Offer 风险 AI 助手" }, { status: 403 });
  }

  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, objectType === "job" ? "jobs" : objectType === "candidate" ? "candidates" : "interviews");
    if (scope.scope === "DENY") return Response.json({ success: false, error: "暂无权限" }, { status: 403 });

    const result = await generateInsight(objectType, objectId, question, mode, session.userId);
    return Response.json({ success: true, data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("not configured")) {
      return Response.json({ success: true, data: { status: "not_configured", message: "AI Provider 未配置，暂不能生成 AI 辅助建议。系统规则提醒仍可使用。", configLink: "/integrations?provider=deepseek" } });
    }
    return Response.json({ success: false, error: "AI 助手暂时不可用，请稍后重试" }, { status: 500 });
  }
}
