# Phase 5.2.1 — Security Hardening Before Phase 6

## 1. Branch & HEAD

- **Branch:** agent/workbuddy/phase-5
- **Based on:** Phase 5.2 commit cf78e5d

## 2. P0 Fixes Summary

| P0 | Issue | Fix | Evidence |
|----|-------|-----|----------|
| P0-1 | 500 error on expected permission/validation failures | Error status mapping: "access denied"→404, "does not belong"→400, "Permission denied"→403 | 3 non-500 tests pass |
| P0-2 | Unscoped detail queries in API/service | All 5 getXxxById() marked @internal; API routes use WithScope variants | grep audit: 0 unscoped calls |
| P0-3 | business_owner only businessOwnerId | Confirmed: ownership-check.ts checks businessOwnerId only | Runtime tests pass |
| P0-4 | recruiter OWNED scope = application.ownerId/job.ownerId | Confirmed: candidate-repository OWNED uses ownerId | Runtime tests pass |
| P0-5 | Candidate detail applications secondary scope | filterApplicationsByScope() in API route | admin=1, recruiter=1, interviewer=1 |

## 3. Non-500 Error Status Verification

| Test | Before (5.2) | After (5.2.1) |
|------|-------------|---------------|
| feedback-summary unauthorized | 500 | **404** |
| mismatched applicationId | 500 | **400** |
| invalid sourceFeedbackId | 500 | **404** |

## 4. Unscoped Function Audit

All 5 `getXxxById()` functions now marked `@internal`:
- `getJobById()` — @internal
- `getCandidateById()` — @internal
- `getApplicationById()` — @internal
- `getFeedbackById()` — @internal
- `getCalibrationById()` — @internal

API routes exclusively use `getXxxByIdWithScope()` variants.

## 5. SecurityAuditLog Strategy (P1)

**方案 B:** 当前暂无独立 SecurityAuditLog。
- 权限失败不写业务 ActivityLog
- Phase 8 安全治理技术债

## 6. Changed Files (9)

```
app/api/business-feedback/route.ts — error status mapping
app/api/jobs/[id]/feedback-summary/route.ts — error status mapping
app/api/jobs/[id]/profile-calibrations/route.ts — error status mapping
app/api/profile-calibrations/[id]/route.ts — error status mapping
app/api/candidates/[id]/route.ts — applications secondary scope filter
server/repositories/job-repository.ts — @internal marker
server/repositories/candidate-repository.ts — @internal marker
server/repositories/application-repository.ts — @internal marker
server/repositories/business-feedback/business-feedback-repository.ts — @internal marker
server/repositories/business-feedback/profile-calibration-repository.ts — @internal marker
```

## 7. Build Verification

| Check | Result |
|-------|--------|
| typecheck | 0 errors |
| lint | 0 errors, 0 warnings |
| build | PASS |

## 8. Real Data Naming

- Demo seed (`prisma/seed.ts`) contains role-based names (王招聘/赵业务 etc.) for dev/test
- Business pages display names from DB (candidate.name, interviewer.name, job.title)
- No hardcoded fake names in app/components/server
- Real internal data planned for `prisma/seed.internal.ts` (gitignored)

## Final Conclusion

| Item | Status |
|------|--------|
| Phase 5.2.1 是否完成 | 是 |
| 是否仍有无 scope detail 查询 | 否（已标记 @internal，API 使用 WithScope） |
| 预期内权限/校验失败是否已避免 500 | 是 |
| business_owner 是否只基于 businessOwnerId | 是 |
| recruiter OWNED scope 是否明确 | 是 |
| candidate detail applications include 是否二次 scope | 是 |
| SecurityAuditLog 策略是否明确 | 是 |
| runtime API evidence 是否完整 | 是 |
| 是否建议进入 Phase 6 | 等待外部审查 |
| 是否自行进入 Phase 6 | 否 |
| 当前风险 | SecurityAuditLog 待 Phase 8 实施 |
| 需要外部确认 | 1) 400/403/404 状态码策略 2) @internal 标记方案 3) applications 二次过滤逻辑 |
