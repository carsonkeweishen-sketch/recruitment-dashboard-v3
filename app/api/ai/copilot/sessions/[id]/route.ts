// Phase 8.11: GET/PATCH /api/ai/copilot/sessions/[id]
import { getSession } from "@/server/auth/session";
import { requirePermission } from "@/server/permissions/check-permission";
import { getSession as getCopilotSession, archiveSession } from "@/server/services/ai/copilot-session-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限" }, { status: 403 }); }
  const { id } = await params;
  const s = await getCopilotSession(id, session.userId);
  if (!s) return Response.json({ success: false, error: "未找到该会话" }, { status: 404 });
  return Response.json({ success: true, data: s });
}

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限" }, { status: 403 }); }
  const { id } = await params;
  const s = await archiveSession(id, session.userId);
  return Response.json({ success: true, data: s });
}
