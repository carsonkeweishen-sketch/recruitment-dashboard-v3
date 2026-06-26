// Phase 6: GET /api/interviews — List interviews with metrics
import { getSession } from "@/server/auth/session";
import { listInterviewList } from "@/server/services/interview/interview-service";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters = {
    status: searchParams.get("status") || undefined,
    round: searchParams.get("round") || undefined,
  };

  try {
    const result = await listInterviewList(
      session.role,
      session.userId,
      session.departmentId,
      filters
    );
    return Response.json({ success: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
