// Phase 8.6: AI Prompt Registry
// 5 built-in prompt templates with system boundary + forbidden actions.

const SYSTEM_BOUNDARY = `
你是一个招聘 AI 辅助分析助手，仅供 HR 和业务参考。
你必须严格遵守以下规则：
1. 不得建议录用或淘汰任何候选人；
2. 不得建议发 Offer 或审批 Offer；
3. 不得编造不存在的证据或数据；
4. 不得承诺薪资、晋升或业务资源；
5. 不得输出手机号、邮箱、身份证、详细薪资等敏感信息；
6. 只能基于提供的上下文数据进行分析；
7. 所有建议必须标注为"AI 辅助建议，仅供参考"。
`;

export interface PromptTemplate {
  key: string;
  name: string;
  objectType: string;
  promptVersion: string;
  systemPrompt: string;
  userPromptTemplate: string;
}

const templates: PromptTemplate[] = [
  {
    key: "job-risk-explainer-v1",
    name: "岗位风险解释",
    objectType: "job",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY,
    userPromptTemplate: `请分析以下岗位的招聘卡点和风险，给出下一步建议。\n\n岗位上下文：\n{{context}}\n\n用户问题：{{question}}`,
  },
  {
    key: "candidate-evidence-review-v1",
    name: "候选人证据审查",
    objectType: "candidate",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY,
    userPromptTemplate: `请分析以下候选人的证据充分度和风险信号，给出追问建议。\n\n候选人上下文：\n{{context}}\n\n用户问题：{{question}}`,
  },
  {
    key: "interview-quality-review-v1",
    name: "面试质量审查",
    objectType: "interview_quality",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY,
    userPromptTemplate: `请分析以下面试反馈的质量问题，给出改进建议。\n\n面试质量上下文：\n{{context}}\n\n用户问题：{{question}}`,
  },
  {
    key: "offer-risk-closing-v1",
    name: "Offer 风险 Closing",
    objectType: "offer_risk",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY,
    userPromptTemplate: `请分析以下 Offer 风险并给出 closing 建议。\n\nOffer 风险上下文：\n{{context}}\n\n用户问题：{{question}}`,
  },
  {
    key: "action-next-step-v1",
    name: "行动项建议",
    objectType: "action",
    promptVersion: "v1",
    systemPrompt: SYSTEM_BOUNDARY,
    userPromptTemplate: `请分析以下行动项并给出下一步建议。\n\n行动项上下文：\n{{context}}\n\n用户问题：{{question}}`,
  },
];

export function getPrompt(key: string): PromptTemplate | undefined {
  return templates.find((t) => t.key === key);
}

export function getAllPrompts(): PromptTemplate[] {
  return templates;
}
