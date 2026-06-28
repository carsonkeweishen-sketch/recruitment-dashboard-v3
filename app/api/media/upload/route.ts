// Phase 8.10: POST /api/media/upload — Upload media asset
import { getSession } from "@/server/auth/session";
import { uploadMedia } from "@/server/services/media/media-service";

const VALID_MEDIA_TYPES = ["audio", "video"];

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const mediaType = body.mediaType as string | undefined;
  if (!mediaType || !VALID_MEDIA_TYPES.includes(mediaType)) {
    return Response.json(
      { success: false, error: `不支持的媒体格式: ${mediaType || "未指定"}，仅支持 audio 和 video` },
      { status: 400 }
    );
  }

  if (!body.objectType || typeof body.objectType !== "string") {
    return Response.json({ success: false, error: "objectType is required" }, { status: 400 });
  }

  if (!body.objectId || typeof body.objectId !== "string") {
    return Response.json({ success: false, error: "objectId is required" }, { status: 400 });
  }

  if (!body.fileName || typeof body.fileName !== "string") {
    return Response.json({ success: false, error: "fileName is required" }, { status: 400 });
  }

  try {
    const asset = await uploadMedia({
      objectType: body.objectType as string,
      objectId: body.objectId as string,
      mediaType: mediaType,
      fileName: body.fileName as string,
      mimeType: body.mimeType as string | undefined,
      fileSize: body.fileSize as number | undefined,
      durationMs: body.durationMs as number | undefined,
      uploadedById: session.userId,
    });

    return Response.json({ success: true, data: asset }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "上传媒体失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
