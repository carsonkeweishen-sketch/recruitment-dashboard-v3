// Phase 7: POST /api/actions/generate — Run rule-based action generation
import { getSession } from "@/server/auth/session";
import { buildScopeWhere, requirePermission } from "@/server/permissions/check-permission";
import { generateActions } from "@/server/services/action/action-rule-service";

export async function POST(_request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    requirePermission({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "actions", "create");
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "actions");
    const result = await generateActions(scope, session.userId);
    return Response.json({ success: true, data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
