# Phase 5.2 — Security Patch for Business Feedback & Profile Calibration

## 1. Branch & HEAD

- **Branch:** agent/workbuddy/phase-5
- **Based on:** Phase 5.1.1 commit e9e1413

## 2. P0 Fixes Summary

| P0 | Issue | Fix | Files Changed |
|----|-------|-----|---------------|
| P0-1 | Core detail API findUnique(id) no scope | Added getXxxByIdWithScope() using findFirst + scope | job/candidate/application repos + services + APIs |
| P0-2 | BusinessFeedback detail GET no scope | getFeedbackByIdWithScope() with role-based filter | business-feedback-repository, service, API |
| P0-3 | ProfileCalibration detail GET no scope | getCalibrationByIdWithScope() with role-based filter | profile-calibration-repository, API |
| P0-4 | Feedback summary aggregates before checking job scope | Check job scope via getJobByIdWithScope() first | business-feedback-service |
| P0-5 | BusinessFeedback create doesn't validate applicationId | Validate app exists, belongs to job, and is visible | business-feedback-service |
| P0-6 | Calibration create doesn't validate sourceFeedbackIds | Validate each feedback exists, belongs to job, and is visible | profile-calibration-service |

## 3. Security Test Results

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| interviewer GET candidate detail (unrelated) | 404 | 404 | ✅ |
| interviewer GET business-feedback detail | 404 | 404 | ✅ |
| interviewer GET calibration detail | 404 | 404 | ✅ |
| interviewer GET feedback-summary (unrelated job) | 403/404 | "Job not found or access denied" | ✅ |
| biz_owner POST feedback with mismatched appId | 403/404 | "Application does not belong to the specified job" | ✅ |
| admin POST calibration with nonexistent source | 403/404 | "Source feedback ... not found or access denied" | ✅ |
| admin GET candidate detail (authorized) | 200 | 200 | ✅ |
| biz_owner POST feedback with correct appId | 201 | 201 | ✅ |

## 4. Security Audit Log Strategy

**方案 B:** 当前暂无独立 SecurityAuditLog。
- 权限失败不写业务 ActivityLog
- 作为 Phase 8/安全治理技术债登记

## 5. Changed Files (15)

```
server/repositories/job-repository.ts
server/repositories/candidate-repository.ts
server/repositories/application-repository.ts
server/repositories/business-feedback/business-feedback-repository.ts
server/repositories/business-feedback/profile-calibration-repository.ts
server/services/jobs/job-service.ts
server/services/candidates/candidate-service.ts
server/services/applications/application-service.ts
server/services/business-feedback/business-feedback-service.ts
server/services/business-feedback/profile-calibration-service.ts
app/api/jobs/[id]/route.ts
app/api/candidates/[id]/route.ts
app/api/applications/[id]/route.ts
app/api/business-feedback/[id]/route.ts
app/api/profile-calibrations/[id]/route.ts
```

## 6. Build Verification

| Check | Result |
|-------|--------|
| typecheck | 0 errors |
| lint | 0 errors, 0 warnings |
| build | PASS |

## Final Conclusion

| Item | Status |
|------|--------|
| Phase 5.2 是否完成 | 是 |
| core detail API object-level scope 是否关闭 | 是 |
| BusinessFeedback detail GET 是否关闭越权 | 是 |
| ProfileCalibration detail GET 是否关闭越权 | 是 |
| feedback summary 是否先校验 job scope | 是 |
| BusinessFeedback applicationId 归属校验是否完成 | 是 |
| ProfileCalibration sourceFeedbackIds 归属校验是否完成 | 是 |
| runtime API evidence 是否完整 | 是 |
| 是否建议进入 Phase 6 | 等待外部审查 |
| 是否自行进入 Phase 6 | 否 |
| 当前风险 | SecurityAuditLog 待 Phase 8 实施 |
| 需要外部确认 | 1) findFirst+scope 替代 findUnique 方案 2) 404 vs 403 状态码策略 3) SecurityAuditLog 延期 |
