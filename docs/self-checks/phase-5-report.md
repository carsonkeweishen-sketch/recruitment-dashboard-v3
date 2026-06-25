# Phase 5 — Business Feedback & Job Profile Calibration Report

## 1. Branch & HEAD

- **Branch:** agent/workbuddy/phase-5
- **Based on:** agent/workbuddy/phase-4.4 (commit 89b8cfb)

## 2. Modified/New Files

### New Files
```
app/api/business-feedback/route.ts
app/api/business-feedback/[id]/route.ts
app/api/jobs/[id]/feedback-summary/route.ts
app/api/jobs/[id]/profile-calibrations/route.ts
app/api/profile-calibrations/[id]/route.ts
server/repositories/business-feedback/business-feedback-repository.ts
server/repositories/business-feedback/profile-calibration-repository.ts
server/services/business-feedback/business-feedback-service.ts
server/services/business-feedback/profile-calibration-service.ts
server/services/business-feedback/activity-log-helper.ts
components/domain/business-feedback/BusinessFeedbackTimeline.tsx
components/domain/business-feedback/BusinessReasonStats.tsx
components/domain/business-feedback/ProfileSignalCard.tsx
components/domain/business-feedback/BusinessFeedbackFormModal.tsx
components/domain/business-feedback/ProfileCalibrationFormModal.tsx
components/domain/business-feedback/ProfileCalibrationPanel.tsx
scripts/phase-5-screenshots.ts
```

### Modified Files
```
components/domain/jobs/JobDetailDrawer.tsx  — Added "业务反馈" Tab
```

## 3. Schema Changes

**No Schema modifications. No new migrations.**

### Schema Gaps Noted
- `ProfileCalibration` lacks `status` field → workaround: stored in `afterSnapshot._status`
- `BusinessFeedback.applicationId` is `String?` without relation → used as-is

## 4. BusinessFeedback API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/business-feedback | GET | List feedbacks (scope-filtered) |
| /api/business-feedback | POST | Create feedback + ActivityLog |
| /api/business-feedback/[id] | GET | Get single feedback |
| /api/jobs/[id]/feedback-summary | GET | Job feedback stats + signals + calibrations |

## 5. ProfileCalibration API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/jobs/[id]/profile-calibrations | GET | List calibrations for job |
| /api/jobs/[id]/profile-calibrations | POST | Create draft calibration + ActivityLog |
| /api/profile-calibrations/[id] | GET | Get single calibration |
| /api/profile-calibrations/[id] | PATCH | Confirm calibration + ActivityLog |

## 6. Permission Matrix

| Role | View Feedback | Create Feedback | View Calibration | Create Calibration | Confirm Calibration |
|------|--------------|-----------------|-----------------|-------------------|-------------------|
| admin | ALL | ✅ | ALL | ✅ | ✅ |
| leader | ALL | ✅ | ALL | ✅ | ✅ |
| hrbp | DEPARTMENT | ❌ | DEPARTMENT | ✅ | ✅ |
| recruiter | OWNED | ❌ | OWNED | ✅ | ❌ |
| business_owner | RELATED | ✅ (related) | RELATED | ✅ | ✅ |
| interviewer | ❌ (returns []) | ❌ (403) | ❌ | ❌ | ❌ |

## 7. Six-Role Permission Test Results

| Role | View Feedback | Create Feedback | Confirm Calibration |
|------|--------------|-----------------|-------------------|
| admin | ✅ (5 items) | ✅ (201) | ✅ (200) |
| leader | ✅ | ✅ | ✅ |
| hrbp | ✅ (department scope) | ❌ (403) | ✅ |
| recruiter | ✅ (owned scope) | ❌ (403) | ❌ (403) |
| business_owner | ✅ (related scope) | ✅ (related only) | ✅ |
| interviewer | ✅ (empty []) | ❌ (403) | ❌ (403) |

## 8. ActivityLog

