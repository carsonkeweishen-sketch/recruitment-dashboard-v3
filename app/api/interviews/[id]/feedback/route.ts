// Phase 6: POST /api/interviews/:id/feedback — Submit interview feedback
import { getSession } from "@/server/auth/session";
import { submitInterviewFeedback } from "@/server/services/interview/interview-feedback-service";
import { InterviewFeedbackError } from "@/server/services/interview/interview-feedback-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Validate body structure
  if (!body.scores || typeof body.scores !== "object") {
    return Response.json(
      { success: false, error: "scores is required and must be an object" },
      { status: 400 }
    );
  }

  if (!body.overallRecommendation || typeof body.overallRecommendation !== "string") {
    return Response.json(
      { success: false, error: "overallRecommendation is required" },
      { status: 400 }
    );
  }

  if (!body.evidenceText || typeof body.evidenceText !== "string") {
    return Response.json(
      { success: false, error: "evidenceText is required" },
      { status: 400 }
    );
  }

  try {
    const result = await submitInterviewFeedback(
      session.role,
      session.userId,
      session.departmentId,
      {
        interviewId: id,
        scores: body.scores as Record<string, number>,
        overallRecommendation: body.overallRecommendation as string,
        evidenceText: body.evidenceText as string,
        riskNotes: body.riskNotes as string | undefined,
        suggestedFollowUpQuestions: body.suggestedFollowUpQuestions as string[] | undefined,
      }
    );

    return Response.json(
      {
        success: true,
        data: {
          feedback: result.feedback,
          quality: result.quality,
          riskSignals: result.riskSignals,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof InterviewFeedbackError) {
      return Response.json(
        { success: false, error: e.message },
        { status: e.statusCode }
      );
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
