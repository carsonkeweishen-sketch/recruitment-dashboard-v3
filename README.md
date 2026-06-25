# Recruitment Dashboard v3

智能招聘 AI 看板 — 招聘效率管理系统

## 状态

**Phase 0 — 工程底座** 🚧

## 技术栈

- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS 4
- Prisma 7 + PostgreSQL
- pnpm

## 快速开始

```bash
pnpm install
cp .env.example .env
# 编辑 .env 配置 DATABASE_URL
pnpm db:migrate
pnpm dev
```

## Phase 路线

| Phase | 名称 | 状态 |
|-------|------|------|
| 0 | 工程底座 | 🚧 进行中 |
| 1 | 权限与角色 | ⏳ |
| 2 | 核心数据模型 | ⏳ |
| 3 | 岗位管理 | ⏳ |
| 4 | 候选人链路 | ⏳ |
| 5 | 筛选反馈 | ⏳ |
| 6 | 面试反馈 | ⏳ |
| 7 | 协同 Action | ⏳ |
| 8 | 数据导入 | ⏳ |
| 9 | Offer 风险 | ⏳ |
| 10 | AI 分析 | ⏳ |
| 11 | 周报复盘 | ⏳ |
| 12 | Design System | ⏳ |
| 13 | 面试官赋能 | ⏳ |

## 系统边界

- ✅ 招聘效率分析、漏斗诊断、候选人管理
- ✅ 面试质量评估、Offer 风险提醒
- ✅ AI 辅助分析（不自动决策）
- ❌ 不替代 Moka / ATS
- ❌ 不发 Offer / 不做审批
