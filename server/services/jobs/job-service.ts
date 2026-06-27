// Phase 8.1 Jobs v2: Job Service with risk classification + state machine
// All judgment logic from Rule Engine, no hardcoded states.

import type { Role } from "@/server/permissions/types";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getJobs as fetchJobs, getJobByIdWithScope } from "@/server/repositories/job-repository";
import type { JobListParams } from "@/server/repositories/job-repository";
import { classifyJobRisk, type JobRiskResult } from "@/server/services/jobs/job-risk-classifier";

export async function listJobs(
  role: Role,
  userId: string | undefined,
  departmentId: string | undefined,
  filters: Omit<JobListParams, "role" | "scope">
) {
  const scope = buildScopeWhere({ role, userId, departmentId }, "jobs");
  const jobs = await fetchJobs({ role, scope, ...filters });

  // Classify each job's risk label
  const riskResults = new Map<string, JobRiskResult>();
  for (const job of jobs) {
    const result = await classifyJobRisk(job.id, job.applications, job.status);
    riskResults.set(job.id, result);
  }

  return { jobs, riskResults };
}

export async function getJobDetail(id: string, role: Role, userId: string, departmentId?: string) {
  const scope = buildScopeWhere({ role, userId, departmentId }, "jobs");
  const job = await getJobByIdWithScope(id, scope);

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

  const riskResult = await classifyJobRisk(job.id, job.applications, job.status);

  return {
    ...job,
    totalApplications: job.applications.length,
    activeApplications: job.applications.filter((a) => a.status === "active").length,
    applicationsByStage: stages,
    applications: undefined,
    riskLabel: riskResult.riskLabel,
    riskLabelText: riskResult.riskLabelText,
    riskColor: riskResult.riskColor,
    riskDescription: riskResult.riskDescription,
    derivedState: riskResult.derivedState,
    derivedStateLabel: riskResult.derivedStateLabel,
    openActions: riskResult.openActions,
  };
}
