# Phase 8.14 CEO Demo Script — 理然智能招聘 AI 看板

## 开场（1分钟）
"这个工具不是替代Moka，也不是重新做一个ATS。它解决的是CEO、业务负责人和招聘团队最痛的判断问题：岗位到底要什么人、面试有没有问到关键证据、候选人是否真的匹配、招聘流程卡在哪里、风险有没有人处理。现在我们已经把理然真实JD、岗位SOP、知识库、AI Copilot和行动中心串起来，AI所有建议都必须带引用来源，证据不足时不会瞎答，最终由人确认。"

## Demo Path A: 核心管理层路径（4分钟）

| 步骤 | 页面 | 讲解 | 点击 |
|------|------|------|------|
| A1 | Dashboard | "首页展示100个真实岗位，0候选人说明还没接入真实招聘数据。系统不造假，数据不足就显示partial/empty。" | 点顶部AI助手 |
| A2 | AI Copilot | "AI是全局能力，根据当前页面上下文回答。问它'今天有哪些风险'，如果证据充分会给出带引用的建议。" | 输入问题 |
| A3 | Copilot Answer | "看：provider/deepseek、model、promptVersion、citation引用来源全可见。Human Review三态：接受/编辑后接受/忽略。Draft Action只是草稿，必须人工确认。" | 进入Funnel |
| A4 | Funnel | "漏斗展示真实数据或partial。数据不足时明确标注，不把null当0。" | 进入Action Center |
| A5 | Action Center | "卡点不是只展示，而是转成行动闭环。真实Action或诚实空态。" | 进入Job Detail |
| A6 | Job Detail | "打开真实岗位详情。JD原文、职责、任职要求、source_file/source_sheet/source_row全可追溯。证明不是假岗位。" | — |

## Demo Path B: 招聘业务路径（3分钟）

| 步骤 | 页面 | 讲解 |
|------|------|------|
| B1 | Jobs | "100个真实岗位来自理然JD库，不展示测试岗位。每个岗位可追溯来源。" |
| B2 | Job Detail | "打开岗位详情，JD原文大段可读。结构化字段：职级、部门、画像摘要。" |
| B3 | Knowledge | "搜索岗位关键词，命中真实JD/SOP chunk。引用来源可读。" |
| B4 | Copilot | "基于岗位上下文让AI生成分析，必须带引用来源。" |
| B5 | Interview Quality | "如果没有真实面试，展示诚实空态，说明需导入面试材料后分析。" |

## Demo Path C: AI可信与集成路径（3分钟）

| 步骤 | 页面 | 讲解 |
|------|------|------|
| C1 | Integrations | "DeepSeek已配置可用。飞书/Moka未配置则显示not_configured，不假同步。" |
| C2 | Data Sources | "真实JD库、岗位SOP已导入。DataSource真实文件可见。" |
| C3 | Knowledge | "知识检索与引用来源。无RAG/citation/embedding黑话。" |
| C4 | Copilot | "citation+Human Review+Draft Action。AI输出不是自动决策，必须人工确认。" |
| C5 | Media | "音视频分析地基，不做情绪/口音/性格/声音/撒谎判断。免责声明清楚。" |

## 收尾（1分钟）
"这个产品当前状态：真实数据已接入、AI可信可追溯、招聘判断闭环已形成、SaaS雏形已建立。后续需要：真实候选人数据导入、Moka/飞书集成、CEO Demo反馈迭代。"
