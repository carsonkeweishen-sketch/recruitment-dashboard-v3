// Phase 6: Interview Detail API
import { getSession } from "@/server/auth/session";
import { getInterviewDetail } from "@/server/services/interview/interview-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const _session = await getSession();
  const { id } = await params;
  const detail = await getInterviewDetail(id);
  if (!detail) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  return Response.json({ success: true, data: detail });
}
