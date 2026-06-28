// Phase 8.10: GET /api/speech/stats — Overall speech module stats
import { getSession } from "@/server/auth/session";
import { getMediaStats } from "@/server/services/media/media-service";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "interviews"
    );

    const mediaStats = await getMediaStats(scope);

    // Count transcripts that are ready (have segments)
    const readyTranscripts = await prisma.transcript.count({
      where: {
        segmentCount: { gt: 0 },
      },
    });

    // Count analyzed transcripts (have at least one CommunicationAnalysis)
    const analyzedCount = await prisma.communicationAnalysis.groupBy({
      by: ["transcriptId"],
    }).then((groups) => groups.length);

    // Count evidence gaps: STAR analyses with completeness < 50
    const evidenceGapCount = await prisma.communicationAnalysis.count({
      where: {
        analysisType: "star",
        riskLevel: "high",
      },
    });

    // Count insufficient followup: followup_quality analyses with shallow depth
    const followupInsufficientCount = await prisma.communicationAnalysis.count({
      where: {
        analysisType: "followup_quality",
        riskLevel: "high",
      },
    });

    return Response.json({
      success: true,
      data: {
        total: mediaStats.total,
        pending: mediaStats.pending + mediaStats.notConfigured,
        ready: readyTranscripts,
        analyzed: analyzedCount,
        evidenceGap: evidenceGapCount,
        insufficientFollowup: followupInsufficientCount,
        highSpeakingLowEvidence: 0,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "获取语音统计数据失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
