// Phase 8.10: GET /api/speech/transcripts/:id — Transcript detail with segments
import { getSession } from "@/server/auth/session";
import { getTranscriptById } from "@/server/services/media/media-service";
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
    const transcript = await getTranscriptById(id);
    if (!transcript) {
      return Response.json({ success: false, error: "未找到该转写记录" }, { status: 404 });
    }

    // Scope check: verify the associated media asset is within scope
    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "interviews"
    );

    const asset = await getMediaAssetById(transcript.mediaAssetId, scope);
    if (!asset) {
      return Response.json({ success: false, error: "未找到该媒体资源" }, { status: 404 });
    }

    return Response.json({ success: true, data: transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : "获取转写详情失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
