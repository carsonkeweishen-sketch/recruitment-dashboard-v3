// Phase 1: 权限门控组件

import type { Role, Resource, Action } from "@/server/permissions/types";
import { hasPermission } from "@/server/permissions/matrix";
import { PermissionDenied } from "@/components/ui/PermissionDenied";

interface PermissionGateProps {
  role: Role;
  resource: Resource;
  action?: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  role,
  resource,
  action = "view",
  children,
  fallback,
}: PermissionGateProps) {
  if (hasPermission(role, resource, action)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <PermissionDenied message={`需要 ${resource} 权限`} />;
}
