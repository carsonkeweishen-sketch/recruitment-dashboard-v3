import { getSession } from "@/server/auth/session";
import { listApplications } from "@/server/services/applications/application-service";
import { requirePermission } from "@/server/permissions/check-permission";

export async function GET(request: Request) {
  const session = await getSession();
  requirePermission(session, "applications", "view");

  const { searchParams } = new URL(request.url);
  const apps = await listApplications(session.role, session.userId, session.departmentId, {
    jobId: searchParams.get("jobId") ?? undefined,
    candidateId: searchParams.get("candidateId") ?? undefined,
    stage: searchParams.get("stage") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    ownerId: searchParams.get("ownerId") ?? undefined,
    source: searchParams.get("source") ?? undefined,
  });

  const data = apps.map((a) => ({
    id: a.id,
    candidate: a.candidate ? { id: a.candidate.id, name: a.candidate.name, currentCompany: a.candidate.currentCompany, currentTitle: a.candidate.currentTitle } : null,
    job: a.job ? { id: a.job.id, title: a.job.title, jobCode: a.job.jobCode, department: a.job.department?.name } : null,
    stage: a.stage,
    status: a.status,
    source: a.source,
    fitScore: a.fitScore,
    owner: a.owner ? { id: a.owner.id, name: a.owner.name } : null,
    lastActivityAt: a.updatedAt,
    createdAt: a.createdAt,
  }));

  return Response.json({ success: true, data });
}
