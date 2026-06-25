import { getSession } from "@/server/auth/session";
import { listCandidates } from "@/server/services/candidates/candidate-service";
import { requirePermission } from "@/server/permissions/check-permission";

export async function GET(request: Request) {
  const session = await getSession();
  requirePermission(session, "candidates", "view");

  const { searchParams } = new URL(request.url);
  const candidates = await listCandidates(session.role, session.userId, session.departmentId, {
    search: searchParams.get("search") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    currentCompany: searchParams.get("currentCompany") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    stage: searchParams.get("stage") ?? undefined,
    jobId: searchParams.get("jobId") ?? undefined,
  });

  const data = candidates.map((c) => {
    const apps = c.applications;
    const latestApp = apps[0];
    return {
      id: c.id,
      name: c.name,
      source: c.source,
      currentCompany: c.currentCompany,
      currentTitle: c.currentTitle,
      tags: c.tags,
      resumeSummary: c.resumeSummary,
      applicationCount: apps.length,
      activeApplicationCount: apps.filter((a) => a.status === "active").length,
      latestApplicationStage: latestApp?.stage ?? null,
      latestJobTitle: latestApp?.job?.title ?? null,
      latestActivityAt: latestApp?.updatedAt ?? c.updatedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  });

  return Response.json({ success: true, data });
}
