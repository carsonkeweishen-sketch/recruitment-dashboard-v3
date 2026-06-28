// Phase 8.10: POST /api/speech/transcripts/import — Manual transcript import
import { getSession } from "@/server/auth/session";
import { createManualTranscript } from "@/server/services/media/media-service";
import { getMediaAssetById } from "@/server/services/media/media-service";
import { buildScopeWhere } from "@/server/permissions/check-permission";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // interviewer: 403
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
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

  const segments = body.segments as Array<{
    speakerRole?: string;
    speakerLabel?: string | null;
    startMs?: number | null;
    endMs?: number | null;
    text: string;
  }> | undefined;

  if (!segments || !Array.isArray(segments) || segments.length === 0) {
    return Response.json(
      { success: false, error: "segments is required and must be a non-empty array" },
      { status: 400 }
    );
  }

  for (let i = 0; i < segments.length; i++) {
    if (!segments[i].text || typeof segments[i].text !== "string") {
      return Response.json(
        { success: false, error: `segments[${i}].text is required` },
        { status: 400 }
      );
    }
  }

  try {
    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "interviews"
    );

    // Verify the media asset exists and is within scope
    const asset = await getMediaAssetById(mediaAssetId, scope);
    if (!asset) {
      return Response.json({ success: false, error: "未找到该媒体资源" }, { status: 404 });
    }

    const transcript = await createManualTranscript(
      mediaAssetId,
      {
        text: body.text as string | undefined,
        segments: segments.map((s) => ({
          speakerLabel: s.speakerLabel ?? null,
          startMs: s.startMs ?? null,
          endMs: s.endMs ?? null,
          text: s.text,
        })),
      },
      session.userId
    );

    return Response.json({ success: true, data: transcript }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "导入手动转录失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
