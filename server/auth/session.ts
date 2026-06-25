// Phase 1: 开发态会话管理（cookie-based）

import { cookies } from "next/headers";
import type { Role, PermissionContext } from "@/server/permissions/types";

const SESSION_COOKIE = "rd_dev_role";
const USER_ID_COOKIE = "rd_dev_user_id";
const DEPT_ID_COOKIE = "rd_dev_dept_id";

const DEFAULT_CONTEXT: PermissionContext = {
  role: "admin",
  userId: "dev-user-admin",
  departmentId: "dept-all",
};

export async function getSession(): Promise<PermissionContext> {
  const store = await cookies();
  const role = (store.get(SESSION_COOKIE)?.value as Role) || DEFAULT_CONTEXT.role;
  return {
    role,
    userId: store.get(USER_ID_COOKIE)?.value || DEFAULT_CONTEXT.userId,
    departmentId: store.get(DEPT_ID_COOKIE)?.value || DEFAULT_CONTEXT.departmentId,
  };
}

export async function setRoleCookie(role: Role): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export { DEFAULT_CONTEXT };
