// Phase 8.11: POST /api/ai/copilot/draft-action — Create draft action
import { getSession } from "@/server/auth/session";
import { requirePermission } from "@/server/permissions/check-permission";
import { createDraftAction } from "@/server/services/ai/copilot-draft-action-service";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限" }, { status: 403 }); }
  const body = await request.json();
  if (!body.sourceMessageId || !body.title) return Response.json({ success: false, error: "sourceMessageId and title are required" }, { status: 400 });
  const draft = await createDraftAction({ sourceMessageId: body.sourceMessageId, title: body.title, description: body.description, category: body.category, priority: body.priority, suggestedOwnerId: body.suggestedOwnerId, dueAt: body.dueAt ? new Date(body.dueAt) : undefined });
  return Response.json({ success: true, data: draft }, { status: 201 });
}
