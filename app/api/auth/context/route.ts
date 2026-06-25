import { getSession } from "@/server/auth/session";

export async function GET() {
  const session = await getSession();
  return Response.json({ success: true, data: session });
}
