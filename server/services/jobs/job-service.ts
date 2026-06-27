// Phase 8.1 Jobs v3: Event-Driven State Machine System
// All state changes driven by Events, validated by State Transition Validator.

import type { Role } from "@/server/permissions/types";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getJobs as fetchJobs, getJobByIdWithScope } from "@/server/repositories/job-repository";
import type { JobListParams } from "@/server/repositories/job-repository";
import { buildJobStateSnapshot } from "@/server/services/jobs/job-state-transition-validator";
import type { JobStateSnapshot } from "@/server/models/job-state-machine";

export async function listJobs(
  role: Role,
  userId: string | undefined,
  departmentId: string | undefined,
  filters: Omit<JobListParams, "role" | "scope">
) {
  const scope = buildScopeWhere({ role, userId, departmentId }, "jobs");
  const jobs = await fetchJobs({ role, scope, ...filters });

  // Build state snapshots via Event-Driven State Machine
  const snapshots = new Map<string, JobStateSnapshot>();
  for (const job of jobs) {
    const snapshot = await buildJobStateSnapshot(
      job.id,
      job.status,
      job.headcount,
      job.applications
    );
    snapshots.set(job.id, snapshot);
  }

  return { jobs, snapshots };
}

export async function getJobDetail(id: string, role: Role, userId: string, departmentId?: string) {
  const scope = buildScopeWhere({ role, userId, departmentId }, "jobs");
  const job = await getJobByIdWithScope(id, scope);
  if (!job) return null;

  const snapshot = await buildJobStateSnapshot(
    job.id,
    job.status,
    job.headcount,
    job.applications
  );

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
    applications: undefined,
    // State Machine fields
    currentState: snapshot.currentState,
    currentStateLabel: snapshot.currentStateLabel,
    riskType: snapshot.riskType,
    riskLabel: snapshot.riskLabel,
    riskColor: snapshot.riskColor,
    riskExplanation: snapshot.riskExplanation,
    ruleId: snapshot.ruleId,
    eventSummary: snapshot.eventSummary,
    openActions: snapshot.openActions,
    isBottleneck: snapshot.isBottleneck,
    bottleneckReason: snapshot.bottleneckReason,
  };
}
