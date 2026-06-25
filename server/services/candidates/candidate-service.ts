import type { Role } from "@/server/permissions/types";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { getCandidates, getCandidateById, getCandidateByIdWithScope } from "@/server/repositories/candidate-repository";
import type { CandidateListParams } from "@/server/repositories/candidate-repository";

export async function listCandidates(
  role: Role, userId: string | undefined, departmentId: string | undefined,
  filters: Omit<CandidateListParams, "scope">
) {
  const scope = buildScopeWhere({ role, userId, departmentId }, "candidates");
  return getCandidates({ scope, ...filters });
}

export async function getCandidateDetail(id: string, role?: Role, userId?: string, departmentId?: string) {
  const scope = role ? buildScopeWhere({ role, userId, departmentId }, "candidates") : undefined;
  const candidate = scope
    ? await getCandidateByIdWithScope(id, scope)
    : await getCandidateById(id);
  if (!candidate) return null;
  return {
    ...candidate,
    applicationCount: candidate.applications.length,
    activeApplicationCount: candidate.applications.filter((a) => a.status === "active").length,
  };
}
