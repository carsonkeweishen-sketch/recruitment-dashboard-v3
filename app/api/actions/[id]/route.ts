// Phase 7: GET/PATCH /api/actions/:id — Action detail + update
import { getSession } from "@/server/auth/session";
import { getActionDetail, updateActionItem } from "@/server/services/action/action-service";
import { ActionError } from "@/server/services/action/action-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const action = await getActionDetail(id, session.role, session.userId, session.departmentId);
    if (!action) {
      return Response.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: action });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}

export async function PATCH(
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
    const action = await updateActionItem(id, session.role, session.userId, session.departmentId, {
      title: body.title as string | undefined,
      description: body.description as string | undefined,
      priority: body.priority as string | undefined,
      ownerId: body.ownerId as string | undefined,
      status: body.status as string | undefined,
      dueAt: body.dueAt ? new Date(body.dueAt as string) : undefined,
    });
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
