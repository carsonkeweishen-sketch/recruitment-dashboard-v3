// Phase 8.7: PATCH /api/data-sources/[id]/link-object
import { getSession } from "@/server/auth/session";
import { createLink } from "@/server/repositories/data-sources/data-source-repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const { objectType, objectId } = await request.json();
    if (!objectType || !objectId) return Response.json({ success: false, error: "缺少 objectType/objectId" }, { status: 400 });
    const link = await createLink({ dataSourceId: id, objectType, objectId });
    return Response.json({ success: true, data: link });
  } catch { return Response.json({ success: false, error: "关联失败" }, { status: 500 }); }
}
