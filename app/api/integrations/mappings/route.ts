// Phase 8.9: GET /api/integrations/mappings
import { getSession } from "@/server/auth/session";
import { getMappings } from "@/server/services/data-ingestion/integration-service";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") ?? undefined;
    const objectType = searchParams.get("objectType") ?? undefined;

    // Admin: all mappings. recruiter/business_owner/hrbp: scoped
    const scopedRoles = ["recruiter", "business_owner", "hrbp"];
    if (session.role !== "admin" && !scopedRoles.includes(session.role)) {
      return Response.json({ success: false, error: "暂无权限查看集成映射" }, { status: 403 });
    }

    const result = await getMappings({ provider, objectType });
    return Response.json({ success: true, data: result });
  } catch {
    return Response.json({ success: false, error: "加载集成映射失败" }, { status: 500 });
  }
}
