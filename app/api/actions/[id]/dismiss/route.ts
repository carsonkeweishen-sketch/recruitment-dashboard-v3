// Phase 7: POST /api/actions/:id/dismiss
import { getSession } from "@/server/auth/session";
import { dismissActionItem } from "@/server/services/action/action-service";
import { ActionError } from "@/server/services/action/action-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const action = await dismissActionItem(
      id, session.role, session.userId, session.departmentId,
      (body.dismissedReason as string) || ""
    );
    return Response.json({ success: true, data: action });
  } catch (e) {
    if (e instanceof ActionError) {
      return Response.json({ success: false, error: e.message }, { status: e.statusCode });
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
