# Phase 5.2.1 API Response Evidence — Complete Runtime

## 1. GET /api/jobs/:id — authorized (admin)
| Field | Value |
|-------|-------|
| Role | admin |
| HTTP Status | 200 |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Full job detail |

## 2. GET /api/jobs/:id — unauthorized (interviewer, unrelated)
| Field | Value |
|-------|-------|
| Role | interviewer |
| HTTP Status | 404 |
| Response | `{"success":false,"error":"Job not found"}` |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ 404 — object-level scope |

## 3. GET /api/candidates/:id — authorized (admin)
| Field | Value |
|-------|-------|
| Role | admin |
| HTTP Status | 200 |
| Response | applications=1, email=visible, phone=visible |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Full detail with contact info |

## 4. GET /api/candidates/:id — unauthorized (interviewer, unrelated)
| Field | Value |
|-------|-------|
| Role | interviewer, candidate not in interview assignments |
| HTTP Status | 404 |
| Response | `{"success":false,"error":"Not found"}` |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ 404 |

## 5. GET /api/candidates/:id — authorized (recruiter, OWNED)
| Field | Value |
|-------|-------|
| Role | recruiter (王招聘, owner of application) |
| HTTP Status | 200 |
| Response | applications=1, email=visible, phone=visible |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Recruiter sees owned candidate detail |

## 6. GET /api/candidates/:id — authorized (interviewer, RELATED)
| Field | Value |
|-------|-------|
| Role | interviewer (孙面试官, has interview assignment for 陈书妍) |
| HTTP Status | 200 |
| Response | applications=1, email=null, phone=null |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Interviewer sees only assigned candidate, contacts hidden |

## 7. GET /api/candidates/:id — applications scope filtering
| Role | Candidate | DB apps | Returned apps | Verdict |
|------|-----------|---------|---------------|---------|
| admin | 林可 | 1 | 1 | ✅ Full |
| recruiter | 林可 | 1 | 1 (owner match) | ✅ Owned only |
| interviewer | 陈书妍 | 1 | 1 (interview assignment) | ✅ Related only |

No cross-job/cross-role application leakage.

## 8. GET /api/business-feedback/:id — authorized (admin)
| Field | Value |
|-------|-------|
| Role | admin |
| HTTP Status | 200 |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ |

## 9. GET /api/business-feedback/:id — unauthorized (interviewer)
| Field | Value |
|-------|-------|
| Role | interviewer |
| HTTP Status | 404 |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ 404 |

## 10. GET /api/profile-calibrations/:id — authorized (admin)
| Field | Value |
|-------|-------|
| Role | admin |
| HTTP Status | 200 |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ |

## 11. GET /api/profile-calibrations/:id — unauthorized (interviewer)
| Field | Value |
|-------|-------|
| Role | interviewer |
| HTTP Status | 404 |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ 404 |

## 12. GET /api/jobs/:id/feedback-summary — authorized (admin)
| Field | Value |
|-------|-------|
| Role | admin |
| HTTP Status | 200 |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ Full stats returned |

## 13. GET /api/jobs/:id/feedback-summary — unauthorized (interviewer) — NON-500
| Field | Value |
|-------|-------|
| Role | interviewer |
| HTTP Status | **404** (was 500 in Phase 5.2) |
| Response | `{"success":false,"error":"Job not found or access denied"}` |
| DB Write | N/A |
| ActivityLog | N/A |
| Verdict | ✅ 404 — no 500 leakage |

## 14. POST /api/business-feedback — matching applicationId
| Field | Value |
|-------|-------|
| Role | admin |
| Payload | jobId + matching applicationId |
| HTTP Status | 201 |
| DB Write | ✅ |
| ActivityLog | ✅ BUSINESS_FEEDBACK_CREATED |
| Verdict | ✅ |

## 15. POST /api/business-feedback — mismatched applicationId — NON-500
| Field | Value |
|-------|-------|
| Role | business_owner |
| Payload | jobId=A, applicationId=belongs to job B |
| HTTP Status | **400** (was 500 in Phase 5.2) |
| Response | `{"success":false,"error":"Application does not belong to the specified job"}` |
| DB Write | ❌ None |
| ActivityLog | ❌ None |
| Verdict | ✅ 400 — no 500 leakage, no DB writes |

## 16. POST /api/jobs/:id/profile-calibrations — valid sourceFeedbackIds
| Field | Value |
|-------|-------|
| Role | admin |
| HTTP Status | 201 |
| DB Write | ✅ |
| ActivityLog | ✅ PROFILE_CALIBRATION_CREATED |
| Verdict | ✅ |

## 17. POST /api/jobs/:id/profile-calibrations — invalid sourceFeedbackIds — NON-500
| Field | Value |
|-------|-------|
| Role | admin |
| Payload | sourceFeedbackIds=["nonexistent"] |
| HTTP Status | **404** (was 500 in Phase 5.2) |
| Response | `{"success":false,"error":"Source feedback nonexistent not found or access denied"}` |
| DB Write | ❌ None |
| ActivityLog | ❌ None |
| Verdict | ✅ 404 — no 500 leakage, no DB writes |

## 18. SecurityAuditLog Strategy (P1)
**Decision: 方案 B** — 当前暂无独立 SecurityAuditLog。
- 权限失败不写业务 ActivityLog（避免污染业务动态）
- 失败请求返回正确 HTTP status (400/403/404) + 描述性错误
- SecurityAuditLog 作为 Phase 8/安全治理技术债登记
