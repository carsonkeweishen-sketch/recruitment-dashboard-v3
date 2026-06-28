// Phase 8.10: Speech Metrics Service — Compute speech interaction metrics from transcript segments
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const PAUSE_THRESHOLD = 2000; // ms — gaps longer than this count as "long pauses"

// Closed-question prefixes: 是否/有没有/是不是/对吗/是吧/对吧/可不可以/能不能
const CLOSED_QUESTION_PATTERN = /^(是否|有没有|是不是|对吗|是吧|对吧|可不可以|能不能|有无|可否)/;

export interface SpeechMetrics {
  candidateSpeakingRatio: number;    // 0-100
  interviewerSpeakingRatio: number;  // 0-100
  avgAnswerDurationMs: number;
  longPauseCount: number;           // gaps > 2000ms
  followupCount: number;            // interviewer question segments
  closedQuestionRatio: number;      // 0-100
  totalSpeakingMs: number;
  candidateSegments: number;
  interviewerSegments: number;
}

function classifySpeakerRole(label: string | null): "candidate" | "interviewer" | "unknown" {
  if (!label) return "unknown";
  const lower = label.toLowerCase();
  if (lower.includes("候选") || lower.includes("candidate")) return "candidate";
  if (lower.includes("面试") || lower.includes("interviewer") || lower.includes("面试官")) return "interviewer";
  return "unknown";
}

function isClosedQuestion(text: string): boolean {
  return CLOSED_QUESTION_PATTERN.test(text.trim());
}

export async function computeSpeechMetrics(transcriptId: string): Promise<SpeechMetrics> {
  // 1. Fetch all segments for this transcript
  const segments = await prisma.transcriptSegment.findMany({
    where: { transcriptId },
    orderBy: { segmentIndex: "asc" },
  });

  // 2. Classify by speakerRole
  let candidateMs = 0;
  let interviewerMs = 0;
  let candidateSegments = 0;
  let interviewerSegments = 0;
  let followupCount = 0;
  let closedQuestionCount = 0;
  let interviewerQuestionCount = 0;
  let longPauseCount = 0;
  let totalMs = 0;
  let lastEndMs: number | null = null;

  for (const seg of segments) {
    const role = classifySpeakerRole(seg.speakerLabel);
    const duration = (seg.endMs ?? 0) - (seg.startMs ?? 0);

    if (role === "candidate") {
      candidateMs += duration;
      candidateSegments++;
    } else if (role === "interviewer") {
      interviewerMs += duration;
      interviewerSegments++;

      // Followup: an interviewer segment after the first interviewer segment is a followup question
      if (interviewerSegments > 1) {
        followupCount++;
      }

      // Check for closed questions
      const text = seg.text.trim();
      if (text.endsWith("？") || text.endsWith("?")) {
        interviewerQuestionCount++;
        if (isClosedQuestion(text)) {
          closedQuestionCount++;
        }
      }
    }

    // Long pause detection: gap between this segment's start and the previous segment's end
    if (lastEndMs !== null && seg.startMs !== null && seg.startMs - lastEndMs > PAUSE_THRESHOLD) {
      longPauseCount++;
    }

    if (seg.endMs !== null) {
      totalMs = Math.max(totalMs, seg.endMs);
      lastEndMs = seg.endMs;
    }
  }

  // 3. Calculate metrics
  const totalSpeakingMs = candidateMs + interviewerMs;
  const candidateSpeakingRatio = totalSpeakingMs > 0
    ? Math.round((candidateMs / totalSpeakingMs) * 100 * 100) / 100
    : 0;
  const interviewerSpeakingRatio = totalSpeakingMs > 0
    ? Math.round((interviewerMs / totalSpeakingMs) * 100 * 100) / 100
    : 0;
  const avgAnswerDurationMs = candidateSegments > 0
    ? Math.round(candidateMs / candidateSegments)
    : 0;
  const closedQuestionRatio = interviewerQuestionCount > 0
    ? Math.round((closedQuestionCount / interviewerQuestionCount) * 100 * 100) / 100
    : 0;

  const metrics: SpeechMetrics = {
    candidateSpeakingRatio,
    interviewerSpeakingRatio,
    avgAnswerDurationMs,
    longPauseCount,
    followupCount,
    closedQuestionRatio,
    totalSpeakingMs,
    candidateSegments,
    interviewerSegments,
  };

  // 4. Save metrics to SpeechMetric table (key-value per metric)
  const metricEntries = [
    { metricKey: "candidateSpeakingRatio", metricValue: candidateSpeakingRatio, speakerRole: "candidate" },
    { metricKey: "interviewerSpeakingRatio", metricValue: interviewerSpeakingRatio, speakerRole: "interviewer" },
    { metricKey: "avgAnswerDurationMs", metricValue: avgAnswerDurationMs, speakerRole: "candidate" },
    { metricKey: "longPauseCount", metricValue: longPauseCount },
    { metricKey: "followupCount", metricValue: followupCount, speakerRole: "interviewer" },
    { metricKey: "closedQuestionRatio", metricValue: closedQuestionRatio, speakerRole: "interviewer" },
    { metricKey: "totalSpeakingMs", metricValue: totalSpeakingMs },
    { metricKey: "candidateSegments", metricValue: candidateSegments, speakerRole: "candidate" },
    { metricKey: "interviewerSegments", metricValue: interviewerSegments, speakerRole: "interviewer" },
  ];

  // Delete old metrics and insert new ones (upsert pattern)
  await prisma.speechMetric.deleteMany({ where: { transcriptId } });

  await prisma.speechMetric.createMany({
    data: metricEntries.map((m) => ({
      transcriptId,
      metricKey: m.metricKey,
      metricValue: m.metricValue,
      speakerRole: m.speakerRole ?? null,
    })),
  });

  return metrics;
}

export async function getSpeechMetrics(transcriptId: string): Promise<SpeechMetrics> {
  // Try fetching from SpeechMetric table first
  const existingMetrics = await prisma.speechMetric.findMany({
    where: { transcriptId },
  });

  if (existingMetrics.length > 0) {
    // Reconstruct from key-value rows
    const map = new Map<string, number>();
    for (const m of existingMetrics) {
      map.set(m.metricKey, m.metricValue);
    }

    return {
      candidateSpeakingRatio: map.get("candidateSpeakingRatio") ?? 0,
      interviewerSpeakingRatio: map.get("interviewerSpeakingRatio") ?? 0,
      avgAnswerDurationMs: map.get("avgAnswerDurationMs") ?? 0,
      longPauseCount: map.get("longPauseCount") ?? 0,
      followupCount: map.get("followupCount") ?? 0,
      closedQuestionRatio: map.get("closedQuestionRatio") ?? 0,
      totalSpeakingMs: map.get("totalSpeakingMs") ?? 0,
      candidateSegments: map.get("candidateSegments") ?? 0,
      interviewerSegments: map.get("interviewerSegments") ?? 0,
    };
  }

  // Compute if not exists
  return computeSpeechMetrics(transcriptId);
}
