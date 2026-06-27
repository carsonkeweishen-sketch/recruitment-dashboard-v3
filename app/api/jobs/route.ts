import { getSession } from "@/server/auth/session";
import { listJobs } from "@/server/services/jobs/job-service";
import { requirePermission } from "@/server/permissions/check-permission";

export async function GET(request: Request) {
  const session = await getSession();
  requirePermission(session, "jobs", "view");

  const { searchParams } = new URL(request.url);

  const { jobs, riskResults } = await listJobs(session.role, session.userId, session.departmentId, {
    search: searchParams.get("search") ?? undefined,
    departmentId: searchParams.get("departmentId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    priority: searchParams.get("priority") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    ownerId: searchParams.get("ownerId") ?? undefined,
    brandLine: searchParams.get("brandLine") ?? undefined,
  });

  const data = jobs.map((j) => {
    const risk = riskResults.get(j.id);
    return {
      id: j.id,
      jobCode: j.jobCode,
      title: j.title,
      department: j.department?.name ?? "",
      departmentId: j.departmentId,
      level: j.level,
      status: j.status,
      priority: j.priority,
      owner: j.owner ? { id: j.owner.id, name: j.owner.name } : null,
      businessOwner: j.businessOwner ? { id: j.businessOwner.id, name: j.businessOwner.name } : null,
      location: j.location,
      headcount: j.headcount,
      brandLine: j.brandLine,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      updatedAt: j.updatedAt,
      totalApplications: j.applications.length,
      activeApplications: j.applications.filter((a) => a.status === "active").length,
      // Phase 8.1 Jobs v2: Risk classification + state machine
      riskLabel: risk?.riskLabel ?? "pipeline_healthy",
      riskLabelText: risk?.riskLabelText ?? "流程健康",
      riskColor: risk?.riskColor ?? "success",
      riskDescription: risk?.riskDescription ?? "",
      derivedState: risk?.derivedState ?? "sourcing",
      derivedStateLabel: risk?.derivedStateLabel ?? "渠道寻源",
      openActions: risk?.openActions ?? 0,
    };
  });

  return Response.json({ success: true, data });
}
