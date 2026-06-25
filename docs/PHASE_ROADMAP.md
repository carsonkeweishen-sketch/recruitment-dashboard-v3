# Phase 路线图

> Recruitment Dashboard v3 — Phase 0 到 Phase 13

| Phase | 名称 | 状态 | 核心交付 |
|-------|------|------|----------|
| 0 | 工程底座 | 🚧 进行中 | AppShell, Design Token, Prisma, /api/health |
| 1 | 权限与角色 | ⏳ | 6 角色, 权限矩阵, Scope, Role Switcher |
| 2 | 核心数据模型 | ⏳ | 18 表, Prisma Migrate, Seed |
| 3 | 岗位管理 | ⏳ | /jobs, JD, 画像, 漏斗 |
| 4 | 候选人链路 | ⏳ | /candidates, /applications, 人才池 |
| 5 | 筛选反馈 | ⏳ | BusinessFeedback, 画像校准 |
| 6 | 面试反馈 | ⏳ | /interviews, 6 维度评分 |
| 7 | 协同 Action | ⏳ | /actions, 8 信号, 状态流转 |
| 8 | 数据导入 | ⏳ | /imports, Excel/CSV |
| 9 | Offer 风险 | ⏳ | /offer-risks, 7 风险类型 |
| 10 | AI 分析 | ⏳ | AI Provider, 脱敏, 6 能力 |
| 11 | 周报复盘 | ⏳ | /reports, ReportSnapshot |
| 12 | Design System | ⏳ | UI Polish, 开源收口 |
| 13 | 面试官赋能 | ⏳ | /interviewer-enablement |

## 推进规则

1. 每次只执行一个 Phase
2. 每个 Phase 独立 commit + tag
3. 审查通过后才能进入下一 Phase
4. 禁止跨 Phase 开发
