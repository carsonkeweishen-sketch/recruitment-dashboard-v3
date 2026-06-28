// Phase 8.10: POST /api/media/assets/:id/transcribe — Create transcription job
import { getSession } from "@/server/auth/session";
import { createTranscriptionJob, getMediaAssetById } from "@/server/services/media/media-service";
import { buildScopeWhere } from "@/server/permissions/check-permission";

export async function POST(
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

    // Verify the media asset exists and is within scope
    const asset = await getMediaAssetById(id, scope);
    if (!asset) {
      return Response.json({ success: false, error: "未找到该媒体资源" }, { status: 404 });
    }

    const result = await createTranscriptionJob(id, session.userId);

    if (result.status === "not_configured") {
      return Response.json({
        success: true,
        status: "not_configured",
        message: "DeepSeek 转录服务未配置，请先配置 DEEPSEEK_API_KEY 环境变量。",
        data: result.job,
      });
    }

    return Response.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "创建转录任务失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
