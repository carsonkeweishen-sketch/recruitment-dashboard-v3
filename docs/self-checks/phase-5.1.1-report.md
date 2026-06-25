# Phase 5.1.1 — Business Owner Ownership Rule Confirmation

## 1. Branch & HEAD

- **Branch:** agent/workbuddy/phase-5
- **Based on:** Phase 5.1 commit bb06fe7

## 2. Field Semantics Clarification

| Field | Business Meaning | Seed Evidence |
|-------|-----------------|---------------|
| `Job.ownerId` | **招聘负责人** (HR/recruiter owner) | 所有 9 个 Job 的 ownerId = 王招聘 (recruiter) |
| `Job.businessOwnerId` | **业务负责人** (Business owner) | 赵业务/孙面试官/张HRBP 按业务线分布 |
| recruiter OWNED scope | 基于 `ownerId` 过滤 | `applications.some.ownerId === userId` |
| business_owner RELATED scope | 应仅基于 `businessOwnerId` | 赵业务 仅应对 KA/采购/OEM 有权限 |

## 3. Code Fix

**File:** `server/repositories/business-feedback/ownership-check.ts`

**Before (Phase 5.1):**
```typescript
if (job.businessOwnerId !== userId && job.ownerId !== userId) {
```

**After (Phase 5.1.1):**
```typescript
if (job.businessOwnerId !== userId) {
```

**Rationale:** `ownerId` 是招聘负责人，不应赋予 business_owner 创建业务反馈的权限。business_owner 只能通过 `businessOwnerId` 获得权限。

Same fix applied to `requireCalibrationOwnership()`: removed `cal.job.ownerId !== userId` from the business_owner check.

## 4. Permission Test Results

| Role | userId | jobId | ownerId | businessOwnerId | Expected | Actual | Verdict |
|------|--------|-------|---------|-----------------|----------|--------|---------|
| business_owner | 赵业务 | KA大客户销售 | 王招聘 | 赵业务 | 201 | 201 | ✅ PASS |
| business_owner | 赵业务 | 品牌策划 | 王招聘 | 孙面试官 | 403 | 403 | ✅ PASS |
| recruiter | 王招聘 | candidates list | ownerId match | — | 8 candidates | 8 | ✅ PASS |
| interviewer | 孙面试官 | any feedback | — | — | 403 | 403 | ✅ PASS |

### Key Proofs

- ✅ business_owner 不因为 `ownerId` 命中而获得业务反馈创建权限
- ✅ recruiter 仍可通过 `ownerId` 看自己负责范围 (8 candidates)
- ✅ 权限失败不写 BusinessFeedback (DB verified: NOT FOUND)
- ✅ 权限失败不写 ActivityLog (verified: no entry for denied request)

## 5. DB Integrity

| Check | Result |
|-------|--------|
| Unrelated feedback in DB after denied request | NOT FOUND ✅ |
| Unrelated ActivityLog after denied request | NOT FOUND ✅ |
| Recruiter OWNED scope unaffected | 8 candidates ✅ |

## 6. Build Verification

| Check | Result |
|-------|--------|
| `pnpm typecheck` | 0 errors |
| `pnpm lint` | 0 errors, 0 warnings |
| `pnpm build` | PASS |
| `git status --short` | Clean |

## 7. Files Changed

```
server/repositories/business-feedback/ownership-check.ts  — 2 lines changed
```

## Final Conclusion

| Item | Status |
|------|--------|
| Phase 5.1.1 是否完成 | 是 |
| business_owner 是否仅基于 businessOwnerId 获权 | 是 |
| recruiter owned scope 是否未受影响 | 是 |
| 权限失败是否不写 BusinessFeedback | 是 |
| 权限失败是否不写 ActivityLog | 是 |
| 是否建议进入 Phase 6 | 等待外部审查 |
| 是否自行进入 Phase 6 | 否 |
