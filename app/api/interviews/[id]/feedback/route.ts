// Phase 6: Submit Interview Feedback API
import { getSession } from "@/server/auth/session";
import { submitInterviewFeedback } from "@/server/services/interview/interview-service";
import { logInterviewFeedbackSubmitted } from "@/server/services/interview/activity-log-helper";
import { calculateFeedbackQuality } from "@/server/services/interview/interview-quality-service";
import { getInterviewById } from "@/server/repositories/interview/interview-repository";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id: interviewId } = await params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }

  const { scores, overallRecommendation, evidenceText, riskNotes, strengths, suggestedFollowUpQuestions } = body;

  if (!scores || typeof scores !== "object") {
    return Response.json({ success: false, error: "scores (6-dimension rating) is required" }, { status: 400 });
  }
  if (!overallRecommendation) {
    return Response.json({ success: false, error: "overallRecommendation is required" }, { status: 400 });
  }

  const validRecs = ["STRONG_HIRE", "HIRE", "HOLD", "NO_HIRE", "STRONG_NO_HIRE"];
  if (!validRecs.includes(overallRecommendation as string)) {
    return Response.json({ success: false, error: `overallRecommendation must be one of: ${validRecs.join(", ")}` }, { status: 400 });
  }

  try {
    const feedback = await submitInterviewFeedback(session.role, session.userId, session.departmentId, interviewId, {
      scores: scores as Record<string, number>,
      overallRecommendation: overallRecommendation as string,
      evidenceText: evidenceText as string | undefined,
      riskNotes: riskNotes as string | undefined,
      strengths: strengths as string | undefined,
      suggestedFollowUpQuestions: suggestedFollowUpQuestions as string[] | undefined,
    });

    // Calculate quality score for ActivityLog
    const interview = await getInterviewById(interviewId);
    let qualityScore: number | undefined;
    if (interview) {
      qualityScore = calculateFeedbackQuality(feedback, interview).feedbackQualityScore;
    }

    // Write ActivityLog
    const app = interview?.application;
    await logInterviewFeedbackSubmitted({
      actorId: session.userId,
      interviewId,
      feedbackId: feedback.id,
      applicationId: app?.id || "",
      candidateId: app?.candidateId || "",
      jobId: app?.jobId || "",
      overallRecommendation: overallRecommendation as string,
      feedbackQualityScore: qualityScore,
    });

    return Response.json({ success: true, data: { feedback, feedbackQualityScore: qualityScore } }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    const status = msg.includes("Permission denied") ? 403 : msg.includes("not found") ? 404 : 500;
    return Response.json({ success: false, error: msg }, { status });
  }
}
