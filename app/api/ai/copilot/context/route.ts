// Phase 8.11: GET /api/ai/copilot/context — Preview context sources
import { getSession } from "@/server/auth/session";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import { buildCopilotContext } from "@/server/services/ai/copilot-context-builder-v2";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限" }, { status: 403 }); }
  const scope = buildScopeWhere(ctx, "aiAssistant");
  if (scope.scope === "DENY") return Response.json({ success: false, error: "暂无权限" }, { status: 403 });

  const url = new URL(request.url);
  const moduleKey = url.searchParams.get("moduleKey") || "dashboard";
  const objectType = url.searchParams.get("objectType") || "dashboard";
  const objectId = url.searchParams.get("objectId") || "global";
  const question = url.searchParams.get("question") || undefined;

  try {
    const built = await buildCopilotContext({ moduleKey, objectType, objectId, scope, question });
    return Response.json({ success: true, data: { sources: built.sources, noEvidence: built.noEvidence, scopeInfo: built.scopeInfo } });
  } catch (err) {
    return Response.json({ success: false, error: err instanceof Error ? err.message : "构建上下文失败" }, { status: 500 });
  }
}
