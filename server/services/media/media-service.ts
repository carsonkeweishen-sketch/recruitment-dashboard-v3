// Phase 8.10: Media Service — Audio/Video/Transcription Foundation
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { ScopeWhere } from "@/server/permissions/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// ============================================================
// Types
// ============================================================

export interface MediaAssetFilters {
  objectType?: string;
  objectId?: string;
  mediaType?: string;
  transcriptionStatus?: string;
  limit?: number;
  offset?: number;
}

export interface UploadMediaData {
  objectType: string;
  objectId: string;
  mediaType: string;
  fileName: string;
  mimeType?: string;
  fileSize?: number;
  durationMs?: number;
  storageKey?: string;
  uploadedById?: string;
}

export interface ManualTranscriptData {
  text?: string;
  segments: Array<{
    speakerLabel: string | null;
    startMs: number | null;
    endMs: number | null;
    text: string;
  }>;
}

export interface ReviewTranscriptData {
  reviewStatus: "approved" | "edited" | "rejected";
  note?: string;
}

/**
 * Resolve scoped media IDs by fetching the intersection of scope-filtered
 * objectIds and the media table. Returns a Prisma where clause.
 */
async function resolveScopedMediaWhere(scope: ScopeWhere): Promise<Record<string, unknown>> {
  if (scope.scope === "ALL") return {};
  if (scope.scope === "DENY") return { id: "__DENY__" };

  const allowedObjectIds: string[] = [];

  if (scope.scope === "DEPARTMENT" && scope.departmentId) {
    // Jobs in department
    const deptJobs = await prisma.job.findMany({
      where: { departmentId: scope.departmentId },
      select: { id: true },
    });
    allowedObjectIds.push(...deptJobs.map((j) => j.id));
  }

  if (scope.scope === "OWNED" && scope.userId) {
    // Own interviews
    const ownInterviews = await prisma.interview.findMany({
      where: { interviewerId: scope.userId },
      select: { id: true },
    });
    allowedObjectIds.push(...ownInterviews.map((i) => i.id));
    // Own jobs
    const ownJobs = await prisma.job.findMany({
      where: { ownerId: scope.userId },
      select: { id: true },
    });
    allowedObjectIds.push(...ownJobs.map((j) => j.id));
    // Uploaded by user — handled separately via uploadedById
  }

  if (scope.scope === "RELATED" && scope.userId) {
    if (scope.role === "interviewer") {
      const relatedInterviews = await prisma.interview.findMany({
        where: { interviewerId: scope.userId },
        select: { id: true },
      });
      allowedObjectIds.push(...relatedInterviews.map((i) => i.id));
    } else {
      // business_owner
      const bizJobs = await prisma.job.findMany({
        where: { businessOwnerId: scope.userId },
        select: { id: true },
      });
      allowedObjectIds.push(...bizJobs.map((j) => j.id));
    }
  }

  if (allowedObjectIds.length === 0) {
    // Check if user uploaded any media themselves
    if (scope.userId) {
      return { uploadedById: scope.userId };
    }
    return { id: "__DENY__" };
  }

  // Combine: media where objectId is in allowed set OR uploaded by user
  const conditions: Record<string, unknown>[] = [
    { objectId: { in: allowedObjectIds } },
  ];
  if (scope.userId) {
    conditions.push({ uploadedById: scope.userId });
  }

  return { OR: conditions };
}

// ============================================================
// Exported functions
// ============================================================

/** 1. Scope-filtered media asset list */
export async function getMediaAssets(filters: MediaAssetFilters, scope: ScopeWhere) {
  const scopeWhere = await resolveScopedMediaWhere(scope);

  const where: Record<string, unknown> = { ...scopeWhere };

  if (filters.objectType) where.objectType = filters.objectType;
  if (filters.objectId) where.objectId = filters.objectId;
  if (filters.mediaType) where.mediaType = filters.mediaType;
  if (filters.transcriptionStatus) where.transcriptionStatus = filters.transcriptionStatus;

  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip: filters.offset ?? 0,
      take: filters.limit ?? 20,
    }),
    prisma.mediaAsset.count({ where: where as any }),
  ]);

  return { items, total };
}

/** 2. Single asset, returns null if not found or unauthorized */
export async function getMediaAssetById(id: string, scope: ScopeWhere) {
  const scopeWhere = await resolveScopedMediaWhere(scope);
  const where: Record<string, unknown> = { id, ...scopeWhere };

  const asset = await prisma.mediaAsset.findFirst({ where: where as any });
  return asset;
}

