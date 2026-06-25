# Recruitment Dashboard v3 — 项目长期记忆

> 本文档用于跨对话上下文恢复。每次重大决策变更后更新。

---

## 1. 系统定位

**智能招聘 AI 看板** — 辅助招聘决策的效率 SaaS 工具。

### 做什么
- 招聘效率分析、岗位卡点诊断、候选人全链路管理
- 面试质量分析、Offer 风险提醒、协同 Action
- AI 辅助判断、周报复盘、人才池沉淀、面试官赋能

### 不做什么
- 不替代 Moka / ATS
- 不发 Offer、不做 Offer/薪酬审批
- 不做合同、入职办理
- 不自动录用、不自动淘汰、不自动推进候选人阶段
- 不自动关闭岗位
- 不做 AI 自动决策

---

## 2. 技术栈（已决策）

| 层级 | 选择 | 备注 |
|------|------|------|
| 前端框架 | Next.js 14 (App Router) | 全栈 TypeScript |
| ORM | Prisma | 类型安全，迁移管理 |
| 数据库 | Supabase PostgreSQL | 已连接 supabase connector |
| 包管理 | pnpm + Turborepo | Monorepo |
| 认证 | NextAuth.js / Auth.js | 多 provider |
| UI | Tailwind CSS + shadcn/ui | 开源友好 |
| Git 托管 | GitHub | gh CLI |

---

## 3. Phase 规划（共 14 个 Phase）

| Phase | 名称 | 状态 |
|-------|------|------|
| 0 | 工程底座与持久化机制 | 🔜 待启动 |
| 1 | 权限、角色与系统边界 | ⏳ |
| 2 | 核心数据模型与 Seed | ⏳ |
| 3 | 岗位管理与 JD / 画像体系 | ⏳ |
| 4 | 候选人与投递链路 | ⏳ |
| 5 | 业务筛选反馈与岗位画像校准 | ⏳ |
| 6 | 面试反馈与结构化面评 | ⏳ |
| 7 | 协同 Action 任务中心 | ⏳ |
| 8 | 数据导入与历史数据接入 | ⏳ |
| 9 | Offer 风险与入职前承接 | ⏳ |
| 10 | AI 辅助分析系统 | ⏳ |
| 11 | 招聘复盘与周报 | ⏳ |
| 12 | Design System、UI Polish 与开源化收口 | ⏳ |
| 13 | 面试官赋能中心 | ⏳ |

---

## 4. 开发铁律

1. 每次只执行一个 Phase
2. 每个 Phase 必须 commit
3. 每个 Phase 必须 build
4. 每个 Phase 必须输出自检报告
5. 每个 Phase 审查通过后才能进入下一 Phase
6. 代码必须存 Git 仓库
7. 禁止只存在 WorkBuddy workspace

---

## 5. Checkpoint 标准（每个 Phase 必须通过）

1. ✅ Code committed (`git commit -m "phase-N: <描述>"`)
2. ✅ Build success (`pnpm build`)
3. ✅ Typecheck success (`pnpm typecheck`)
4. ✅ Lint success (`pnpm lint`)
5. ✅ Tag created (`git tag phase-N`)

---

## 6. 自检报告模板（每个 Phase 必须输出）

1. 修改文件清单
2. 新增文件清单
3. 是否修改 API
4. 是否修改 Schema
5. 是否修改权限
6. 是否存在 mock 数据
7. 是否存在真实敏感数据
8. pnpm typecheck 结果
9. pnpm lint 结果
10. pnpm build 结果
11. git status
12. commit hash
13. 截图
14. 是否可以进入下一 Phase

---

## 7. 环境注意事项

- Node.js 需要通过 `NODE_OPTIONS=""` 清除无效 preload
- pnpm 路径: `/root/.nvm/versions/node/v22.13.1/bin/pnpm`
- GitHub CLI 需要认证

---

## 8. 项目结构（规划）

```
recruitment-dashboard/
├── apps/
│   └── web/                # Next.js 14 App Router
├── packages/
│   ├── database/           # Prisma schema + client
│   └── config/             # 共享 ESLint / TS / Tailwind 配置
├── MEMORY.md               # 本文档
└── README.md
```

---

*最后更新: Phase 0 启动前*
