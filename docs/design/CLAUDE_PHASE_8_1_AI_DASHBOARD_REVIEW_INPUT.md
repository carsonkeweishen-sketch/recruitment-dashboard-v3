# Claude Phase 8.1 AI Dashboard Review Input

> 日期：2026-06-27 | 分支：agent/workbuddy/phase-7

---

## 1. 页面结构

路由：`/dashboard`，导航名称：招聘总览

页面从上到下依次为：
1. **Page Header** — 标题"AI 招聘洞察看板" + 副标题（含 AI 边界说明）
2. **AI Health Summary** — 系统招聘洞察（规则生成文本摘要 + Provenance 展示）
3. **KPI Cards** — 8 个指标卡片网格
4. **Priority Risk Insights** — 5 类风险洞察卡片
5. **Risk Radar + Priority Actions** — 左右双栏
6. **Job Health Snapshot** — 岗位健康度卡片
7. **Candidate Risk Snapshot** — 候选人风险概览
8. **Recent Activity** — ActivityLog 驱动的最近动态

---

## 2. 各区块描述

### AI Health Summary
- 基于 Action/Feedback/Job 数据聚合生成文本摘要
- 展示：生成方式（系统规则提醒）、证据数量、更新时间
- 不接 OpenAI，不伪造 LLM

### KPI Cards
- 8 个指标：进行中岗位、活跃候选人、待处理行动项、逾期行动项、高优先级行动项、今日到期行动项、平均关闭时长、按时关闭率
- 前 6 个可点击跳转对应页面

### Priority Risk Insights
- 基于 Action 数据 + 系统规则生成
- 每条 Insight 包含：分类标签、严重度、摘要、证据列表、建议动作
- 全部 generatedBy: "system_rule"

### Risk Radar
- 按 Action category 分组展示风险维度
- 每行：风险名称 + 等级 Badge + 行动项数量 + 逾期数

### Priority Actions
- 按逾期/紧急/高/今日到期排序的 Top 5 行动项
- 每条可点击跳转 /actions

### Job Health Snapshot
- 3-5 张岗位卡片
- 每张：岗位名、健康等级（健康/关注/风险）、候选人、行动项

### Candidate Risk Snapshot
- 3-5 张候选人风险卡片
- 每张：候选人名、岗位、风险标签、行动项数

### Recent Activity
- 最近 5 条 ActivityLog
- 主文案人话化（"陈总 创建了行动项"）

---

## 3. AI 边界说明

- **当前不接 OpenAI**
- **不伪造 LLM 调用**
- **所有洞察来自系统规则提醒（System Intelligence）**
- **页面显性文案**："系统仅提供辅助洞察，不替代 HR 或业务做录用、淘汰和阶段推进决策"
- **禁止**：AI 决策 / AI 自动判断 / AI 自动淘汰 / AI 决定录用

---

## 4. System Intelligence 规则说明

Dashboard 使用的规则全部是确定性的 SQL/Prisma 查询，不涉及 LLM：

| 洞察类型 | 规则 | 数据来源 |
|---------|------|---------|
| 逾期行动项 | overdueActionCount > 0 | action_items WHERE status=open AND dueAt < now |
| 高优先级 | highPriorityActionCount > 0 | action_items WHERE priority IN (urgent,high) |
| 反馈待提交 | pendingFeedbackCount > 0 | interviews WHERE completed AND no feedbacks |
| 低质量反馈 | lowQualityFeedbackCount > 0 | interview_feedbacks WHERE qualityScore < 60 |
| 供给不足 | jobs with 0 candidates | jobs LEFT JOIN applications |

---

## 5. 不接 OpenAI 声明

Phase 8.1 AI 招聘洞察看板 v1 使用真实招聘数据 + 系统规则提醒生成可解释洞察，**不伪造大模型调用**。

AI Provenance 标准已建立（`docs/product/AI_OUTPUT_PROVENANCE_STANDARD.md`），真实 LLM 渲染核验将在 Phase 8.7 首次接入 LLM 时验收。

---

## 6. 需要 Claude 重点看的 UX 问题

1. **信息密度**：Dashboard 页面区块较多（8 个 section），是否存在信息过载？
2. **KPI 卡片可点击性**：4 个 Action 相关 KPI 已添加跳转，点击体验是否自然？
3. **风险色使用**：红色（danger）仅用于逾期/紧急项，黄色（warning）用于高优先级，是否过度使用？
4. **空状态文案**：Recruiter scoped empty 状态下的文案是否清晰？
5. **"只辅助不决策"边界**：文案位置是否足够显眼？用户能否一眼看到？
6. **Recent Activity 人话化**：ActivityLog 转人话文案是否自然？
7. **整体风格**：是否符合 Linear/Ashby/Stripe 的 SaaS 专业感？有没有传统后台感？

---

> 版本：v1.0 | 日期：2026-06-27
