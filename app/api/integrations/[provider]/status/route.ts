// Phase 8.7: GET /api/integrations/[provider]/status
import { getSession } from "@/server/auth/session";
import { getProviderStatus } from "@/server/services/data-ingestion/integration-service";

export async function GET(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { provider } = await params;
  return Response.json({ success: true, data: getProviderStatus(provider) });
}
