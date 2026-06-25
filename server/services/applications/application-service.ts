import type { Role } from "@/server/permissions/types";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getApplications, getApplicationById } from "@/server/repositories/application-repository";
import type { ApplicationListParams } from "@/server/repositories/application-repository";

export async function listApplications(
  role: Role, userId: string | undefined, departmentId: string | undefined,
  filters: Omit<ApplicationListParams, "scope">
) {
  const scope = buildScopeWhere({ role, userId, departmentId }, "applications");
  return getApplications({ scope, ...filters });
}

export async function getApplicationDetail(id: string) {
  return getApplicationById(id);
}
