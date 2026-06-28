// Phase 8.11: Copilot Prompt Registry v2
// 9 模板 + DB 优先加载（AIPromptTemplate.isActive=true 优先）

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  }
  return _prisma;
}

export interface PromptTemplate {
  key: string;
  name: string;
  objectType: string;
  promptVersion: string;
  systemPrompt: string;
  userPromptTemplate: string;
}

// ============================================================================
// System Boundary — 所有模板共享
// ============================================================================

const SYSTEM_BOUNDARY_V2 = `你是一个招聘 AI 辅助分析助手，仅供 HR 和业务参考。
你必须严格遵守以下规则：
1. 不得建议录用或淘汰任何候选人；
2. 不得建议发 Offer 或审批 Offer；
3. 不得编造不存在的证据或数据；
4. 不得承诺薪资、晋升或业务资源；
5. 不得输出手机号、邮箱、身份证、详细薪资等敏感信息；
6. 只能基于提供的上下文数据进行分析，上下文之外的信息不得引用；
7. 所有建议必须标注为"AI 辅助建议，仅供参考"；
8. 必须返回 JSON，包含 answer / suggestedAction / evidence[] / draftActions[] / confidence 字段；
9. draftActions 中每个行动项必须包含 title / description / category / priority，不得包含 ownerId（由人工确认时指定）；
10. 若上下文中证据不足，必须在 answer 中明确指出证据缺口，不得编造。`;

// ============================================================================
// 9 Prompt Templates
// ============================================================================

const templates: PromptTemplate[] = [
  {
    key: "dashboard-risk-priority-v1",
    name: "Dashboard 风险优先级",
    objectType: "dashboard",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY_V2,
    userPromptTemplate: `当前模块：招聘总览
当前权限：{{scope}}
上下文数据：
{{context}}

用户问题：{{question}}

请基于以上数据，分析今日最需要关注的风险和优先处理事项。`,
  },
  {
    key: "job-calibration-copilot-v1",
    name: "岗位画像校准",
    objectType: "job",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY_V2,
    userPromptTemplate: `当前模块：岗位中心
当前权限：{{scope}}
上下文数据：
{{context}}

用户问题：{{question}}

请基于以上数据，分析岗位画像校准问题、JD 缺口和面试题建议。`,
  },
  {
    key: "candidate-evaluation-copilot-v1",
    name: "候选人评估",
    objectType: "candidate",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY_V2,
    userPromptTemplate: `当前模块：候选人中心
当前权限：{{scope}}
上下文数据：
{{context}}

用户问题：{{question}}

请基于以上数据，生成证据型候选人评估建议。不得输出"必须录用"或"必须淘汰"的结论。`,
  },
  {
    key: "interview-quality-copilot-v1",
    name: "面试质量分析",
    objectType: "interview_quality",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY_V2,
    userPromptTemplate: `当前模块：面试质量
当前权限：{{scope}}
上下文数据：
{{context}}

用户问题：{{question}}

请基于以上数据，指出面评证据缺口、追问深度不足之处，并提供下一轮追问建议。不得对面试官做人身评价。`,
  },
  {
    key: "offer-closing-copilot-v1",
    name: "Offer Closing 建议",
    objectType: "offer_risk",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY_V2,
    userPromptTemplate: `当前模块：Offer 风险
当前权限：{{scope}}
上下文数据：
{{context}}

用户问题：{{question}}

请基于以上数据，生成 closing 风险说明和沟通建议。不得承诺薪资或自动推进流程。`,
  },
  {
    key: "action-resolution-copilot-v1",
    name: "行动项处理建议",
    objectType: "action",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY_V2,
    userPromptTemplate: `当前模块：行动中心
当前权限：{{scope}}
上下文数据：
{{context}}

用户问题：{{question}}

请基于以上数据，生成处理建议和关闭说明草稿。不得自动关闭或分配 Action。`,
  },
  {
    key: "funnel-bottleneck-copilot-v1",
    name: "漏斗瓶颈分析",
    objectType: "funnel",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY_V2,
    userPromptTemplate: `当前模块：招聘漏斗
当前权限：{{scope}}
上下文数据：
{{context}}

用户问题：{{question}}

请基于以上数据，分析阶段卡点、渠道问题和停留时长异常。缺失数据显示为"数据缺失"，不得当作 0 处理。`,
  },
  {
    key: "knowledge-rag-copilot-v1",
    name: "知识库 RAG 问答",
    objectType: "knowledge",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY_V2,
    userPromptTemplate: `当前模块：知识库
当前权限：{{scope}}
检索结果：
{{context}}

用户问题：{{question}}

请严格基于以上检索结果回答。如果检索结果不足以回答，请明确指出证据不足。不得编造引用。`,
  },
  {
    key: "speech-segment-copilot-v1",
    name: "转写段落分析",
    objectType: "transcript",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY_V2,
    userPromptTemplate: `当前模块：面试沟通智能分析
当前权限：{{scope}}
转写段落与分析数据：
{{context}}

用户问题：{{question}}

请基于以上转写段落，分析表达结构、证据密度和追问质量。不得做情绪、口音、性格、声音评分或撒谎识别。`,
  },
];

// ============================================================================
// DB 优先 + 代码 Fallback
// ============================================================================

export async function getPrompt(key: string): Promise<PromptTemplate | undefined> {
  // 1. Try DB first (isActive=true)
  try {
    const dbTemplate = await getPrisma().aIPromptTemplate.findFirst({
      where: { key, isActive: true },
    });
    if (dbTemplate) {
      return {
        key: dbTemplate.key,
        name: dbTemplate.name,
        objectType: dbTemplate.objectType,
        promptVersion: dbTemplate.promptVersion,
        systemPrompt: dbTemplate.systemPrompt,
        userPromptTemplate: dbTemplate.userPromptTemplate,
      };
    }
  } catch {
    // DB might not be ready, fall through to code
  }

  // 2. Fallback to code registry
  return templates.find((t) => t.key === key);
}

export async function getDefaultPrompt(moduleKey: string, objectType: string): Promise<PromptTemplate | undefined> {
  const promptKey = resolvePromptKey(moduleKey, objectType);
  return (await getPrompt(promptKey)) ?? (await getPrompt("dashboard-risk-priority-v1"));
}

export function resolvePromptKey(moduleKey: string, objectType: string): string {
  // Map moduleKey/objectType to prompt key
  const map: Record<string, string> = {
    dashboard: "dashboard-risk-priority-v1",
    jobs: "job-calibration-copilot-v1",
    job: "job-calibration-copilot-v1",
    candidates: "candidate-evaluation-copilot-v1",
    candidate: "candidate-evaluation-copilot-v1",
    interviews: "interview-quality-copilot-v1",
    interview_quality: "interview-quality-copilot-v1",
    "interview-quality": "interview-quality-copilot-v1",
    "offer-risks": "offer-closing-copilot-v1",
    offer_risk: "offer-closing-copilot-v1",
    actions: "action-resolution-copilot-v1",
    action: "action-resolution-copilot-v1",
    funnel: "funnel-bottleneck-copilot-v1",
    "analytics/recruitment-funnel": "funnel-bottleneck-copilot-v1",
    knowledge: "knowledge-rag-copilot-v1",
    media: "speech-segment-copilot-v1",
    transcript: "speech-segment-copilot-v1",
    data_sources: "knowledge-rag-copilot-v1",
    "data-sources": "knowledge-rag-copilot-v1",
  };
  return map[moduleKey] || map[objectType] || "dashboard-risk-priority-v1";
}

export function listAllPromptKeys(): string[] {
  return templates.map((t) => t.key);
}
