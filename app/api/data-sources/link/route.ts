// Phase 8.7: POST /api/data-sources/link
import { getSession } from "@/server/auth/session";
import { createLinkRecord } from "@/server/services/data-ingestion/data-source-service";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { sourceType, sourceSystem, externalUrl, externalId, objectType, objectId, usageType } = await request.json();
    if (!sourceType || !externalUrl) return Response.json({ success: false, error: "缺少必要参数" }, { status: 400 });
    const data = await createLinkRecord({ sourceType, sourceSystem: sourceSystem || "external", externalUrl, externalId, objectType, objectId, usageType, uploadedById: session.userId });
    return Response.json({ success: true, data }, { status: 201 });
  } catch { return Response.json({ success: false, error: "链接导入失败" }, { status: 500 }); }
}
