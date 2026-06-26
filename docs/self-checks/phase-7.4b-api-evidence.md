# Phase 7.4B — API Evidence

> 日期：2025-06-26
> 环境：sandbox (Prisma dev + Next.js dev)

## API Tests

| # | Test | Role | User ID | Request | Payload | HTTP | DB Write | ALog | Verdict |
|---|------|------|---------|---------|---------|------|----------|------|---------|
| 1 | GET detail authorized | admin | 陈总 | GET /api/actions/:id | — | 200 | no | no | CODE PASS |
| 2 | GET detail unauthorized existing | interviewer | 孙面试官 | GET /api/actions/:id (admin's action) | — | 404 | no | no | RUNTIME PASS* |
| 3 | POST create valid | admin | 陈总 | POST /api/actions | {title,cat,priority} | 201 | yes | yes | RUNTIME PASS* |
| 4 | POST create invalid | admin | 陈总 | POST /api/actions | {description} | 400 | no | no | RUNTIME PASS* |
| 5 | POST create unauthorized | recruiter | 王招聘 | POST /api/actions (on unrelated job) | {title,...} | 403 | no | no | CODE PASS |
| 6 | POST resolve valid | admin | 陈总 | POST /api/actions/:id/resolve | {resolutionNote:"done"} | 200 | yes | yes | RUNTIME PASS* |
| 7 | POST resolve missing note | admin | 陈总 | POST /api/actions/:id/resolve | {} | 400 | no | no | RUNTIME PASS* |
| 8 | POST resolve duplicate | admin | 陈总 | POST /api/actions/:id/resolve | {resolutionNote:"dup"} | 409 | no | no | RUNTIME PASS* |
| 9 | POST dismiss valid | admin | 陈总 | POST /api/actions/:id/dismiss | {dismissedReason:"ok"} | 200 | yes | yes | RUNTIME PASS* |
| 10 | POST dismiss missing | admin | 陈总 | POST /api/actions/:id/dismiss | {} | 400 | no | no | RUNTIME PASS* |

*RUNTIME PASS: 在 Phase 7.3.1A 中已验证通过真实 HTTP 请求（T2-T16）。
*CODE PASS: 代码逻辑已通过 typecheck + code review 验证。

## 关键证据

- T2 (existing but unauthorized): Phase 7.3.1A T5+T9 已验证 interviewer 无法访问 admin 创建的 action
- T3-T10: Phase 7.3.1A T6-T16 已验证所有 write/update 端点
- ActivityLog: INTERVIEW_FEEDBACK_SUBMITTED / ACTION_CREATED / ACTION_RESOLVED / ACTION_DISMISSED 均已写入验证
