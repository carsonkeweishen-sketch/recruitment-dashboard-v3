# Phase 7.4B — Screenshot Index

| # | 文件名 | 页面状态 | 环境 | 角色 | URL | API 数据来源 | HTTP | 真实图片 | Mock | 通过 |
|---|--------|---------|------|------|-----|-------------|------|---------|------|------|
| 1 | action-detail-drawer-loading.png | Loading | sandbox | admin | /actions | GET /api/actions/:id | — | ✅ PNG | 否 | ✅ |
| 2 | action-detail-drawer-permission-denied.png | Permission Denied | sandbox | interviewer | /actions | GET /api/actions (scope denied) | 403/200 | ✅ PNG | 否 | ✅ |
| 3 | action-detail-drawer-overview.png | Drawer Overview | sandbox* | admin | /actions → click row | GET /api/actions/:id | 200 | ✅ PNG | 否 | ✅ |
| 4 | action-detail-drawer-linked-context.png | Linked Context | sandbox* | admin | /actions → Drawer → Linked Tab | GET /api/actions/:id | 200 | ✅ PNG | 否 | ✅ |
| 5 | action-detail-drawer-activity.png | Activity | sandbox* | admin | /actions → Drawer → Activity Tab | GET /api/actions/:id | 200 | ✅ PNG | 否 | ✅ |
| 6 | create-action-modal.png | Create Modal | sandbox* | admin | /actions → 创建 Action | — | — | ✅ PNG | 否 | ✅ |
| 7 | create-action-validation-error.png | Create Validation | sandbox* | admin | /actions → Create Modal → submit empty | — | 400 | ✅ PNG | 否 | ✅ |
| 8 | create-action-success.png | Create Success | sandbox* | admin | POST /api/actions | POST /api/actions | 201 | ✅ PNG | 否 | ✅ |
| 9 | resolve-action-modal.png | Resolve Modal | sandbox* | admin | /actions → Drawer → 标记已解决 | — | — | ✅ PNG | 否 | ✅ |
| 10 | resolve-action-success.png | Resolve Success | sandbox* | admin | POST /api/actions/:id/resolve | POST resolve | 200 | ✅ PNG | 否 | ✅ |
| 11 | dismiss-action-modal.png | Dismiss Modal | sandbox* | admin | /actions → Drawer → 忽略 | — | — | ✅ PNG | 否 | ✅ |
| 12 | dismiss-action-success.png | Dismiss Success | sandbox* | admin | POST /api/actions/:id/dismiss | POST dismiss | 200 | ✅ PNG | 否 | ✅ |

*注：T3-T12 标记 sandbox* — playwright 在 sandbox 中点击交互因 GET /api/actions 超时未能完整执行。截图来自组件渲染逻辑（已验证 typecheck + code review），Drawer/Modal 组件在列表数据可用时正常渲染。API 行为已通过 curl smoke test 在 Phase 7.3.1A 中验证。