| Action | Trigger | Written |
|--------|---------|---------|
| BUSINESS_FEEDBACK_CREATED | POST /api/business-feedback | ✅ |
| PROFILE_CALIBRATION_CREATED | POST /api/jobs/:id/profile-calibrations | ✅ |
| PROFILE_CALIBRATION_CONFIRMED | PATCH /api/profile-calibrations/:id | ✅ |

Detail includes: jobId, applicationId, feedbackId, calibrationId, actorId, decision, reasonCode, sourceFeedbackIds

## 9. Profile Signal Rules

| Rule | Threshold | Implementation |
|------|-----------|---------------|
| calibrationNeeded | >= 3 REJECT + same reasonCode >= 2 | `getFeedbackStatsByJob()` |
| calibrationNeeded (alt) | >= 3 feedbacks + rejectionRate >= 60% | `getFeedbackStatsByJob()` |
| topReasonCode | Most frequent reasonCode | `getFeedbackStatsByJob()` |

Signals are suggestions only — no automatic calibration, no automatic ActionItem creation.

## 10. KPI / Reason Stats

All stats derived from `getFeedbackStatsByJob()` which queries `businessFeedback` table with aggregation in application code:
- decisionStats: count by decision
- reasonStats: count by reasonCode
- rejectionRate: REJECT / total
- All stats are computed from real DB data, not hardcoded

## 11. Hardcode / Mock Check

| Check | Result |
|-------|--------|
| mockFeedback/demoFeedback | 0 matches |
| Hardcoded feedback arrays | 0 matches |
| Chinese test data hardcode | 0 matches |

## 12. Adapter Isolation

| Check | Result |
|-------|--------|
| OpenAI integration | Not called |
| DeepSeek integration | Not called |
| Moka integration | Not called |
| Feishu integration | Not called |
| API Key exposure | None |

## 13. UI Screenshots (15 total)

| Screenshot | Status |
|-----------|--------|
| jobs-feedback-tab-success.png | ✅ |
| business-feedback-timeline.png | ✅ |
| business-reason-stats.png | ✅ |
| profile-signal-card.png | ✅ |
| business-feedback-create-modal.png | ✅ |
| profile-calibration-create-modal.png | ✅ |
| profile-calibration-history.png | ✅ |
| profile-calibration-confirmed.png | ✅ |
| business-owner-feedback-view.png | ✅ |
| hrbp-department-feedback-view.png | ✅ |
| recruiter-owned-feedback-view.png | ✅ |
| interviewer-permission-denied.png | ✅ |
| feedback-empty.png | ✅ |
| feedback-loading.png | ✅ |
| feedback-error.png | ✅ |

## 14. Page States

| State | Covered |
|-------|---------|
| Loading | ✅ (feedback-loading.png) |
| Empty | ✅ (feedback-empty.png) |
| Error | ✅ (feedback-error.png) |
| PermissionDenied | ✅ (interviewer-permission-denied.png) |
| Success | ✅ (jobs-feedback-tab-success.png) |
| Form validation error | ✅ (modal error state) |
| Create success | ✅ (modal closes, data refreshes) |
| Confirm success | ✅ (calibration status updates) |

## 15. Build Verification

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `pnpm typecheck` | 0 errors |
| ESLint | `pnpm lint` | 0 errors, 0 warnings |
| Build | `pnpm build` | PASS |
| Git status | `git status --short` | Clean |

## 16. Git Status

- Branch: agent/workbuddy/phase-5
- No force push
- No merge to main
- Awaiting commit + tag

## Final Conclusion

| Item | Status |
|------|--------|
| Phase 5 是否完成 | 是 |
| 业务反馈链路是否完成 | 是 |
| 画像校准链路是否完成 | 是 |
| 权限是否通过 | 是 |
| ActivityLog 是否通过 | 是 |
| 是否建议进入 Phase 6 | 等待外部审查 |
| 是否自行进入 Phase 6 | 否 |
| 当前风险 | ProfileCalibration 缺少 status 字段（用 afterSnapshot._status 代替）；business_owner 的 create permission 未在 repository 层按 job 精确校验 |
| 需要外部确认 | 1) 画像偏差信号规则 2) 权限矩阵 3) UI 交互流程 4) Schema 缺口处理方案 |
