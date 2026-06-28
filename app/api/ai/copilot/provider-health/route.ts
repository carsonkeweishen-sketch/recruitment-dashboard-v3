// Phase 8.11: GET /api/ai/copilot/provider-health
import { getSession } from "@/server/auth/session";
import { requirePermission } from "@/server/permissions/check-permission";
import { getProviderStatus } from "@/server/services/ai/ai-provider-service";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  // view permission — even business_owner/interviewer can see provider status
  try { requirePermission(ctx, "aiAssistant", "view"); } catch { return Response.json({ success: false, error: "暂无权限" }, { status: 403 }); }
  return Response.json({ success: true, data: getProviderStatus() });
}
