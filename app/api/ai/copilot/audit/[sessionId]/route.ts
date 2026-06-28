// Phase 8.11: GET /api/ai/copilot/audit/[sessionId]
import { getSession } from "@/server/auth/session";
import { requirePermission } from "@/server/permissions/check-permission";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) { const pool = new Pool({ connectionString: process.env.DATABASE_URL }); _prisma = new PrismaClient({ adapter: new PrismaPg(pool) }); }
  return _prisma;
}

export async function GET(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限" }, { status: 403 }); }

  const { sessionId } = await params;
  const p = getPrisma();

  // Only admin can view any session; others can only view their own
  const where = session.role === "admin" ? { id: sessionId } : { id: sessionId, userId: session.userId };
  const copilotSession = await p.aICopilotSession.findFirst({ where, include: { messages: { orderBy: { createdAt: "asc" }, include: { contextRefs: true, reviewEvents: true, draftActions: true } } } });
  if (!copilotSession) return Response.json({ success: false, error: "未找到该会话" }, { status: 404 });

  return Response.json({ success: true, data: copilotSession });
}
