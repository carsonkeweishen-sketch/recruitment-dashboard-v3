// Phase 8.10: PATCH /api/transcripts/:id/review — Review transcript
import { getSession } from "@/server/auth/session";
import { reviewTranscript, getTranscriptById } from "@/server/services/media/media-service";

const VALID_REVIEW_STATUSES = ["approved", "edited", "rejected"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const reviewStatus = body.reviewStatus as string | undefined;
  if (!reviewStatus || !VALID_REVIEW_STATUSES.includes(reviewStatus)) {
    return Response.json(
      { success: false, error: `reviewStatus 必须是以下之一: ${VALID_REVIEW_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // Verify transcript exists
    const existing = await getTranscriptById(id);
    if (!existing) {
      return Response.json({ success: false, error: "未找到该转录" }, { status: 404 });
    }

    const transcript = await reviewTranscript(id, {
      reviewStatus: reviewStatus as "approved" | "edited" | "rejected",
      note: body.note as string | undefined,
    }, session.userId);

    return Response.json({ success: true, data: transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : "审核转录失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
