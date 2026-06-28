// Phase 8.11: POST /api/ai/copilot/chat — Generate AI answer
import { getSession } from "@/server/auth/session";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import { chat } from "@/server/services/ai/copilot-chat-service";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限使用 AI 助手" }, { status: 403 }); }
  const scope = buildScopeWhere(ctx, "aiAssistant");
  if (scope.scope === "DENY") return Response.json({ success: false, error: "暂无权限" }, { status: 403 });

  const body = await request.json();
  if (!body.question || !body.moduleKey || !body.objectType || !body.objectId)
    return Response.json({ success: false, error: "question, moduleKey, objectType, objectId are required" }, { status: 400 });

  try {
    const result = await chat({ sessionId: body.sessionId, moduleKey: body.moduleKey, objectType: body.objectType, objectId: body.objectId, question: body.question, extraRefIds: body.extraRefIds }, { userId: session.userId, role: session.role, scope });
    return Response.json({ success: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI 助手暂时不可用";
    return Response.json({ success: false, error: msg }, { status: 500 });
  }
}
