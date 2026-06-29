# Phase 8.14 CEO Demo Path

主路径：Dashboard → AI Copilot → Funnel → Action Center → Job Detail → Knowledge

## Step 1: Dashboard
- 页面：/dashboard
- 点击路径：直接打开
- CEO看到：100真实岗位、0候选人（诚实空态）、风险提醒
- 解决痛点：管理层30秒判断招聘健康度
- AI价值：系统规则提醒 + AI辅助建议入口
- 真实数据：jobs表100条记录
- 下一步：点击顶部AI助手按钮
- 空态解释：候选人/面试数据为空因为尚未导入真实招聘数据

## Step 2: AI Copilot
- 页面：全局Copilot Panel（从Dashboard打开）
- 点击路径：Topbar AI助手按钮
- CEO看到：上下文来源列表、输入框、Prompt Starters
- 解决痛点：AI不是外挂，是基于当前页面上下文的全局能力
- AI价值：基于真实JD/SOP context回答，带引用来源
- 真实数据：contextRefs来自jobs/knowledge_chunks
- 下一步：输入问题"今天有哪些风险"
- 空态解释：如证据不足则no evidence短路

## Step 3: Funnel
- 页面：/analytics/recruitment-funnel
- 点击路径：导航"招聘漏斗"
- CEO看到：阶段转化、瓶颈标识、partial/data quality warning
- 解决痛点：数据暴露招聘卡点
- AI价值：AI可解释瓶颈原因并建议Action
- 真实数据：applications表聚合
- 下一步：进入Action Center
- 空态解释：数据不足时显示partial，不伪造完整漏斗

## Step 4: Action Center
- 页面：/actions
- 点击路径：导航"行动中心"
- CEO看到：行动项列表、状态、优先级、负责人
- 解决痛点：风险变成可处理事项
- AI价值：AI生成Action草稿，人工确认后创建
- 真实数据：action_items表
- 下一步：进入Job Detail
- 空态解释：无Action时显示诚实空态

## Step 5: Job Detail
- 页面：/jobs → 点击岗位名
- 点击路径：岗位中心 → 点击"场控"
- CEO看到：JD原文、职责、任职要求、source_file/source_sheet/source_row
- 解决痛点：岗位分析基于真实JD，不是假数据
- AI价值：AI可基于JD生成面试题建议
- 真实数据：理然JD库.xlsx导入
- 下一步：进入Knowledge
- 空态解释：每个岗位都有真实JD原文

## Step 6: Knowledge
- 页面：/knowledge
- 点击路径：导航"知识库"
- CEO看到：知识检索结果、JD/SOP chunk、引用来源
- 解决痛点：AI的上下文来自公司真实资料
- AI价值：知识检索支撑Copilot回答
- 真实数据：knowledge_chunks（JD+SOP）
- 下一步：回到Copilot追问
- 空态解释：搜索无结果时显示"未找到匹配内容"
