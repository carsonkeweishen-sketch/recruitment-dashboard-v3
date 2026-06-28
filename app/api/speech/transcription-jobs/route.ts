// Phase 8.10: POST /api/speech/transcription-jobs — Create transcription job
import { getSession } from "@/server/auth/session";

export async function POST(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // interviewer: 403 — only admin/leader/hrbp/recruiter can create jobs
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await _request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const mediaAssetId = body.mediaAssetId as string | undefined;
  if (!mediaAssetId || typeof mediaAssetId !== "string") {
    return Response.json(
      { success: false, error: "mediaAssetId is required" },
      { status: 400 }
    );
  }

  // Provider not configured → manual_import_required
  return Response.json({
    success: true,
    status: "manual_import_required",
    message: "DeepSeek 转录服务未配置，请使用手动导入功能。",
    data: {
      mediaAssetId,
      provider: "deepseek",
      providerStatus: "not_configured",
      status: "manual_import_required",
    },
  });
}
