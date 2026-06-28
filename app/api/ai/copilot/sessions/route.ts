// Phase 8.11: GET/POST /api/ai/copilot/sessions
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { requirePermission } from "@/server/permissions/check-permission";
import { listSessions, createSession } from "@/server/services/ai/copilot-session-service";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限使用 AI 助手" }, { status: 403 }); }
  const scope = buildScopeWhere(ctx, "aiAssistant");
  const url = new URL(request.url);
  const objectType = url.searchParams.get("objectType") || undefined;
  const objectId = url.searchParams.get("objectId") || undefined;
  const sessions = await listSessions(session.userId, scope, objectType, objectId);
  return Response.json({ success: true, data: sessions });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限使用 AI 助手" }, { status: 403 }); }
  const body = await request.json();
  if (!body.moduleKey || !body.objectType || !body.objectId) return Response.json({ success: false, error: "moduleKey, objectType, objectId are required" }, { status: 400 });
  const s = await createSession({ userId: session.userId, role: session.role, moduleKey: body.moduleKey, objectType: body.objectType, objectId: body.objectId });
  return Response.json({ success: true, data: s }, { status: 201 });
}
