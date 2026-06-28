// Phase 8.10: POST /api/speech/transcripts/:id/analyze — Run communication analysis
import { getSession } from "@/server/auth/session";
import { analyzeCommunication } from "@/server/services/speech/communication-analysis-service";
import { getTranscriptById } from "@/server/services/media/media-service";
import { getMediaAssetById } from "@/server/services/media/media-service";
import { buildScopeWhere } from "@/server/permissions/check-permission";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // interviewer: 403
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const transcript = await getTranscriptById(id);
    if (!transcript) {
      return Response.json({ success: false, error: "未找到该转写记录" }, { status: 404 });
    }

    // Scope check
    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "interviews"
    );

    const asset = await getMediaAssetById(transcript.mediaAssetId, scope);
    if (!asset) {
      return Response.json({ success: false, error: "未找到该媒体资源" }, { status: 404 });
    }

    // No segments → 400
    if (!transcript.segments || transcript.segments.length === 0) {
      return Response.json(
        { success: false, error: "无转写段落，无法分析" },
        { status: 400 }
      );
    }

    const report = await analyzeCommunication(id, session.userId);
    return Response.json({ success: true, data: report });
  } catch (err) {
    const message = err instanceof Error ? err.message : "分析失败";
    const status = message === "无转写段落，无法分析" ? 400 : 500;
    return Response.json({ success: false, error: message }, { status });
  }
}
