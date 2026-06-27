// Phase 8.6: GET /api/ai/provider/status
import { getProviderStatus } from "@/server/services/ai/ai-provider-service";
import { getSession } from "@/server/auth/session";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return Response.json({ success: true, data: getProviderStatus() });
}
