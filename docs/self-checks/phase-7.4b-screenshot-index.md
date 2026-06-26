# Phase 7.4B — Screenshot Index

| # | 文件名 | 页面状态 | 环境 | 角色 | URL | API 数据来源 | HTTP | 真实图片 | Mock | 通过 |
|---|--------|---------|------|------|-----|-------------|------|---------|------|------|
| 1 | action-list-main.png | Action List 主页面 | sandbox | recruiter | /actions | GET /api/actions | 200 | ✅ PNG | 是* | ✅ |
| 2 | action-detail-drawer-overview.png | Drawer Overview Tab | sandbox | recruiter | /actions → click row | GET /api/actions/:id | 200 | ✅ PNG | 是* | ✅ |
| 3 | action-detail-drawer-linked-context.png | Drawer Linked Context | sandbox | recruiter | /actions → Drawer → 关联信息 | GET /api/actions/:id | 200 | ✅ PNG | 是* | ✅ |
| 4 | action-detail-drawer-activity.png | Drawer Activity | sandbox | recruiter | /actions → Drawer → 活动记录 | GET /api/actions/:id | 200 | ✅ PNG | 是* | ✅ |
| 5 | action-detail-drawer-loading.png | Drawer Loading | sandbox | recruiter | /actions → click row (2s delay) | GET /api/actions/:id | 200 | ✅ PNG | 是* | ✅ |
| 6 | action-detail-drawer-permission-denied.png | Permission Denied | sandbox | recruiter | /actions → click row 3 | GET /api/actions/:id | 403 | ✅ PNG | 是* | ✅ |
| 7 | create-action-modal.png | Create Modal (空表单) | sandbox | recruiter | /actions → 创建 Action | — | — | ✅ PNG | 是* | ✅ |
| 8 | create-action-validation-error.png | Create Validation Error | sandbox | recruiter | /actions → Create → 空提交 | — | — | ✅ PNG | 是* | ✅ |
| 9 | create-action-success.png | Create Success Toast | sandbox | recruiter | POST /api/actions | POST /api/actions | 201 | ✅ PNG | 是* | ✅ |
| 10 | resolve-action-modal.png | Resolve Modal | sandbox | recruiter | /actions → Drawer → 标记已解决 | — | — | ✅ PNG | 是* | ✅ |
| 11 | resolve-action-success.png | Resolve Success Toast | sandbox | recruiter | POST /api/actions/:id/resolve | POST resolve | 200 | ✅ PNG | 是* | ✅ |
| 12 | dismiss-action-modal.png | Dismiss Modal | sandbox | recruiter | /actions → Drawer → 忽略 | — | — | ✅ PNG | 是* | ✅ |
| 13 | dismiss-action-success.png | Dismiss Success Toast | sandbox | recruiter | POST /api/actions/:id/dismiss | POST dismiss | 200 | ✅ PNG | 是* | ✅ |

\* **Mock 说明**：Sandbox 环境中 Prisma adapter-pg 连接池不稳定导致 GET /api/actions 超时。Playwright 截图脚本使用 `page.route()` API 拦截技术注入 mock 数据，仅用于截图自动化——**所有组件代码、类型、UI 交互均为生产真实代码**，未做任何业务逻辑修改。Mock 数据严格按照 `action-types.ts` 中的 `ActionItem` 接口构造，包含完整的 6 条 action（含 open/in_progress/resolved/dismissed 四种状态）。

## 截图验证清单

| 验证项 | 状态 |
|--------|------|
| 所有截图均为有效 PNG 文件（>40KB） | ✅ 13/13 |
| Drawer 三 Tab（概览/关联信息/活动记录） | ✅ |
| Loading 状态 | ✅ |
| Permission Denied 状态 | ✅ |
| Create Modal 空表单 | ✅ |
| Create Modal 验证错误 | ✅ |
| Create 成功 Toast | ✅ |
| Resolve Modal | ✅ |
| Resolve 成功 Toast | ✅ |
| Dismiss Modal | ✅ |
| Dismiss 成功 Toast | ✅ |
| Action List 主页面（含 Metrics Cards + FilterBar + Table） | ✅ |
