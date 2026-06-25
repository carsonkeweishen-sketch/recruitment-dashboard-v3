# Moka 系统边界

> 本文档明确 Recruitment Dashboard v2 与 Moka ATS 的边界关系。

## 核心原则

Recruitment Dashboard v2 **不替代** Moka，**不强绑定** Moka API。

## Moka 负责（我们不做的）

- 候选人简历库主存储
- Offer 审批流程
- 薪酬审批流程
- 入职办理流程
- 劳动合同管理
- 候选人状态自动推进
- 自动淘汰规则
- 自动录用

## 本系统负责

- 招聘漏斗分析与可视化
- 岗位画像校准
- 面试质量评估（结构化面评）
- Offer 风险提醒（不审批）
- 协同 Action 任务
- AI 辅助分析（不自动决策）
- 周报复盘
- 面试官赋能

## 数据关系

- 可以从 Moka 导出数据后导入本系统（Phase 8）
- 不实时同步 Moka 数据
- 不在本系统修改 Moka 数据
- 不通过 Moka API 写入

## 开源安全

- 不提交 Moka API Key
- 不提交 Moka 客户信息
- 不提交真实企业数据
- 示例数据均为虚构
