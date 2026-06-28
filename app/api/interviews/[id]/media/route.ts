// Phase 8.10: GET /api/interviews/:id/media — Interview media
import { getSession } from "@/server/auth/session";
import { getInterviewMedia } from "@/server/services/media/media-service";
import { buildScopeWhere } from "@/server/permissions/check-permission";

export async function GET(
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

    const media = await getInterviewMedia(id, scope);
    return Response.json({ success: true, data: media });
  } catch {
    return Response.json({ success: false, error: "加载面试媒体失败" }, { status: 500 });
  }
}
