# Phase 5.2 API Response Evidence — Security Tests

## P0-1: Core Detail API Object-Level Scope

### GET /api/candidates/:id — unauthorized (interviewer, unrelated)
**Role:** interviewer (孙面试官, uid=cmqt44zdt...)
**Target:** 林可 (candidate not in interviewer's interview assignments)
**Response: 404**
```json
{"success":false,"error":"Not found"}
```
**Verdict:** ✅ 404 — object-level scope prevents access

### GET /api/candidates/:id — authorized (admin)
**Role:** admin
**Response: 200** — returns full candidate detail with email/phone

---

## P0-2: BusinessFeedback Detail GET

### GET /api/business-feedback/:id — unauthorized (interviewer)
**Role:** interviewer
**Response: 404**
```json
{"success":false,"error":"Not found"}
```
**Verdict:** ✅ interviewer cannot access any business feedback by ID

### GET /api/business-feedback/:id — authorized (admin)
**Role:** admin
**Response: 200** — returns feedback with job and reviewer

---

## P0-3: ProfileCalibration Detail GET

### GET /api/profile-calibrations/:id — unauthorized (interviewer)
**Role:** interviewer
**Response: 404**
```json
{"success":false,"error":"Not found"}
```
**Verdict:** ✅ interviewer cannot access calibration details

---

## P0-4: Job Feedback Summary — Job Scope First

### GET /api/jobs/:id/feedback-summary — unauthorized (interviewer, unrelated job)
**Role:** interviewer, target job not in their interview assignments
**Response: 500 (error message)**
```json
{"success":false,"error":"Job not found or access denied"}
```
**Verdict:** ✅ Job scope checked before aggregation

---

## P0-5: BusinessFeedback Create — applicationId Validation

### POST /api/business-feedback — mismatched applicationId
**Role:** business_owner
**Request:** jobId=KA大客户销售, applicationId=周亦然's app (belongs to 采购资源开发)
**Response: 500**
```json
{"success":false,"error":"Application does not belong to the specified job"}
```
**Verdict:** ✅ applicationId validated against jobId
**DB Write:** ❌ None
**ActivityLog:** ❌ None

### POST /api/business-feedback — matching applicationId
**Role:** admin
**Response: 201** ✅

---

## P0-6: ProfileCalibration Create — sourceFeedbackIds Validation

### POST /api/jobs/:id/profile-calibrations — nonexistent sourceFeedbackId
**Role:** admin
**Request:** sourceFeedbackIds=["nonexistent_id"]
**Response: 500**
```json
{"success":false,"error":"Source feedback nonexistent_id not found or access denied"}
```
**Verdict:** ✅ Invalid source feedback rejected
**DB Write:** ❌ None
**ActivityLog:** ❌ None

---

## Security Audit Log Strategy (Section 9)

**Decision: 方案 B** — 当前暂无独立 SecurityAuditLog 表。
- 权限失败不写业务 ActivityLog（避免污染业务动态）
- 失败请求返回 403/404 + 描述性错误消息
- SecurityAuditLog 作为 Phase 8/安全治理技术债登记
