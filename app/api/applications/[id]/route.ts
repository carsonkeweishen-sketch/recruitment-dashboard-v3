import { getSession } from "@/server/auth/session";
import { getApplicationDetail } from "@/server/services/applications/application-service";
import { requirePermission } from "@/server/permissions/check-permission";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  requirePermission(session, "applications", "view");

  const { id } = await params;
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const app = await getApplicationDetail(id, session.role, session.userId, session.departmentId);
  if (!app) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  return Response.json({
    success: true,
    data: {
      id: app.id,
      candidate: app.candidate ? { id: app.candidate.id, name: app.candidate.name, currentCompany: app.candidate.currentCompany, currentTitle: app.candidate.currentTitle, source: app.candidate.source, tags: app.candidate.tags } : null,
      job: app.job ? { id: app.job.id, title: app.job.title, jobCode: app.job.jobCode, department: app.job.department?.name, level: app.job.level } : null,
      stage: app.stage,
      status: app.status,
      source: app.source,
      fitScore: app.fitScore,
      owner: app.owner ? { id: app.owner.id, name: app.owner.name } : null,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    },
  });
}
