# Phase 7.4A Screenshot Index

| # | 文件名 | 页面状态 | 环境 | 角色 | URL | API 数据来源 | HTTP | 真实图片 | Mock | 通过 |
|---|--------|---------|------|------|-----|-------------|------|---------|------|------|
| 1 | actions-page-success.png | Success | sandbox | admin | /actions | GET /api/actions | 200 | ✅ PNG | 否 | ✅ |
| 2 | actions-kpi-cards.png | KPI Cards | sandbox | admin | /actions | response.metrics | 200 | ✅ PNG | 否 | ✅ |
| 3 | actions-filters.png | Filters Active | sandbox | admin | /actions?priority=high | API query params | 200 | ✅ PNG | 否 | ✅ |
| 4 | actions-list-density.png | List Density | sandbox | admin | /actions | GET /api/actions | 200 | ✅ PNG | 否 | ✅ |
| 5 | loading-state.png | Loading | sandbox | admin | /actions (commit) | — | — | ✅ PNG | 否 | ✅ |
| 6 | actions-page-empty.png | Empty | sandbox | admin | /actions?status=dismissed | API query (empty result) | 200 | ✅ PNG | 否 | ✅ |
| 7 | actions-page-error.png | Error | sandbox | admin | /actions (route aborted) | Network error | — | ✅ PNG | 否 | ✅ |
| 8 | actions-page-permission-denied.png | Permission | sandbox | interviewer | /actions | GET /api/actions (scope empty/denied) | 403/200 empty | ✅ PNG | 否 | ✅ |

## 截图数据来源说明

- T1-T4 (success/KPI/filters/list): 真实 GET /api/actions 返回的 admin scope 数据
- T6 (empty): 筛选 status=dismissed 触发空结果（无已忽略的 action）
- T7 (error): Playwright route.abort() 模拟网络错误触发 ErrorState
- T8 (permission): interviewer 角色访问 /actions，scope 内无匹配 action 或 API 返回 403
- 所有截图均为真实 PNG 文件，非 TXT，非 mock 数据
