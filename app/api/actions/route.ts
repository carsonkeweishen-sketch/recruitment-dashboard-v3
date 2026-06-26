// Phase 7: GET/POST /api/actions — List + Create actions
import { getSession } from "@/server/auth/session";
import { listActionList, createActionItem, ActionError } from "@/server/services/action/action-service";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const filters: Record<string, string> = {};
    url.searchParams.forEach((v, k) => { if (v) filters[k] = v; });

    const { actions, metrics } = await listActionList(
      session.role, session.userId, session.departmentId, filters
    );
    return Response.json({ success: true, actions, metrics });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const action = await createActionItem(session.role, session.userId, session.departmentId, {
      title: (body.title as string) || "",
      description: body.description as string | undefined,
      category: (body.category as string) || "manual",
      priority: (body.priority as string) || "medium",
      ownerId: body.ownerId as string | undefined,
      jobId: body.jobId as string | undefined,
      candidateId: body.candidateId as string | undefined,
      applicationId: body.applicationId as string | undefined,
      interviewId: body.interviewId as string | undefined,
      feedbackId: body.feedbackId as string | undefined,
      sourceType: (body.sourceType as string) || "manual",
      sourceRefId: body.sourceRefId as string | undefined,
      sourceSummary: body.sourceSummary as string | undefined,
      dueAt: body.dueAt ? new Date(body.dueAt as string) : undefined,
    });
    return Response.json({ success: true, data: action }, { status: 201 });
  } catch (e) {
    if (e instanceof ActionError) {
      return Response.json({ success: false, error: e.message }, { status: e.statusCode });
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
