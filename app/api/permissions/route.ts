import { getSession } from "@/server/auth/session";
import type { Role, Resource } from "@/server/permissions/types";
import { RESOURCE_LABELS } from "@/server/permissions/types";
import { getScopeFor } from "@/server/permissions/matrix";
import { getAllowedActions } from "@/server/permissions/check-permission";

export async function GET() {
  const session = await getSession();
  const role: Role = session.role;

  const resources: Resource[] = [
    "dashboard", "workbench", "jobs", "candidates", "applications",
    "interviews", "actions", "imports", "offerRisks", "reports",
    "aiAssistant", "interviewerEnablement", "settings",
  ];

  const matrix = resources.map((resource) => ({
    resource,
    label: RESOURCE_LABELS[resource],
    scope: getScopeFor(role, resource),
    allowedActions: getAllowedActions(role, resource),
  }));

  return Response.json({
    success: true,
    data: {
      role,
      permissions: matrix,
    },
  });
}
