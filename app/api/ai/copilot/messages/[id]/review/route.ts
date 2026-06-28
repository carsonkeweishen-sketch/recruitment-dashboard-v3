// Phase 8.11: PATCH /api/ai/copilot/messages/[id]/review
import { getSession } from "@/server/auth/session";
import { requirePermission } from "@/server/permissions/check-permission";
import { reviewMessage } from "@/server/services/ai/copilot-review-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限" }, { status: 403 }); }

  const { id } = await params;
  const body = await request.json();
  if (!body.status || !["accepted", "edited", "rejected"].includes(body.status))
    return Response.json({ success: false, error: "status must be accepted/edited/rejected" }, { status: 400 });

  try {
    const event = await reviewMessage({ messageId: id, reviewerId: session.userId, status: body.status, editedContent: body.editedContent, reviewNote: body.reviewNote });
    return Response.json({ success: true, data: event });
  } catch (err) {
    return Response.json({ success: false, error: err instanceof Error ? err.message : "审核失败" }, { status: 500 });
  }
}
