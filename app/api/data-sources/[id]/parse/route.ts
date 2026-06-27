// Phase 8.7: POST /api/data-sources/[id]/parse
import { getSession } from "@/server/auth/session";
import { parseSource } from "@/server/services/data-ingestion/data-source-service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const data = await parseSource(id);
    return Response.json({ success: true, data });
  } catch { return Response.json({ success: false, error: "解析失败" }, { status: 500 }); }
}
