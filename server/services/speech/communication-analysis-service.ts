// Phase 8.10: Communication Analysis Service — System-rule-based analysis (no LLM)
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export interface StarAnalysis {
  completeness: number; // 0-100
  hasSituation: boolean;
  hasTask: boolean;
  hasAction: boolean;
  hasResult: boolean;
  summary: string;
  evidenceSegmentIds: string[];
}

export interface EvidenceDensityAnalysis {
  density: "high" | "medium" | "low";
  projectCount: number;
  dataCount: number;
  resultCount: number;
  actionCount: number;
  summary: string;
  evidenceSegmentIds: string[];
}

export interface FollowupQualityAnalysis {
  depth: "deep" | "moderate" | "shallow";
  hasWhyQuestions: boolean;
  hasHowQuestions: boolean;
  hasMetricQuestions: boolean;
  hasResultQuestions: boolean;
  followupCount: number;
  summary: string;
  evidenceSegmentIds: string[];
}

export interface VaguenessAnalysis {
  level: "low" | "medium" | "high";
  vaguePhrases: string[];
  summary: string;
  evidenceSegmentIds: string[];
}

export interface CommunicationReport {
  star: StarAnalysis;
  evidenceDensity: EvidenceDensityAnalysis;
  followupQuality: FollowupQualityAnalysis;
  vagueness: VaguenessAnalysis;
  suggestedFollowUps: string[];
  disclaimer: string; // "AI 辅助建议，仅供参考，不构成录用/淘汰决策依据。"
}

// ============================================================
// STAR analysis keywords
// ============================================================

const SITUATION_KEYWORDS = [
  "背景", "当时", "之前", "项目背景", "业务需求", "面临", "问题",
  "场景", "环境", "阶段", "初期", "上线前", "在.*公司", "在.*团队",
];

const TASK_KEYWORDS = [
  "任务", "目标", "负责", "需要", "要求", "我的职责", "分配",
  "要解决", "KPI", "OKR", "指标", "期望", "计划",
];

const ACTION_KEYWORDS = [
  "我做了", "我设计", "我开发", "我实现", "我推动", "我主导",
  "我负责", "我带领", "我协调", "我优化", "我重构", "我搭建",
  "采用了", "使用了", "通过", "方案", "策略", "措施", "步骤",
  "实施", "执行", "部署", "迁移", "重构", "优化",
];

const RESULT_KEYWORDS = [
  "结果", "效果", "提升", "降低", "减少", "增长", "完成",
  "达到", "实现", "交付", "上线", "发布", "性能", "数据",
  "%", "倍", "从.*到", "提高", "改善", "成功",
];

// ============================================================
// Evidence density keywords
// ============================================================

const PROJECT_WORDS = ["项目", "产品", "系统", "平台", "工具", "框架", "模块"];
const DATA_WORDS = ["数据", "%", "倍", "指标", "统计", "分析", "度量", "从.*到"];
const RESULT_WORDS = ["结果", "效果", "提升", "降低", "完成", "上线", "交付", "发布", "成功"];
const ACTION_WORDS = ["设计", "开发", "实现", "搭建", "重构", "优化", "推动", "主导", "带领"];

// ============================================================
// Followup quality keywords
// ============================================================

const WHY_WORDS = ["为什么", "原因", "动机", "考虑", "出发点"];
const HOW_WORDS = ["怎么做", "如何", "方法", "流程", "步骤", "方案", "怎么实现"];
const METRIC_WORDS = ["%", "指标", "数据", "具体数字", "量化", "多少"];
const RESULT_Q_WORDS = ["结果", "效果", "成果", "影响", "收益"];

// ============================================================
// Vagueness phrases
// ============================================================

const VAGUE_PHRASES = [
  "大概", "可能", "好像", "应该", "差不多", "基本上", "一般般",
  "还行", "还可以", "不错", "比较好", "挺好的", "很多",
  "一些", "各种", "之类的", "等等", "什么的", "这方面",
  "那方面", "做过一些", "参与过", "了解过", "不太清楚", "记不太清",
];

