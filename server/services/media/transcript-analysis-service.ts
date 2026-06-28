// Phase 8.10: Transcript Analysis Service — System-rule-based analysis (no LLM)

export interface StarAnalysis {
  hasSituation: boolean;
  hasTask: boolean;
  hasAction: boolean;
  hasResult: boolean;
  completeness: number; // 0-100
  summary: string;
}

export interface EvidenceDensity {
  projectCount: number;
  dataCount: number;
  resultCount: number;
  actionCount: number;
  density: "high" | "medium" | "low";
  summary: string;
}

export interface FollowupDepth {
  hasWhy: boolean;
  hasHow: boolean;
  hasMetric: boolean;
  hasResult: boolean;
  depth: "deep" | "moderate" | "shallow";
  summary: string;
}

export interface VaguenessAnalysis {
  vaguePhrases: string[];
  vaguenessLevel: "low" | "medium" | "high";
  summary: string;
}

// ============================================================
// STAR analysis helpers
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

// ============================================================
// Evidence density helpers
// ============================================================

const PROJECT_WORDS = ["项目", "产品", "系统", "平台", "工具", "框架", "模块"];
const DATA_WORDS = ["数据", "%", "倍", "指标", "统计", "分析", "度量", "从.*到"];
const RESULT_WORDS = ["结果", "效果", "提升", "降低", "完成", "上线", "交付", "发布", "成功"];
const ACTION_WORDS = ["设计", "开发", "实现", "搭建", "重构", "优化", "推动", "主导", "带领"];

// ============================================================
// Vagueness helpers
// ============================================================

const VAGUE_PHRASES = [
  "大概", "可能", "好像", "应该", "差不多", "基本上", "一般般",
  "还行", "还可以", "不错", "比较好", "挺好的", "很多",
  "一些", "各种", "之类的", "等等", "什么的", "这方面",
  "那方面", "做过一些", "参与过", "了解过",
];

// ============================================================
// Main analysis function
// ============================================================

export function analyzeTranscript(
  segments: Array<{ text: string; speakerLabel: string | null }>
): {
  star: StarAnalysis;
  evidence: EvidenceDensity;
  followup: FollowupDepth;
  vagueness: VaguenessAnalysis;
} {
  const candidateSegments = segments.filter((s) => s.speakerLabel !== "面试官");
  const allText = segments.map((s) => s.text).join(" ");
  const candidateText = candidateSegments.map((s) => s.text).join(" ");

  // --- STAR Analysis ---
  const hasSituation = matchAny(candidateText, SITUATION_KEYWORDS);
  const hasTask = matchAny(candidateText, TASK_KEYWORDS);
  const hasAction = matchAny(candidateText, ACTION_KEYWORDS);
  const hasResult = matchAny(candidateText, RESULT_KEYWORDS);

  let completeness = 0;
  if (hasSituation) completeness += 25;
  if (hasTask) completeness += 25;
  if (hasAction) completeness += 25;
  if (hasResult) completeness += 25;

  let starSummary: string;
  if (completeness >= 75) {
    starSummary = "STAR结构完整，回答包含了背景、任务、行动和结果四个要素。";
  } else if (completeness >= 50) {
    const missing: string[] = [];
    if (!hasSituation) missing.push("背景描述");
    if (!hasTask) missing.push("任务说明");
    if (!hasAction) missing.push("具体行动");
    if (!hasResult) missing.push("结果数据");
    starSummary = `STAR结构不完整，缺少：${missing.join("、")}。`;
  } else {
    starSummary = "STAR结构严重缺失，回答缺乏结构化叙述，建议追问引导补充具体细节。";
  }

  // --- Evidence Density ---
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

  // --- Followup Depth ---
  const hasWhy = /\?/.test(candidateText) || matchAny(candidateText, ["因为", "原因", "动机", "考虑"]);
  const hasHow = matchAny(candidateText, ["怎么做", "如何", "方法", "流程", "步骤", "方案"]);
  const hasMetric = matchAny(candidateText, ["%", "倍", "指标", "数据", "从.*到"]);
  const hasFollowupResult = hasResult; // reuse STAR result detection

  let depth: "deep" | "moderate" | "shallow";
  const depthScore = [hasWhy, hasHow, hasMetric, hasFollowupResult].filter(Boolean).length;
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

  // --- Vagueness Analysis ---
  const vaguePhrases: string[] = [];
  for (const phrase of VAGUE_PHRASES) {
    try {
      if (new RegExp(phrase, "i").test(candidateText)) {
        vaguePhrases.push(phrase);
      }
    } catch {
      if (candidateText.includes(phrase)) {
        vaguePhrases.push(phrase);
      }
    }
  }

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

  return {
    star: { hasSituation, hasTask, hasAction, hasResult, completeness, summary: starSummary },
    evidence: { projectCount, dataCount, resultCount, actionCount, density, summary: evidenceSummary },
    followup: { hasWhy, hasHow, hasMetric, hasResult: hasFollowupResult, depth, summary: followupSummary },
    vagueness: { vaguePhrases, vaguenessLevel, summary: vaguenessSummary },
  };
}
