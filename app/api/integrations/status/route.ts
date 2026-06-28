// Phase 8.9: GET /api/integrations/status
import { getSession } from "@/server/auth/session";
import { getIntegrationsStatus } from "@/server/services/data-ingestion/integration-service";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const result = await getIntegrationsStatus();

    // Scoped for non-admin: interviewers see only provider-level status without secrets
    if (session.role === "interviewer") {
      return Response.json({
        success: true,
        safe: true,
        data: {
          ...result,
          providers: result.providers.map((p) => ({ ...p, configured: undefined })),
        },
      });
    }

    return Response.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "加载集成状态失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
