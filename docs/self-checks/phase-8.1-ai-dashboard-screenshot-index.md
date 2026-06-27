# Phase 8.1B AI Dashboard — Screenshot Index

> 日期：2026-06-27 | 分支：agent/workbuddy/phase-7 | Mock：否

## 截图分类

### State Screenshots（状态截图）

| # | 文件名 | 类型 | 验证内容 |
|---|--------|------|---------|
| S1 | ai-dashboard-empty-state-real.png | Empty State | /dashboard 路由，显示"暂无足够招聘数据生成洞察" |
| S2 | ai-dashboard-loading-skeleton-real.png | Loading Skeleton | KPI+Insight+Risk+Job+Candidate+Activity 骨架屏 |
| S3 | ai-dashboard-error-state-real.png | Error State | "招聘洞察加载失败"+重试，无技术泄露 |
| S4 | ai-dashboard-partial-data-state-real.png | Partial Data | 部分 KPI 正常显示，非错误态 |

### Section Close-up Screenshots（局部验收截图）

| # | 文件名 | 类型 | 验证内容 |
|---|--------|------|---------|
| C1 | risk-radar-panel-readable.png | Section Close-up | 风险维度+风险等级+Action数+逾期数 |
| C2 | job-health-snapshot-readable.png | Section Close-up | 岗位名称+健康状态+未关闭Action+逾期Action |
| C3 | candidate-risk-snapshot-readable.png | Section Close-up | 候选人名+目标岗位+当前阶段+风险标签 |
| C4 | recent-activity-readable.png | Section Close-up | 人话化主文案（非 ACTION_CREATED） |
| C5 | ai-provenance-system-rule-readable.png | Section Close-up | 生成方式+触发条件+证据数量+更新时间 |
| C6 | priority-actions-to-action-center-readable.png | Section Close-up | 行动项标题+优先级+状态+逾期标记+入口 |

### Permission Screenshots（权限截图）

| # | 文件名 | 类型 | 验证内容 |
|---|--------|------|---------|
| P1 | ai-dashboard-permission-denied.png | Permission | Interviewer 403 |
| P2 | ai-dashboard-recruiter-scoped.png | Permission | Recruiter scoped 视图 |

### API Evidence（API 证据）

详见 `docs/self-checks/phase-8.1-ai-dashboard-api-evidence.md`

### Permission Evidence（权限证据）

详见 `docs/self-checks/phase-8.1-ai-dashboard-permission-evidence.md`
