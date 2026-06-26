# Phase 5.2.2 — Object Scope Hardening Final

## 1. Branch & HEAD

- **Branch:** agent/workbuddy/phase-5
- **Based on:** Phase 5.2.1 commit e7e122b

## 2. Changes Summary

### Fix 1: Delete Service Fallbacks (P0)

All 5 service detail functions now require `role: Role, userId: string` — no optional fallback to unscoped queries:

| Service | Before | After |
|---------|--------|-------|
| getCandidateDetail | `role?, userId?` → fallback to unscoped | `role, userId` → always scoped |
| getApplicationDetail | `role?, userId?` → fallback | `role, userId` → always scoped |
| getFeedback | `role?, userId?` → fallback | `role, userId` → always scoped |
| getJobDetail | `role?, userId?` → fallback | `role, userId` → always scoped |
| confirmCalibrationAction | called unscoped getCalibrationById | removed call, relies on ownership check |

**grep audit: ZERO unscoped calls in app/api + server/services** ✅

### Fix 2: business_owner Only businessOwnerId (P0)

Removed all `OR: [{ownerId}, {businessOwnerId}]` from RELATED scope in repositories:

| Repository | Scope | Before | After |
|-----------|-------|--------|-------|
| job-repository | RELATED list | OR: [ownerId, businessOwnerId] | businessOwnerId only |
| job-repository | RELATED detail | OR: [ownerId, businessOwnerId] | businessOwnerId only |
| candidate-repository | RELATED list | OR: [ownerId, job.businessOwnerId] | job.businessOwnerId only |
| candidate-repository | RELATED detail | OR: [ownerId, job.businessOwnerId] | job.businessOwnerId only |
| application-repository | RELATED list | OR: [ownerId, job.businessOwnerId] | job.businessOwnerId only |
| application-repository | RELATED detail | OR: [ownerId, job.businessOwnerId] | job.businessOwnerId only |
| job-repository | OWNED detail | OR: [ownerId, businessOwnerId] | ownerId only |

**grep audit: ZERO OR patterns in repository scope conditions** ✅

### Fix 3: Candidate Detail Applications — Repository-Level where Filter (P0)

Removed `filterApplicationsByScope()` JS filter with `|| true` bug.
Replaced with Prisma `include.applications.where` in `getCandidateByIdWithScope()`.

Multi-application verification (林可, 2 apps):

| Role | DB apps | Returned | Filter |
|------|---------|----------|--------|
| admin | 2 | 2 | ALL |
| recruiter | 2 | 2 | ownerId=王招聘 |
| business_owner | 2 | **1** | businessOwnerId=赵业务 (品牌策划 filtered out) |
| interviewer | 2 | **404** | No interview assignment |

## 3. Permission Status Codes

All expected failures return 400/403/404, not 500.

## 4. Build Verification

| Check | Result |
|-------|--------|
| typecheck | 0 errors |
| lint | 0 errors, 0 warnings |
| build | PASS |

## 5. Changed Files (11)

```
app/api/applications/[id]/route.ts — userId guard + always scoped
app/api/business-feedback/[id]/route.ts — userId guard
app/api/candidates/[id]/route.ts — removed JS filter, uses repo-level where
app/api/jobs/[id]/route.ts — userId guard
server/repositories/candidate-repository.ts — include.where + businessOwnerId only
server/repositories/application-repository.ts — businessOwnerId only (list + detail)
server/repositories/job-repository.ts — businessOwnerId/ownerId only
server/services/candidates/candidate-service.ts — removed fallback
server/services/applications/application-service.ts — removed fallback
server/services/business-feedback/business-feedback-service.ts — removed fallback
server/services/business-feedback/profile-calibration-service.ts — removed unscoped call
server/services/jobs/job-service.ts — removed fallback
```

## Final Conclusion

| Item | Status |
|------|--------|
| Phase 5.2.2 是否完成 | 是 |
| Service fallback 是否已删除 | 是 |
| business_owner 是否仅 businessOwnerId | 是 |
| recruiter OWNED scope 是否收口到 ownerId | 是 |
| Candidate detail applications 是否 repo-level where 过滤 | 是 |
| 多 application 数据是否验证二次过滤 | 是 |
| Unscoped calls grep 是否 ZERO | 是 |
| OR patterns grep 是否 ZERO | 是 |
| 是否建议进入 Phase 6 | 等待外部审查 |
| 是否自行进入 Phase 6 | 否 |
| 当前风险 | SecurityAuditLog 待 Phase 8 |
| 需要外部确认 | 1) ZERO unscoped calls 2) ZERO OR patterns 3) multi-app filtering 4) error status codes |
