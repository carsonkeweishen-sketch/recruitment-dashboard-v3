// Phase 8.11: Transcript Context Source — 统一 8.10 Speech AI 建议到全局 Copilot
// 拉取 TranscriptSegment(isAiUsable=true) + CommunicationAnalysis + CommunicationEvidence
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ContextSourceResult } from "../copilot-context-builder-v2";
import type { ScopeWhere } from "@/server/permissions/types";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) { const pool = new Pool({ connectionString: process.env.DATABASE_URL }); _prisma = new PrismaClient({ adapter: new PrismaPg(pool) }); }
  return _prisma;
}

export async function fetch(_objectType: string, objectId: string, _scope: ScopeWhere, _question?: string, extraRefIds?: string[]): Promise<ContextSourceResult[]> {
  const sources: ContextSourceResult[] = [];
  const p = getPrisma();

  let transcriptId: string | null = null;

  if (extraRefIds && extraRefIds.length > 0) {
    transcriptId = extraRefIds.find((id) => id.startsWith("cmq")) || null;
  }
  if (objectId && objectId !== "all" && objectId !== "transcript_list" && objectId.startsWith("cmq")) {
    transcriptId = objectId;
  }

  // If objectId is an interview ID, find associated transcript via media asset
  if (!transcriptId && objectId && objectId !== "all" && objectId !== "transcript_list") {
    const mediaAssets = await p.mediaAsset.findMany({
      where: { objectType: "interview", objectId },
      select: { id: true },
    });
    if (mediaAssets.length > 0) {
      const transcript = await p.transcript.findFirst({
        where: { mediaAssetId: { in: mediaAssets.map((m) => m.id) } },
        select: { id: true },
      });
      transcriptId = transcript?.id || null;
    }
  }

  // List mode
  if (!transcriptId) {
    const transcripts = await p.transcript.findMany({
      where: { segmentCount: { gt: 0 } },
      select: { id: true, segmentCount: true, reviewStatus: true, mediaAsset: { select: { fileName: true } } },
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    if (transcripts.length > 0) {
      sources.push({
        refType: "transcript", refId: "transcript_list", objectType: "transcript", objectId: "all",
        sourceLabel: "可用转写记录",
        excerpt: JSON.stringify(transcripts.map((t) => ({ id: t.id, segments: t.segmentCount, file: t.mediaAsset?.fileName, status: t.reviewStatus }))),
        redactionStatus: "not_required", hasEvidence: true, isRequired: false,
      });
    }
    return sources;
  }

  // Single transcript — get segments
  const segments = await p.transcriptSegment.findMany({
    where: { transcriptId, isAiUsable: true },
    select: { id: true, speakerLabel: true, startMs: true, endMs: true, text: true, evidenceLevel: true },
    orderBy: { segmentIndex: "asc" },
    take: 20,
  });

  if (segments.length > 0) {
    const segmentExcerpt = segments
      .map((s) => `[${fmtTime(s.startMs)}-${fmtTime(s.endMs)}] ${s.speakerLabel || "未知"}: ${s.text?.substring(0, 200)}`)
      .join("\n");
    sources.push({
      refType: "transcript_segment", refId: transcriptId, objectType: "transcript", objectId: transcriptId,
      sourceLabel: `转写段落 · ${segments.length} 段`,
      excerpt: segmentExcerpt,
      redactionStatus: "applied", hasEvidence: true, isRequired: false,
    });
  }

  // Communication analyses (STAR, evidence density, followup quality, vagueness)
  const analyses = await p.communicationAnalysis.findMany({
    where: { transcriptId },
    select: {
      id: true, analysisType: true, title: true, summary: true, riskLevel: true, generatedBy: true,
      evidences: { select: { id: true, transcriptSegmentId: true, quote: true, speakerRole: true, reason: true } },
    },
  });

  for (const analysis of analyses) {
    sources.push({
      refType: "communication_analysis",
      refId: analysis.id,
      objectType: "transcript",
      objectId: transcriptId,
      sourceLabel: `${analysis.title}（${analysis.generatedBy === "system_rule" ? "系统规则" : "AI"}）`,
      excerpt: JSON.stringify({
        type: analysis.analysisType,
        summary: analysis.summary,
        riskLevel: analysis.riskLevel,
        evidenceCount: analysis.evidences.length,
        evidenceQuotes: analysis.evidences.slice(0, 3).map((e) => ({ quote: e.quote?.substring(0, 150), speaker: e.speakerRole, reason: e.reason })),
      }),
      redactionStatus: "applied",
      hasEvidence: true,
      isRequired: false,
    });

    // Individual evidence segments as separate citations
    for (const ev of analysis.evidences) {
      if (ev.transcriptSegmentId) {
        sources.push({
          refType: "transcript_segment",
          refId: ev.transcriptSegmentId,
          objectType: "transcript",
          objectId: transcriptId,
          sourceLabel: `证据引用 · ${analysis.analysisType}`,
          excerpt: ev.quote?.substring(0, 300) || "",
          redactionStatus: "applied",
          hasEvidence: true,
          isRequired: false,
        });
      }
    }
  }

  return sources;
}

function fmtTime(ms: number | null): string {
  if (ms === null || ms === undefined) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
