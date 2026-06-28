// Phase 8.10: GET /api/transcripts/:id — Transcript detail with segments
import { getSession } from "@/server/auth/session";
import { getTranscriptById } from "@/server/services/media/media-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const transcript = await getTranscriptById(id);

    if (!transcript) {
      return Response.json({ success: false, error: "未找到该转录" }, { status: 404 });
    }

    return Response.json({ success: true, data: transcript });
  } catch {
    return Response.json({ success: false, error: "加载转录失败" }, { status: 500 });
  }
}