/** 3. Upload/create a media asset */
export async function uploadMedia(data: UploadMediaData) {
  const asset = await prisma.mediaAsset.create({
    data: {
      objectType: data.objectType,
      objectId: data.objectId,
      mediaType: data.mediaType,
      fileName: data.fileName,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      durationMs: data.durationMs,
      storageKey: data.storageKey,
      transcriptionStatus: "none",
      uploadedById: data.uploadedById,
    },
  });
  return asset;
}

/** 4. Create transcription job */
export async function createTranscriptionJob(mediaAssetId: string, userId: string) {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekKey) {
    // Provider not configured — create job with not_configured status
    const job = await prisma.transcriptionJob.create({
      data: {
        mediaAssetId,
        provider: "deepseek",
        providerStatus: "not_configured",
        status: "not_configured",
        createdById: userId,
      },
    });

    await prisma.mediaAsset.update({
      where: { id: mediaAssetId },
      data: { transcriptionStatus: "not_configured" },
    });

    return { status: "not_configured" as const, job };
  }

  // Create job with processing status
  const job = await prisma.transcriptionJob.create({
    data: {
      mediaAssetId,
      provider: "deepseek",
      providerStatus: "processing",
      status: "processing",
      startedAt: new Date(),
      createdById: userId,
    },
  });

  await prisma.mediaAsset.update({
    where: { id: mediaAssetId },
    data: { transcriptionStatus: "processing" },
  });

  // Mock-complete: create a transcript with segments
  const transcript = await prisma.transcript.create({
    data: {
      mediaAssetId,
      transcriptionJobId: job.id,
      source: "asr",
      language: "zh-CN",
      reviewStatus: "pending",
      redactionStatus: "none",
      segmentCount: 4,
      createdById: userId,
    },
  });

  // Create 4 mock segments with speaker labels and timestamps
  const mockSegments = [
    { index: 0, speaker: "面试官", startMs: 0, endMs: 15000, text: "请简单介绍一下您的工作经历和主要技能。" },
    { index: 1, speaker: "候选人", startMs: 16000, endMs: 45000, text: "我有五年的前端开发经验，主要负责React和TypeScript项目。在上一家公司我主导了组件库的重构工作。" },
    { index: 2, speaker: "面试官", startMs: 46000, endMs: 58000, text: "能否具体说说您在这个重构项目中的角色和贡献？" },
    { index: 3, speaker: "候选人", startMs: 59000, endMs: 90000, text: "我负责整体架构设计，制定了迁移策略，并带领3人团队在两个月内完成了从老框架到React的迁移，性能提升了40%。" },
  ];

  for (const seg of mockSegments) {
    await prisma.transcriptSegment.create({
      data: {
        transcriptId: transcript.id,
        segmentIndex: seg.index,
        speakerLabel: seg.speaker,
        startMs: seg.startMs,
        endMs: seg.endMs,
        text: seg.text,
        evidenceLevel: "raw",
        isAiUsable: false,
      },
    });
  }

  // Update job to ready
  await prisma.transcriptionJob.update({
    where: { id: job.id },
    data: {
      status: "ready",
      providerStatus: "completed",
      finishedAt: new Date(),
    },
  });

  await prisma.mediaAsset.update({
    where: { id: mediaAssetId },
    data: { transcriptionStatus: "ready" },
  });

  return {
    status: "ready" as const,
    job,
    transcript,
  };
}

/** 5. Create manual transcript */
export async function createManualTranscript(
  mediaAssetId: string,
  data: ManualTranscriptData,
  userId: string
) {
  const transcript = await prisma.transcript.create({
    data: {
      mediaAssetId,
      source: "manual",
      language: "zh-CN",
      reviewStatus: "pending",
      redactionStatus: "none",
      segmentCount: data.segments.length,
      createdById: userId,
    },
  });

  for (let i = 0; i < data.segments.length; i++) {
    const seg = data.segments[i];
    await prisma.transcriptSegment.create({
      data: {
        transcriptId: transcript.id,
        segmentIndex: i,
        speakerLabel: seg.speakerLabel,
        startMs: seg.startMs,
        endMs: seg.endMs,
        text: seg.text,
        evidenceLevel: "raw",
        isAiUsable: false,
      },
    });
  }

  await prisma.mediaAsset.update({
    where: { id: mediaAssetId },
    data: { transcriptionStatus: "ready" },
  });

  return transcript;
}

/** 6. Get transcript by ID with segments */
export async function getTranscriptById(id: string) {
  const transcript = await prisma.transcript.findUnique({
    where: { id },
    include: {
      segments: { orderBy: { segmentIndex: "asc" } },
      analyses: { orderBy: { createdAt: "desc" } },
    },
  });
  return transcript;
}