// ============================================================
// Helper functions
// ============================================================

function matchAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => {
    try {
      return new RegExp(kw, "i").test(lower);
    } catch {
      return lower.includes(kw.toLowerCase());
    }
  });
}

function countMatches(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const kw of keywords) {
    try {
      const matches = lower.match(new RegExp(kw, "gi"));
      if (matches) count += matches.length;
    } catch {
      // skip invalid regex
    }
  }
  return count;
}

function detectVaguePhrases(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const phrase of VAGUE_PHRASES) {
    try {
      if (new RegExp(phrase, "i").test(lower)) {
        found.push(phrase);
      }
    } catch {
      if (lower.includes(phrase)) {
        found.push(phrase);
      }
    }
  }
  return found;
}

// ============================================================
// Main analysis function
// ============================================================

export async function analyzeCommunication(
  transcriptId: string,
  userId?: string
): Promise<CommunicationReport> {
  // 1. Fetch segments
  const transcript = await prisma.transcript.findUnique({
    where: { id: transcriptId },
    include: {
      segments: { orderBy: { segmentIndex: "asc" } },
    },
  });

  if (!transcript) throw new Error("Transcript not found");
  if (transcript.segments.length === 0) throw new Error("无转写段落，无法分析");

  const segments = transcript.segments;

  // Separate candidate and interviewer segments
  const candidateSegments = segments.filter(
    (s) => s.speakerLabel && !s.speakerLabel.includes("面试")
  );
  const interviewerSegments = segments.filter(
    (s) => s.speakerLabel && s.speakerLabel.includes("面试")
  );

  const candidateText = candidateSegments.map((s) => s.text).join(" ");
  const interviewerText = interviewerSegments.map((s) => s.text).join(" ");
  const allText = segments.map((s) => s.text).join(" ");

  // 2. STAR Analysis
  const hasSituation = matchAny(candidateText, SITUATION_KEYWORDS);
  const hasTask = matchAny(candidateText, TASK_KEYWORDS);
  const hasAction = matchAny(candidateText, ACTION_KEYWORDS);
  const hasResult = matchAny(candidateText, RESULT_KEYWORDS);

  let starCompleteness = 0;
  if (hasSituation) starCompleteness += 25;
  if (hasTask) starCompleteness += 25;
  if (hasAction) starCompleteness += 25;
  if (hasResult) starCompleteness += 25;

  let starSummary: string;
  if (starCompleteness >= 75) {
    starSummary = "STAR结构完整，回答包含了背景、任务、行动和结果四个要素。";
  } else if (starCompleteness >= 50) {
    const missing: string[] = [];
    if (!hasSituation) missing.push("背景描述");
    if (!hasTask) missing.push("任务说明");
    if (!hasAction) missing.push("具体行动");
    if (!hasResult) missing.push("结果数据");
    starSummary = `STAR结构不完整，缺少：${missing.join("、")}。`;
  } else {
    starSummary = "STAR结构严重缺失，回答缺乏结构化叙述，建议追问引导补充具体细节。";
  }

  // Find evidence segments for STAR
  const starEvidenceIds = candidateSegments
    .filter(
      (s) =>
        matchAny(s.text, SITUATION_KEYWORDS) ||
        matchAny(s.text, TASK_KEYWORDS) ||
        matchAny(s.text, ACTION_KEYWORDS) ||
        matchAny(s.text, RESULT_KEYWORDS)
    )
    .slice(0, 5)
    .map((s) => s.id);

  // 3. Evidence Density
  const projectCount = countMatches(candidateText, PROJECT_WORDS);
  const dataCount = countMatches(candidateText, DATA_WORDS);
  const resultCount = countMatches(candidateText, RESULT_WORDS);
  const actionCount = countMatches(candidateText, ACTION_WORDS);

  let density: "high" | "medium" | "low";
  const totalEvidence = projectCount + dataCount + resultCount + actionCount;
  if (totalEvidence >= 8) {
    density = "high";
  } else if (totalEvidence >= 4) {
    density = "medium";
  } else {
    density = "low";
  }

  let evidenceSummary: string;
  if (density === "high") {
    evidenceSummary = "回答中包含丰富的证据支撑，项目经验、数据指标和行动描述较为充分。";
  } else if (density === "medium") {
    evidenceSummary = "回答中有一定的证据支撑，但数据指标和具体项目细节可以更丰富。";
  } else {
    evidenceSummary = "回答中缺乏具体证据，建议引导候选人提供更多项目实例和数据支撑。";
  }

  const evidenceEvidenceIds = candidateSegments
    .filter(
      (s) =>
        countMatches(s.text, PROJECT_WORDS) > 0 ||
        countMatches(s.text, DATA_WORDS) > 0
    )
    .slice(0, 5)
    .map((s) => s.id);

  // 4. Followup Quality
  const hasWhyQuestions = matchAny(interviewerText, WHY_WORDS);
  const hasHowQuestions = matchAny(interviewerText, HOW_WORDS);
  const hasMetricQuestions = matchAny(interviewerText, METRIC_WORDS);
  const hasResultQuestions = matchAny(interviewerText, RESULT_Q_WORDS);

  const followupCount = Math.max(0, interviewerSegments.length - 1); // first segment is opening question

  let depth: "deep" | "moderate" | "shallow";
  const depthScore = [hasWhyQuestions, hasHowQuestions, hasMetricQuestions, hasResultQuestions].filter(Boolean).length;
  if (depthScore >= 3) {
    depth = "deep";
  } else if (depthScore >= 2) {
    depth = "moderate";
  } else {
    depth = "shallow";
  }

  let followupSummary: string;
  if (depth === "deep") {
    followupSummary = "追问深度良好，涉及原因分析、实施方法和量化结果。";
  } else if (depth === "moderate") {
    followupSummary = "追问有一定深度，但部分维度（原因分析或量化指标）可以加强。";
  } else {
    followupSummary = "追问深度较浅，建议增加对原因、方法和量化结果的追问。";
  }

  const followupEvidenceIds = interviewerSegments
    .slice(1) // skip opening question
    .filter(
      (s) =>
        matchAny(s.text, WHY_WORDS) ||
        matchAny(s.text, HOW_WORDS) ||
        matchAny(s.text, METRIC_WORDS)
    )
    .slice(0, 5)
    .map((s) => s.id);

  // 5. Vagueness Analysis
  const vaguePhrases = detectVaguePhrases(candidateText);

  let vaguenessLevel: "low" | "medium" | "high";
  if (vaguePhrases.length <= 2) {
    vaguenessLevel = "low";
  } else if (vaguePhrases.length <= 5) {
    vaguenessLevel = "medium";
  } else {
    vaguenessLevel = "high";
  }

  let vaguenessSummary: string;
  if (vaguenessLevel === "low") {
    vaguenessSummary = "回答用语明确，模糊表述较少。";
  } else if (vaguenessLevel === "medium") {
    vaguenessSummary = `回答中存在一定模糊表述：${vaguePhrases.slice(0, 3).join("、")}等，建议追问具体细节。`;
  } else {
    vaguenessSummary = `回答中存在较多模糊表述：${vaguePhrases.slice(0, 5).join("、")}等，需要重点追问以获取明确信息。`;
  }

  const vaguenessEvidenceIds = candidateSegments
    .filter((s) => detectVaguePhrases(s.text).length > 0)
    .slice(0, 5)
    .map((s) => s.id);

  // 6. Suggested follow-up questions
  const suggestedFollowUps: string[] = [];
  if (!hasSituation) suggestedFollowUps.push("能介绍一下当时这个项目的背景和团队情况吗？");
  if (!hasTask) suggestedFollowUps.push("你在项目中的具体职责和目标是什么？");
  if (!hasAction) suggestedFollowUps.push("能否详细描述一下你采取的具体行动步骤？");
  if (!hasResult) suggestedFollowUps.push("这个项目最终达到了什么效果？有没有可量化的数据？");
  if (vaguenessLevel !== "low") suggestedFollowUps.push("你刚才提到了一些比较概括的内容，能否举一个具体的例子？");
  if (depth === "shallow") suggestedFollowUps.push("面试官可以增加对候选人的追问，了解更多细节和思考过程。");

  const report: CommunicationReport = {
    star: {
      completeness: starCompleteness,
      hasSituation,
      hasTask,
      hasAction,
      hasResult,
      summary: starSummary,
      evidenceSegmentIds: starEvidenceIds,
    },
    evidenceDensity: {
      density,
      projectCount,
      dataCount,
      resultCount,
      actionCount,
      summary: evidenceSummary,
      evidenceSegmentIds: evidenceEvidenceIds,
    },
    followupQuality: {
      depth,
      hasWhyQuestions,
      hasHowQuestions,
      hasMetricQuestions,
      hasResultQuestions,
      followupCount,
      summary: followupSummary,
      evidenceSegmentIds: followupEvidenceIds,
    },
    vagueness: {
      level: vaguenessLevel,
      vaguePhrases,
      summary: vaguenessSummary,
      evidenceSegmentIds: vaguenessEvidenceIds,
    },
    suggestedFollowUps,
    disclaimer: "AI 辅助建议，仅供参考，不构成录用/淘汰决策依据。",
  };

  // 7. Save CommunicationAnalysis + CommunicationEvidence records
  const analysisTypes: Array<{
    type: string;
    title: string;
    summary: string;
    riskLevel: string | null;
  }> = [
    {
      type: "star",
      title: "STAR 结构化分析",
      summary: starSummary,
      riskLevel: starCompleteness < 50 ? "high" : starCompleteness < 75 ? "medium" : null,
    },
    {
      type: "evidence_density",
      title: "证据密度分析",
      summary: evidenceSummary,
      riskLevel: density === "low" ? "high" : density === "medium" ? "medium" : null,
    },
    {
      type: "followup_quality",
      title: "追问质量分析",
      summary: followupSummary,
      riskLevel: depth === "shallow" ? "high" : depth === "moderate" ? "medium" : null,
    },
    {
      type: "vagueness",
      title: "表述模糊度分析",
      summary: vaguenessSummary,
      riskLevel: vaguenessLevel === "high" ? "high" : vaguenessLevel === "medium" ? "medium" : null,
    },
  ];

  for (const at of analysisTypes) {
    const analysis = await prisma.communicationAnalysis.create({
      data: {
        transcriptId,
        analysisType: at.type,
        title: at.title,
        summary: at.summary,
        riskLevel: at.riskLevel,
        generatedBy: "system_rule",
        humanReviewStatus: "pending",
      },
    });

    // Save evidence records for this analysis type
    let evidenceIds: string[] = [];
    if (at.type === "star") evidenceIds = starEvidenceIds;
    else if (at.type === "evidence_density") evidenceIds = evidenceEvidenceIds;
    else if (at.type === "followup_quality") evidenceIds = followupEvidenceIds;
    else if (at.type === "vagueness") evidenceIds = vaguenessEvidenceIds;

    for (const segId of evidenceIds) {
      const seg = segments.find((s) => s.id === segId);
      if (seg) {
        await prisma.communicationEvidence.create({
          data: {
            analysisId: analysis.id,
            transcriptSegmentId: seg.id,
            quote: seg.text.length > 200 ? seg.text.slice(0, 200) + "..." : seg.text,
            startMs: seg.startMs,
            endMs: seg.endMs,
            speakerRole: seg.speakerLabel ?? null,
            reason: `Evidence for ${at.type} analysis`,
          },
        });
      }
    }
  }

  // Write activity log if userId provided
  if (userId) {
    await prisma.activityLog.create({
      data: {
        actorId: userId,
        action: "COMMUNICATION_ANALYZED",
        resourceType: "transcript",
        resourceId: transcriptId,
        detail: {
          analysisTypes: analysisTypes.map((a) => a.type),
          starCompleteness,
          evidenceDensity: density,
          followupDepth: depth,
          vaguenessLevel,
        },
      },
    });
  }

  return report;
}
