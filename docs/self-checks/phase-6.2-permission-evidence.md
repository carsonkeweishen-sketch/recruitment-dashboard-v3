# Phase 6.2 — Permission Evidence

---

## Permission Matrix: interviews resource

| 角色 | list | detail | submit feedback | quality-summary | 无权限返回 |
|------|------|--------|-----------------|-----------------|-----------|
| admin | ALL | ALL | 否 | 全部 | N/A |
| leader | ALL | ALL | 否 | 全部 | N/A |
| hrbp | DEPARTMENT | DEPARTMENT | 否 | 本部门 | 404 |
| recruiter | OWNED | OWNED | 否 | 不可访问 | 403 |
| business_owner | RELATED | RELATED | 否 | 不可访问 | 403 |
| interviewer | RELATED (own only) | RELATED (own only) | 仅自己的面试 | 仅自己 | 404 |

## Interviewer scope evidence

- interviewer (孙面试官) GET /api/interviews → 3 interviews (own) ✅
- interviewer GET /api/interviews/:id (own) → 200 ✅
- interviewer GET /api/interviews/:id (unrelated) → 404 ✅
- interviewer POST feedback (own) → 201 ✅
- interviewer POST feedback (unrelated interview's interviewer) → N/A (only own interviews visible)

## Business owner scope evidence

- business_owner (赵业务) GET /api/interviews → scope-filtered ✅
- business_owner GET quality-summary → 403 ✅
- business_owner does NOT access via ownerId ✅

## Recruiter scope evidence

- recruiter (王招聘) GET /api/interviews → scope-filtered ✅
- recruiter POST feedback → 403 (not interviewer role) ✅
- recruiter GET quality-summary → 403 ✅

## Code-level permission enforcement

- server/permissions/matrix.ts: interviews:interviewer → [view, create]
- server/services/interview/interview-feedback-service.ts: role !== "interviewer" → 403
- server/permissions/scope-guards.ts: guardInterviewerWriteScope
- All detail queries use findFirst + scope WHERE (ZERO findUnique)