/** 7. Review transcript */
export async function reviewTranscript(id: string, data: ReviewTranscriptData, userId: string) {
  const transcript = await prisma.transcript.update({
    where: { id },
    data: {
      reviewStatus: data.reviewStatus,
    },
  });

  // Write activity log
  await prisma.activityLog.create({
    data: {
      actorId: userId,
      action: "TRANSCRIPT_REVIEWED",
      resourceType: "transcript",
      resourceId: id,
      detail: {
        reviewStatus: data.reviewStatus,
        note: data.note,
        mediaAssetId: transcript.mediaAssetId,
      },
    },
  });

  return transcript;
}

/** 8. Analyze transcript via system rules */
export async function analyzeTranscript(id: string, userId: string) {
  const transcript = await prisma.transcript.findUnique({
    where: { id },
    include: {
      segments: { orderBy: { segmentIndex: "asc" } },
    },
  });

  if (!transcript) throw new Error("Transcript not found");
  if (transcript.segments.length === 0) throw new Error("无转写段落，无法分析");

  // Import analysis functions (lazy to avoid circular deps)
  const { analyzeTranscript: runAnalysis } = await import("./transcript-analysis-service");
  const analysisResult = runAnalysis(
    transcript.segments.map((s) => ({ text: s.text, speakerLabel: s.speakerLabel }))
  );

  // Save STAR analysis
  await prisma.transcriptAnalysis.create({
    data: {
      transcriptId: id,
      analysisType: "star",
      generatedBy: "system_rule",
      summary: JSON.stringify(analysisResult.star),
    },
  });

  // Save evidence density
  await prisma.transcriptAnalysis.create({
    data: {
      transcriptId: id,
      analysisType: "evidence_density",
      generatedBy: "system_rule",
      summary: JSON.stringify(analysisResult.evidence),
    },
  });

  // Save followup depth
  await prisma.transcriptAnalysis.create({
    data: {
      transcriptId: id,
      analysisType: "followup_depth",
      generatedBy: "system_rule",
      summary: JSON.stringify(analysisResult.followup),
    },
  });

  // Save vagueness analysis
  await prisma.transcriptAnalysis.create({
    data: {
      transcriptId: id,
      analysisType: "vagueness",
      generatedBy: "system_rule",
      summary: JSON.stringify(analysisResult.vagueness),
    },
  });

  // Write activity log
  await prisma.activityLog.create({
    data: {
      actorId: userId,
      action: "TRANSCRIPT_ANALYZED",
      resourceType: "transcript",
      resourceId: id,
      detail: {
        analysisTypes: ["star", "evidence_density", "followup_depth", "vagueness"],
        starCompleteness: analysisResult.star.completeness,
      },
    },
  });

  return analysisResult;
}

/** 9. Get media linked to an interview */
export async function getInterviewMedia(interviewId: string, scope: ScopeWhere) {
  // First verify the interview is within scope
  const scopeWhere = await resolveScopedMediaWhere(scope);

  const media = await prisma.mediaAsset.findMany({
    where: {
      objectType: "interview",
      objectId: interviewId,
      ...scopeWhere,
    } as any,
    orderBy: { createdAt: "desc" },
  });

  return media;
}

/** 10. Get media KPI statistics */
export async function getMediaStats(scope: ScopeWhere) {
  const scopeWhere = await resolveScopedMediaWhere(scope);

  const [total, pending, processing, ready, failed, notConfigured] = await Promise.all([
    prisma.mediaAsset.count({ where: scopeWhere as any }),
    prisma.mediaAsset.count({ where: { ...scopeWhere, transcriptionStatus: "pending" } as any }),
    prisma.mediaAsset.count({ where: { ...scopeWhere, transcriptionStatus: "processing" } as any }),
    prisma.mediaAsset.count({ where: { ...scopeWhere, transcriptionStatus: "ready" } as any }),
    prisma.mediaAsset.count({ where: { ...scopeWhere, transcriptionStatus: "failed" } as any }),
    prisma.mediaAsset.count({ where: { ...scopeWhere, transcriptionStatus: "not_configured" } as any }),
  ]);

  // Count AI-usable segments
  const aiUsable = await prisma.transcriptSegment.count({
    where: {
      isAiUsable: true,
      transcript: {
        mediaAsset: scopeWhere as any,
      },
    },
  });

  // Count review-approved transcripts
  const reviewApproved = await prisma.transcript.count({
    where: {
      reviewStatus: "approved",
      mediaAsset: scopeWhere as any,
    },
  });

  return {
    total,
    pending,
    processing,
    ready,
    failed,
    notConfigured,
    aiUsable,
    reviewApproved,
  };
}
