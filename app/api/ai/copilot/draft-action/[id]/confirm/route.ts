// Phase 8.11: POST /api/ai/copilot/draft-action/[id]/confirm — Confirm draft to real Action
import { getSession } from "@/server/auth/session";
import { requirePermission } from "@/server/permissions/check-permission";
import { confirmDraftAction } from "@/server/services/ai/copilot-draft-action-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  // Double permission: aiAssistant:analyze + actions:create
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限" }, { status: 403 }); }
  try { requirePermission(ctx, "actions", "create"); } catch { return Response.json({ success: false, error: "暂无权限创建行动项" }, { status: 403 }); }

  const { id } = await params;
  const body = await request.json();
  if (!body.ownerId) return Response.json({ success: false, error: "ownerId is required" }, { status: 400 });

  try {
    const result = await confirmDraftAction(id, session.userId, { ownerId: body.ownerId, dueAt: body.dueAt ? new Date(body.dueAt) : undefined, note: body.note });
    return Response.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    return Response.json({ success: false, error: err instanceof Error ? err.message : "确认草稿失败" }, { status: 500 });
  }
}
