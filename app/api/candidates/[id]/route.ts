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
  const candidate = await getCandidateDetail(id);
  if (!candidate) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  const scope = getScopeFor(session.role, "candidates");
  const showContact = scope === "ALL" || scope === "DEPARTMENT" || scope === "OWNED";

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
      applicationCount: candidate.applicationCount,
      activeApplicationCount: candidate.activeApplicationCount,
      applications: candidate.applications.map((a) => ({
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
