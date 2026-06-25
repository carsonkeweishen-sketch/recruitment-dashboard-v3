# 08｜Phase 0 WorkBuddy 执行任务书

## 当前任务

启动 Recruitment Dashboard v2 的 Phase 0：工程底座与持久化机制。

本阶段只做工程底座，不做业务模块。

---

## 1. 项目名称

```text
recruitment-dashboard-v2
```

---

## 2. 技术栈

必须使用：Next.js App Router、TypeScript、Tailwind CSS、Prisma、PostgreSQL、pnpm、Git。

---

## 3. 允许做的事情

1. 初始化 Next.js 项目；
2. 配置 TypeScript；
3. 配置 Tailwind；
4. 配置 Prisma；
5. 建立 PostgreSQL 连接配置；
6. 新增 `.env.example`；
7. 新增 AppShell；
8. 新增 Sidebar；
9. 新增 Topbar；
10. 新增 Design Token；
11. 新增基础 UI 组件；
12. 新增 `/api/health`；
13. 新增 README；
14. 新增 docs 初始目录；
15. 设置 package scripts；
16. git 初始化；
17. 首次 commit；
18. 输出自检报告。

---

## 4. 禁止做的事情

1. 不做真实业务页面；
2. 不做 Jobs；
3. 不做 Candidates；
4. 不做 Applications；
5. 不做 Interviews；
6. 不做 Actions；
7. 不做 Imports；
8. 不做 Offer Risks；
9. 不做 Reports；
10. 不做 AI；
11. 不做面试官赋能；
12. 不改旧项目；
13. 不依赖旧 workspace；
14. 不提交 `.env`；
15. 不提交 API Key；
16. 不提交真实候选人数据；
17. 不一次性进入 Phase 1。

---

## 5. 推荐目录

```text
app/
  layout.tsx
  page.tsx
  api/
    health/
      route.ts

components/
  layout/
    AppShell.tsx
    Sidebar.tsx
    Topbar.tsx

  ui/
    MetricCard.tsx
    SectionCard.tsx
    StatusBadge.tsx
    DataTable.tsx
    DetailDrawer.tsx
    FormModal.tsx
    EmptyState.tsx
    ErrorState.tsx
    LoadingSkeleton.tsx
    PermissionDenied.tsx

server/
  auth/
  permissions/
  services/

prisma/
  schema.prisma
  seed.ts

docs/
  SETUP.md
  ARCHITECTURE.md
  ROLE_PERMISSIONS.md
  MOKA_BOUNDARY.md
  UI_GUIDELINES.md
```

---

## 6. 首页要求

`/` 首页只展示：产品名称、当前阶段 Phase 0、技术栈、系统边界、后续 Phase 规划摘要、当前角色切换入口。

不要出现业务假数据。

---

## 7. Design Token

在 `app/globals.css` 建立：primary、primary-hover、primary-light、surface、surface-secondary、surface-tertiary、border、border-strong、text-primary、text-secondary、text-tertiary、success、success-light、warning、warning-light、danger、danger-light。

---

## 8. package scripts

必须包含：

```json
{
  "dev": "next dev",
  "build": "next build",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "db:migrate": "prisma migrate dev",
  "db:seed": "prisma db seed",
  "db:reset": "prisma migrate reset"
}
```

---

## 9. 验收命令

必须执行：

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
git status
git log --oneline -1
```

---

## 10. 自检报告

完成后输出：目录结构、修改文件、新增文件、技术栈、AppShell 截图、Sidebar 截图、Topbar 截图、首页截图、Design Token 清单、`.env.example` 内容、install/typecheck/lint/build 结果、git status、commit hash、是否存在 mock、是否存在敏感信息、是否替代 Moka、是否建议进入 Phase 1。

不要自行进入 Phase 1。
