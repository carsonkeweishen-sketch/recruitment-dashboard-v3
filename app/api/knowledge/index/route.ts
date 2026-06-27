// Phase 8.8: POST /api/knowledge/index (from-datasource)
import { getSession } from "@/server/auth/session";
import { indexFromDataSource } from "@/server/services/knowledge/knowledge-service";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { dataSourceId } = await request.json();
    if (!dataSourceId) return Response.json({ success: false, error: "dataSourceId required" }, { status: 400 });
    const result = await indexFromDataSource(dataSourceId);
    if (!result.success) return Response.json({ success: false, error: result.error }, { status: 400 });
    return Response.json({ success: true, data: result }, { status: 201 });
  } catch { return Response.json({ success: false, error: "索引失败" }, { status: 500 }); }
}
