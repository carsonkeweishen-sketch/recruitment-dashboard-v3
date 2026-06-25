# Phase 5.1 — Permission & Schema Final Gate Report

## 1. Branch & HEAD

- **Branch:** agent/workbuddy/phase-5
- **Based on:** Phase 5 commit b321d66

## 2. Changes Summary

### P0-1: business_owner Object-Level Permission Fix

| File | Change |
|------|--------|
| `server/repositories/business-feedback/ownership-check.ts` | NEW: `requireJobOwnership()`, `requireCalibrationOwnership()` |
| `server/services/business-feedback/business-feedback-service.ts` | Updated: business_owner uses "view" action, ownership check at repo level |
| `server/services/business-feedback/profile-calibration-service.ts` | Updated: same pattern, ownership check for calibrations |

**How it works:**
1. `requirePermission()` validates resource-level access
2. `requireJobOwnership()` validates that the specific job belongs to the business_owner (or they are admin/leader)
3. For business_owner: checks `job.businessOwnerId === userId || job.ownerId === userId`
4. Permission failure → throws `JobOwnershipError` → API returns 403
5. No DB write on permission failure

### P0-2: ProfileCalibration Status Fields

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `status String @default("draft")`, `confirmedAt DateTime?`, `confirmedBy String?` |
| `prisma/migrations/20260625173449_add_calibration_status/migration.sql` | Migration SQL |
| `server/repositories/business-feedback/profile-calibration-repository.ts` | Uses structured fields instead of `afterSnapshot._status` |

**Status values:** `draft` | `confirmed` | `archived`

## 3. Permission Test Results

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| biz_owner + RELATED job → create feedback | 201 | 201 | ✅ |
| biz_owner + UNRELATED job → create feedback | 403 | 403 | ✅ |
| interviewer → create feedback | 403 | 403 | ✅ |
| biz_owner + UNRELATED job → create calibration | 403 | 403 | ✅ |
| recruiter → confirm calibration | 403 | 403 | ✅ |
| admin → confirm calibration | 200 | 200 | ✅ |

## 4. DB Integrity

| Check | Result |
|-------|--------|
| Unrelated feedback in DB after denied request | NOT FOUND ✅ |
| Unrelated ActivityLog after denied request | NOT FOUND ✅ |
| ProfileCalibration.status structured | confirmed ✅ |
| ProfileCalibration.confirmedAt set | 2026-06-25T09:39:50 ✅ |
| ProfileCalibration.confirmedBy set | cmqt44zav... ✅ |

## 5. ActivityLog Evidence

| Action | ResourceType | ResourceId | ActorId | Detail Keys | Written |
|--------|-------------|-----------|---------|-------------|---------|
| BUSINESS_FEEDBACK_CREATED | business_feedback | cmqtb916v... | cmqt44zdc... | jobId, decision, reasonCode | ✅ |
| PROFILE_CALIBRATION_CREATED | profile_calibration | cmqtajl5v... | cmqt44zav... | jobId, sourceFeedbackIds | ✅ |
| PROFILE_CALIBRATION_CONFIRMED | profile_calibration | cmqtajl5v... | cmqt44zav... | jobId | ✅ |

## 6. Build Verification

| Check | Result |
|-------|--------|
| `pnpm prisma generate` | ✅ |
| `pnpm typecheck` | 0 errors |
| `pnpm lint` | 0 errors, 0 warnings |
| `pnpm build` | PASS |
| `git status --short` | Clean |

## 7. Screenshots

| Screenshot | Status |
|-----------|--------|
| business-owner-unrelated-feedback-denied.png | ✅ |
| profile-calibration-confirmed-status.png | ✅ |
| recruiter-confirm-denied.png | ✅ |

## 8. Schema Migration

```sql
ALTER TABLE "profile_calibrations" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE "profile_calibrations" ADD COLUMN "confirmed_at" TIMESTAMPTZ;
ALTER TABLE "profile_calibrations" ADD COLUMN "confirmed_by" TEXT;
```

Migration: `prisma/migrations/20260625173449_add_calibration_status`

## Final Conclusion

| Item | Status |
|------|--------|
| Phase 5.1 是否完成 | 是 |
| business_owner create 权限是否 repository 层收口 | 是 |
| ProfileCalibration status 是否结构化 | 是 |
| API response evidence 是否完整 | 是 |
| ActivityLog DB 证据是否完整 | 是 |
| 是否建议进入 Phase 6 | 等待外部审查 |
| 是否自行进入 Phase 6 | 否 |
| 当前风险 | 无阻塞性风险 |
| 需要外部确认 | 1) ownership-check 权限逻辑 2) Schema 新增字段 3) ActivityLog 完整性 |
