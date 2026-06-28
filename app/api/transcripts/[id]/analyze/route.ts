// Phase 8.10: POST /api/transcripts/:id/analyze — Run transcript analysis
import { getSession } from "@/server/auth/session";
import { analyzeTranscript, getTranscriptById } from "@/server/services/media/media-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Verify transcript exists and has segments
    const existing = await getTranscriptById(id);
    if (!existing) {
      return Response.json({ success: false, error: "未找到该转录" }, { status: 404 });
    }

    if (!existing.segments || existing.segments.length === 0) {
      return Response.json(
        { success: false, error: "无转写段落，无法分析" },
        { status: 400 }
      );
    }

    const result = await analyzeTranscript(id, session.userId);
    return Response.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "分析转录失败";
    const status = message === "无转写段落，无法分析" ? 400 : 500;
    return Response.json({ success: false, error: message }, { status });
  }
}
