// Phase 8.1: GET /api/dashboard/ai
// Aggregated AI recruitment insight dashboard API.
// All data from real DB, all insights from system rules (not LLM).

import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getAiDashboardData } from "@/server/services/dashboard/ai-dashboard-service";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Interviewer should not access global dashboard
  if (session.role === "interviewer") {
    return Response.json(
      { success: false, error: "暂无权限查看招聘洞察。如需查看，请联系招聘负责人或管理员。" },
      { status: 403 }
    );
  }

  try {
    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "dashboard"
    );

    const data = await getAiDashboardData(
      scope,
      session.userId,
      session.role,
      session.departmentId
    );

    return Response.json({ success: true, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    if (msg.includes("Permission denied")) {
      return Response.json(
        { success: false, error: "暂无权限查看招聘洞察" },
        { status: 403 }
      );
    }
    return Response.json(
      { success: false, error: "招聘洞察加载失败，请稍后重试" },
      { status: 500 }
    );
  }
}
