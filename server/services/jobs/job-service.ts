// Phase 3.1: Job Service — business logic layer

import type { Role } from "@/server/permissions/types";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getJobs as fetchJobs, getJobById as fetchJob, getJobByIdWithScope } from "@/server/repositories/job-repository";
import type { JobListParams } from "@/server/repositories/job-repository";

export async function listJobs(
  role: Role,
  userId: string | undefined,
  departmentId: string | undefined,
  filters: Omit<JobListParams, "role" | "scope">
) {
  const scope = buildScopeWhere({ role, userId, departmentId }, "jobs");
  return fetchJobs({ role, scope, ...filters });
}

export async function getJobDetail(id: string, role?: Role, userId?: string, departmentId?: string) {
  // Phase 5.2: Object-level scope check
  const scope = role ? buildScopeWhere({ role, userId, departmentId }, "jobs") : undefined;
  const job = scope
    ? await getJobByIdWithScope(id, scope)
    : await fetchJob(id);

  if (!job) return null;

  const stages = job.applications.reduce(
    (acc, app) => {
      const key = app.stage;
      if (!acc[key]) acc[key] = 0;
      acc[key]++;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    ...job,
    totalApplications: job.applications.length,
    activeApplications: job.applications.filter((a) => a.status === "active").length,
    applicationsByStage: stages,
    applications: undefined, // don't leak full list in API
  };
}
