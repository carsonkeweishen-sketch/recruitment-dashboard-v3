// Phase 8.7: GET /api/data-sources/[id]
import { getSession } from "@/server/auth/session";
import { getSource } from "@/server/services/data-ingestion/data-source-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const data = await getSource(id);
    if (!data) return Response.json({ success: false, error: "Not found" }, { status: 404 });
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "资料加载失败" }, { status: 500 }); }
}
