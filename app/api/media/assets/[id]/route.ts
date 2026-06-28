// Phase 8.10: GET /api/media/assets/:id — Media asset detail
import { getSession } from "@/server/auth/session";
import { getMediaAssetById } from "@/server/services/media/media-service";
import { buildScopeWhere } from "@/server/permissions/check-permission";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "interviews"
    );

    const asset = await getMediaAssetById(id, scope);

    if (!asset) {
      return Response.json({ success: false, error: "未找到该媒体资源" }, { status: 404 });
    }

    return Response.json({ success: true, data: asset });
  } catch {
    return Response.json({ success: false, error: "加载媒体资源失败" }, { status: 500 });
  }
}
