// Phase 5: Business Feedback Detail API
import { getSession } from "@/server/auth/session";
import { getFeedback } from "@/server/services/business-feedback/business-feedback-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const _session = await getSession();
  const { id } = await params;
  const feedback = await getFeedback(id);
  if (!feedback) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  return Response.json({ success: true, data: feedback });
}
