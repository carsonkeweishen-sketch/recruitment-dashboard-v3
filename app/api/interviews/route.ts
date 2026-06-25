// Phase 6: Interviews API
import { getSession } from "@/server/auth/session";
import { listInterviews } from "@/server/services/interview/interview-service";

export async function GET(request: Request) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);

  const result = await listInterviews(session.role, session.userId, session.departmentId, {
    jobId: searchParams.get("jobId") ?? undefined,
    applicationId: searchParams.get("applicationId") ?? undefined,
    interviewerId: searchParams.get("interviewerId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  return Response.json({ success: true, ...result });
}
