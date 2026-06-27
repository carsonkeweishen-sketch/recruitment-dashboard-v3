// Phase 8.8: POST /api/knowledge/ask
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { ask } from "@/server/services/knowledge/knowledge-service";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  // interviewer cannot access offer_risk knowledge
  const { question, collectionKey } = await request.json();
  if (session.role === "interviewer" && collectionKey === "offer_closing") {
    return Response.json({ success: false, error: "暂无权限访问该知识库" }, { status: 403 });
  }
  try {
    const scope = buildScopeWhere({ role: session.role, userId: session.userId, departmentId: session.departmentId }, "jobs");
    const result = await ask(question, collectionKey, scope, session.userId);
    return Response.json({ success: true, data: result });
  } catch { return Response.json({ success: false, error: "知识问答失败" }, { status: 500 }); }
}
