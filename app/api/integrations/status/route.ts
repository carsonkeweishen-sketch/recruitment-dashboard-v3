// Phase 8.7: GET /api/integrations/status
import { getSession } from "@/server/auth/session";
import { getIntegrationsStatus } from "@/server/services/data-ingestion/integration-service";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return Response.json({ success: true, data: getIntegrationsStatus() });
}
