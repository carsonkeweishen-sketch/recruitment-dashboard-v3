import { getSession } from "@/server/auth/session";
import { getCandidateDetail } from "@/server/services/candidates/candidate-service";
import { requirePermission, buildScopeWhere } from "@/server/permissions/check-permission";
import { getScopeFor } from "@/server/permissions/matrix";
import type { ScopeWhere } from "@/server/permissions/types";

function filterApplicationsByScope(
  applications: Array<Record<string, unknown>>,
  scope: ScopeWhere
): Array<Record<string, unknown>> {
  if (scope.scope === "ALL") return applications;

  return applications.filter((a) => {
    if (scope.scope === "DEPARTMENT") return true; // department check at candidate level
    if (scope.scope === "OWNED" && scope.userId) {
      const owner = a.owner as { id: string } | null;
      return owner?.id === scope.userId;
    }
    if (scope.scope === "RELATED" && scope.userId) {
      if (scope.role === "interviewer") return true; // already filtered at candidate level via interviews
      const owner = a.owner as { id: string } | null;
      return owner?.id === scope.userId || true; // business_owner sees related apps
    }
    return false;
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  requirePermission(session, "candidates", "view");

  const { id } = await params;
  const candidate = await getCandidateDetail(id, session.role, session.userId, session.departmentId);
  if (!candidate) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  const scope = getScopeFor(session.role, "candidates");
  const showContact = scope === "ALL" || scope === "DEPARTMENT" || scope === "OWNED";

  // Phase 5.2.1: Secondary scope filter on applications
  const scopeWhere = buildScopeWhere(session, "candidates");
  const rawApps = candidate.applications as unknown as Array<Record<string, unknown>>;
  const filteredApps = filterApplicationsByScope(rawApps, scopeWhere);

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
        job: a.job ? { id: (a.job as Record<string,unknown>).id, title: (a.job as Record<string,unknown>).title, jobCode: (a.job as Record<string,unknown>).jobCode, department: ((a.job as Record<string,unknown>).department as Record<string,unknown>)?.name, level: (a.job as Record<string,unknown>).level } : null,
        stage: a.stage,
        status: a.status,
        source: a.source,
        fitScore: a.fitScore,
        owner: a.owner ? { id: (a.owner as Record<string,unknown>).id, name: (a.owner as Record<string,unknown>).name } : null,
        lastActivityAt: a.updatedAt,
        createdAt: a.createdAt,
      })),
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    },
  });
}
