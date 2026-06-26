import { getSession } from "@/server/auth/session";
import { getCandidateDetail } from "@/server/services/candidates/candidate-service";
import { requirePermission } from "@/server/permissions/check-permission";
import { getScopeFor } from "@/server/permissions/matrix";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  requirePermission(session, "candidates", "view");

  const { id } = await params;
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateDetail(id, session.role, session.userId, session.departmentId);
  if (!candidate) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  const scope = getScopeFor(session.role, "candidates");
  const showContact = scope === "ALL" || scope === "DEPARTMENT" || scope === "OWNED";

  // Applications are already scope-filtered at repository level via include.where
  const filteredApps = candidate.applications;

  return Response.json({
    success: true,
    data: {
      id: candidate.id,
      name: candidate.name,
      source: candidate.source,
      currentCompany: candidate.currentCompany,
      currentTitle: candidate.currentTitle,
      tags: candidate.tags,
      resumeSummary: candidate.resumeSummary,
      email: showContact ? candidate.email : null,
      phone: showContact ? candidate.phone : null,
      applicationCount: filteredApps.length,
      activeApplicationCount: filteredApps.filter((a) => a.status === "active").length,
      applications: filteredApps.map((a) => ({
        id: a.id,
        job: a.job ? { id: a.job.id, title: a.job.title, jobCode: a.job.jobCode, department: a.job.department?.name, level: a.job.level } : null,
        stage: a.stage,
        status: a.status,
        source: a.source,
        fitScore: a.fitScore,
        owner: a.owner ? { id: a.owner.id, name: a.owner.name } : null,
        lastActivityAt: a.updatedAt,
        createdAt: a.createdAt,
      })),
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    },
  });
}
