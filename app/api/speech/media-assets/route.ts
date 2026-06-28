// Phase 8.10: GET /api/speech/media-assets — Scope-filtered media list
import { getSession } from "@/server/auth/session";
import { getMediaAssets } from "@/server/services/media/media-service";
import { buildScopeWhere } from "@/server/permissions/check-permission";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const objectType = searchParams.get("objectType") ?? undefined;
    const objectId = searchParams.get("objectId") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;

    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "interviews"
    );

    const result = await getMediaAssets(
      { objectType, objectId, transcriptionStatus: status, limit, offset },
      scope
    );

    return Response.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "获取媒体资源列表失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
