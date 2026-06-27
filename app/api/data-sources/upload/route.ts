// Phase 8.7: POST /api/data-sources/upload
import { getSession } from "@/server/auth/session";
import { createUpload } from "@/server/services/data-ingestion/data-source-service";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { fileName, fileMimeType, fileSize, fileUrl, objectType, objectId, usageType } = await request.json();
    if (!fileName || !fileMimeType) return Response.json({ success: false, error: "缺少必要参数" }, { status: 400 });
    const data = await createUpload({ fileName, fileMimeType, fileSize: fileSize || 0, fileUrl: fileUrl || "", objectType, objectId, usageType, uploadedById: session.userId });
    return Response.json({ success: true, data }, { status: 201 });
  } catch { return Response.json({ success: false, error: "上传失败" }, { status: 500 }); }
}
