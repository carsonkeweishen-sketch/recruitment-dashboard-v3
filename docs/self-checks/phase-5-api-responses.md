# Phase 5 API Response Evidence

## 1. POST /api/business-feedback (Create Feedback)

**Request (admin):**
```json
{"jobId":"cmqt44ze2000azyqhghevqv4e","applicationId":"cmqt44zg9000qzyqhb4gz4lbz","decision":"REJECT","reasonCode":"EXPERIENCE_MISMATCH","reasonText":"候选人在KA渠道开拓经验不足"}
```

**Response: 201**
```json
{"success":true,"data":{"id":"cmqtaj2qh0000seqhqsqjvkq3","jobId":"cmqt44ze2000azyqhghevqv4e","applicationId":"cmqt44zg9000qzyqhb4gz4lbz","reviewerId":"cmqt44zav0004zyqhbtt0lfha","decision":"REJECT","reasonCode":"EXPERIENCE_MISMATCH","reasonText":"候选人在KA渠道开拓经验不足","createdAt":"2026-06-25T09:18:...","updatedAt":"2026-06-25T09:18:..."}}
```

**ActivityLog:** BUSINESS_FEEDBACK_CREATED → resourceType=business_feedback, detail={jobId, applicationId, decision, reasonCode}

---

## 2. GET /api/business-feedback?jobId=xxx (List Feedbacks)

**Response: 200**
```json
{"success":true,"data":[{"id":"...","decision":"REJECT","reasonCode":"EXPERIENCE_MISMATCH","reasonText":"...","reviewer":{"id":"...","name":"陈总"},"job":{"id":"...","title":"KA大客户销售","jobCode":"SALES-001","department":{"name":"销售/KA渠道"}},"createdAt":"2026-..."}],"scope":"admin"}
```

**Fields:** id, decision, reasonCode, reasonText, reviewer.{id,name}, job.{id,title,jobCode,department.{name}}, createdAt

---

## 3. GET /api/jobs/:id/feedback-summary (Job Feedback Summary)

**Response: 200**
```json
{
  "success":true,
  "data":{
    "jobId":"cmqt44ze2000azyqhghevqv4e",
    "feedbackCount":5,
    "decisionStats":{"PASS":2,"REJECT":3},
    "reasonStats":{"OTHER":1,"EXPERIENCE_MISMATCH":2,"SALARY_GAP":1},
    "rejectionRate":0.6,
    "profileSignals":{
      "calibrationNeeded":true,
      "topReasonCode":"EXPERIENCE_MISMATCH",
      "topReasonCount":2,
      "rejectionRate":0.6,
      "suggestedCalibrationReason":"连续 2 个候选人因「EXPERIENCE_MISMATCH」被拒，建议复核岗位画像"
    },
    "recentFeedbacks":[...],
    "calibrationHistory":[...]
  }
}
```

---

## 4. POST /api/jobs/:id/profile-calibrations (Create Calibration)

**Request:**
```json
{"sourceFeedbackIds":["cmqtaj2wm0004seqhty8q5xb4","cmqtaj2tr0002seqh0ypkyfrt"],"calibrationReason":"连续候选人因KA渠道经验不足被拒，建议扩展targetCompanies"}
```

**Response: 201**
```json
{"success":true,"data":{"id":"cmqtajl5v000aseqhg70mg8s7","jobId":"...","beforeSnapshot":{},"afterSnapshot":{"_status":"draft","_confirmedAt":null},"sourceFeedbackIds":["...","..."],"calibrationReason":"...","createdBy":"...","createdAt":"2026-..."}}
```

**ActivityLog:** PROFILE_CALIBRATION_CREATED

---

## 5. PATCH /api/profile-calibrations/:id (Confirm Calibration)

**Request:**
```json
{"status":"confirmed"}
```

**Response: 200**
```json
{"success":true,"data":{"id":"cmqtajl5v000aseqhg70mg8s7","...","afterSnapshot":{"_status":"confirmed","_confirmedAt":"2026-06-25T09:19:47.841Z","_confirmedBy":"cmqt44zav0004zyqhbtt0lfha"},"...","updatedAt":"2026-..."}}
```

**ActivityLog:** PROFILE_CALIBRATION_CONFIRMED

---

## 6. Permission Tests

| Test | Role | Expected | Actual | Status |
|------|------|----------|--------|--------|
| Create feedback | interviewer | 403 | 403 "cannot create on candidates" | ✅ |
| Create feedback | business_owner (unrelated) | 403 | 403 "cannot create on candidates" | ✅ |
| Create feedback | admin | 201 | 201 | ✅ |
| Confirm calibration | recruiter | 403 | 403 "only admin/leader/hrbp/business_owner can confirm" | ✅ |
| Confirm calibration | admin | 200 | 200 | ✅ |

---

## 7. Data Integrity Checks

| Check | Result |
|-------|--------|
| No undefined in responses | ✅ |
| No NaN in responses | ✅ |
| No Invalid Date in responses | ✅ |
| No raw JSON leakage | ✅ |
| ActivityLog written for CREATE | ✅ |
| ActivityLog written for CONFIRM | ✅ |
| Decision validation (only PASS/REJECT/HOLD/REDIRECT) | ✅ |
| Source feedback validation (at least 1 required) | ✅ |
