# Phase 8.14A Demo Path

## Step 1: Dashboard
- 截图: 01-dashboard-hero.png
- CEO看到: 100真实岗位、0候选人（诚实空态）、AI入口
- 解决痛点: 管理层30秒判断招聘健康度
- AI价值: 系统规则提醒 + AI辅助建议入口
- 真实数据: jobs表100条
- 下一步: 点AI助手按钮

## Step 2: AI Copilot
- 截图: 02,03,04,05,06
- CEO看到: Copilot Panel、上下文来源、AI回答带引用、Human Review、No Evidence短路
- 解决痛点: AI不是外挂，基于真实JD/SOP context回答
- AI价值: provider/model/citation/Human Review/Draft Action全链路
- 真实数据: contextRefs来自jobs/knowledge_chunks
- 下一步: 进入Funnel

## Step 3: Funnel
- 截图: 07,08,09
- CEO看到: 漏斗阶段、瓶颈标识、partial状态
- 解决痛点: 数据暴露招聘卡点
- AI价值: AI可解释瓶颈原因并建议Action
- 真实数据: applications表聚合
- 下一步: 进入Action Center

## Step 4: Action Center
- 截图: 10,11
- CEO看到: Action列表、详情Drawer、状态/优先级/负责人
- 解决痛点: 风险变成可处理事项
- AI价值: AI生成Action草稿，人工确认后创建
- 真实数据: action_items表
- 下一步: 进入Job Detail

## Step 5: Job Detail
- 截图: 12,13,14,15
- CEO看到: JD原文、职责、source_file/source_sheet/source_row
- 解决痛点: 岗位分析基于真实JD
- 真实数据: 理然JD库.xlsx
- 下一步: 进入Knowledge

## Step 6: Knowledge
- 截图: 16,17,18
- CEO看到: 知识检索结果、JD/SOP chunk、引用来源、DataSource文件
- 解决痛点: AI上下文来自公司真实资料
- 真实数据: knowledge_chunks + data_sources
