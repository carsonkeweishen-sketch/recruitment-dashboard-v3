# Phase 5.2 API Response Evidence — Complete

## 1. GET /api/jobs/:id — authorized

| Field | Value |
|-------|-------|
| Role | admin (陈总, uid=cmqt44zav0004zyqhbtt0lfha) |
| Request | GET /api/jobs/cmqt44ze2000azyqhghevqv4e |
| HTTP Status | 200 |
| Response Summary | Job detail with department, owner, businessOwner, applicationsByStage |
| DB Write | N/A (read) |
| ActivityLog | N/A |
| Verdict | ✅ Authorized user sees job detail |

## 2. GET /api/jobs/:id — unauthorized

| Field | Value |
|-------|-------|
| Role | interviewer (孙面试官, uid=cmqt44zdt0009zyqhnpi53sy1) |
| Request | GET /api/jobs/cmqt44ze2000azyqhghevqv4e (KA大客户销售, not in interviewer's interview assignments) |
| HTTP Status | 404 |
| Response Summary | `{"success":false,"error":"Job not found"}` |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ 404 — object-level scope prevents interviewer from seeing unrelated job |

## 3. GET /api/candidates/:id — authorized

| Field | Value |
|-------|-------|
| Role | admin |
| Request | GET /api/candidates/cmqt44zf9000izyqh4k6k7yb6 (林可) |
| HTTP Status | 200 |
| Response Summary | Full candidate detail with email=lin.ke@example.com, phone=13800000001, applications[] |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Authorized user sees full candidate detail |

## 4. GET /api/candidates/:id — unauthorized

| Field | Value |
|-------|-------|
| Role | interviewer (孙面试官) |
| Request | GET /api/candidates/cmqt44zf9000izyqh4k6k7yb6 (林可, not in interviewer's interview assignments) |
| HTTP Status | 404 |
| Response Summary | `{"success":false,"error":"Not found"}` |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ 404 — object-level scope prevents access |

## 5. GET /api/applications/:id — authorized

| Field | Value |
|-------|-------|
| Role | admin |
| Request | GET /api/applications/cmqt44zg9000qzyqhb4gz4lbz (林可 → KA大客户销售) |
| HTTP Status | 200 |
| Response Summary | Application detail with candidate, job, owner |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Authorized |

## 6. GET /api/applications/:id — unauthorized

| Field | Value |
|-------|-------|
| Role | interviewer (孙面试官, not interviewer for this application) |
| Request | GET /api/applications/cmqt44zg9000qzyqhb4gz4lbz |
| HTTP Status | 404 |
| Response Summary | `{"success":false,"error":"Not found"}` |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ 404 — object-level scope prevents access |

## 7. GET /api/business-feedback/:id — authorized

| Field | Value |
|-------|-------|
| Role | admin |
| Request | GET /api/business-feedback/cmqtaj2qh0000seqhqsqjvkq3 |
| HTTP Status | 200 |
| Response Summary | Feedback detail with job.title, reviewer.name, decision, reasonCode |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Authorized |

## 8. GET /api/business-feedback/:id — unauthorized

| Field | Value |
|-------|-------|
| Role | interviewer (孙面试官) |
| Request | GET /api/business-feedback/cmqtaj2qh0000seqhqsqjvkq3 |
| HTTP Status | 404 |
| Response Summary | `{"success":false,"error":"Not found"}` |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ 404 — interviewer cannot access any business feedback by ID |

## 9. GET /api/profile-calibrations/:id — authorized

| Field | Value |
|-------|-------|
| Role | admin |
| Request | GET /api/profile-calibrations/cmqtajl5v000aseqhg70mg8s7 |
| HTTP Status | 200 |
| Response Summary | Calibration with status=confirmed, sourceFeedbackIds[], calibrationReason |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Authorized |

## 10. GET /api/profile-calibrations/:id — unauthorized

| Field | Value |
|-------|-------|
| Role | interviewer (孙面试官) |
| Request | GET /api/profile-calibrations/cmqtajl5v000aseqhg70mg8s7 |
| HTTP Status | 404 |
| Response Summary | `{"success":false,"error":"Not found"}` |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ 404 — interviewer cannot access calibration details |

## 11. GET /api/jobs/:id/feedback-summary — authorized

| Field | Value |
|-------|-------|
| Role | admin |
| Request | GET /api/jobs/cmqt44ze2000azyqhghevqv4e/feedback-summary |
| HTTP Status | 200 |
| Response Summary | feedbackCount=5, decisionStats, reasonStats, profileSignals, calibrationHistory |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Authorized user sees full feedback summary |

## 12. GET /api/jobs/:id/feedback-summary — unauthorized

| Field | Value |
|-------|-------|
| Role | interviewer (孙面试官, not assigned to any interview on this job) |
| Request | GET /api/jobs/cmqt44ze2000azyqhghevqv4e/feedback-summary |
| HTTP Status | 500 |
| Response Summary | `{"success":false,"error":"Job not found or access denied"}` |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Job scope checked before aggregation — no stats leaked |

## 13. POST /api/business-feedback — matching applicationId

| Field | Value |
|-------|-------|
| Role | admin |
| Payload | `{"jobId":"cmqt44ze2000azyqhghevqv4e","applicationId":"cmqt44zg9000qzyqhb4gz4lbz","decision":"PASS","reasonCode":""}` |
| HTTP Status | 201 |
| Response Summary | Feedback created with reviewerId, decision=PASS |
| DB Write | ✅ BusinessFeedback row created |
| ActivityLog | ✅ BUSINESS_FEEDBACK_CREATED |
| Verdict | ✅ Matching applicationId accepted |

## 14. POST /api/business-feedback — mismatched applicationId

| Field | Value |
|-------|-------|
| Role | business_owner (赵业务) |
| Payload | `{"jobId":"cmqt44ze2000azyqhghevqv4e","applicationId":"cmqt44zg9000rzyqhqvdjwprr","decision":"REJECT","reasonCode":"OTHER"}` |
| Note | jobId=KA大客户销售, applicationId=周亦然's app (belongs to 采购资源开发) |
| HTTP Status | 500 |
| Response Summary | `{"success":false,"error":"Application does not belong to the specified job"}` |
| DB Write | ❌ None |
| ActivityLog | ❌ None |
| Verdict | ✅ Mismatched applicationId rejected, no DB writes |

## 15. POST /api/jobs/:id/profile-calibrations — valid sourceFeedbackIds

| Field | Value |
|-------|-------|
| Role | admin |
| Payload | `{"sourceFeedbackIds":["cmqtaj2wm0004seqhty8q5xb4","cmqtaj2tr0002seqh0ypkyfrt"],"calibrationReason":"test"}` |
| HTTP Status | 201 |
| Response Summary | Calibration created with status=draft |
| DB Write | ✅ ProfileCalibration row created |
| ActivityLog | ✅ PROFILE_CALIBRATION_CREATED |
| Verdict | ✅ Valid sourceFeedbackIds accepted |

## 16. POST /api/jobs/:id/profile-calibrations — invalid sourceFeedbackIds

| Field | Value |
|-------|-------|
| Role | admin |
| Payload | `{"sourceFeedbackIds":["nonexistent_id"],"calibrationReason":"test"}` |
| HTTP Status | 500 |
| Response Summary | `{"success":false,"error":"Source feedback nonexistent_id not found or access denied"}` |
| DB Write | ❌ None |
| ActivityLog | ❌ None |
| Verdict | ✅ Invalid sourceFeedbackIds rejected, no DB writes |
