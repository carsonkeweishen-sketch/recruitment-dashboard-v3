// Phase 8.10: GET /api/media/assets — List media assets with filters
import { getSession } from "@/server/auth/session";
import { getMediaAssets } from "@/server/services/media/media-service";
import { buildScopeWhere } from "@/server/permissions/check-permission";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(request.url);
    const filters = {
      objectType: url.searchParams.get("objectType") || undefined,
      objectId: url.searchParams.get("objectId") || undefined,
      mediaType: url.searchParams.get("mediaType") || undefined,
      transcriptionStatus: url.searchParams.get("transcriptionStatus") || undefined,
      limit: url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : undefined,
      offset: url.searchParams.get("offset") ? parseInt(url.searchParams.get("offset")!, 10) : undefined,
    };

    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "interviews"
    );

    const result = await getMediaAssets(filters, scope);
    return Response.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "加载媒体资源失败";
    console.error("GET /api/media/assets error:", message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
