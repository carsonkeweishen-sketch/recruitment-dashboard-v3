import { setRoleCookie } from "@/server/auth/session";
import type { Role } from "@/server/permissions/types";

export async function POST(request: Request) {
  try {
    const { role } = await request.json();
    if (!role) {
      return Response.json({ error: "role is required" }, { status: 400 });
    }
    await setRoleCookie(role as Role);
    return Response.json({ success: true, role });
  } catch {
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}
