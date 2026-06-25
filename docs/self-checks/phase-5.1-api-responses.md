# Phase 5.1 API Response Evidence

## 1. POST /api/business-feedback — biz_owner RELATED (201)

**Role:** business_owner (赵业务, uid=cmqt44zdc0008zyqh6dao7vbr)
**Request:**
```json
{"jobId":"cmqt44ze2000azyqhghevqv4e","decision":"PASS","reasonCode":"","reasonText":"related OK"}
```
**Response: 201**
```json
{"success":true,"data":{"id":"cmqtb916v0000w5qhkn2tcmcn","jobId":"cmqt44ze2000azyqhghevqv4e","reviewerId":"cmqt44zdc0008zyqh6dao7vbr","decision":"PASS","reasonCode":"","reasonText":"related OK","createdAt":"2026-06-25T09:39:27.198Z","updatedAt":"2026-06-25T09:39:27.198Z"}}
```
**DB Written:** ✅ BusinessFeedback row created
**ActivityLog:** ✅ BUSINESS_FEEDBACK_CREATED (resourceId=cmqtb916v..., actorId=cmqt44zdc...)

---

## 2. POST /api/business-feedback — biz_owner UNRELATED (403)

**Role:** business_owner (赵业务)
**Request:**
```json
{"jobId":"cmqt44ze2000fzyqhm1zj56ue","decision":"REJECT","reasonCode":"OTHER"}
```
(品牌策划 job, bizOwner=孙面试官, not 赵业务)

**Response: 403**
```json
{"success":false,"error":"Permission denied: you are not the business owner or owner of this job"}
```
**DB Written:** ❌ No BusinessFeedback row created
**ActivityLog:** ❌ No ActivityLog written

---

## 3. POST /api/business-feedback — interviewer (403)

**Role:** interviewer (孙面试官)
**Request:**
```json
{"jobId":"cmqt44ze2000azyqhghevqv4e","decision":"REJECT","reasonCode":"OTHER"}
```
**Response: 403**
```json
{"success":false,"error":"Permission denied: interviewer cannot create on candidates"}
```
**DB Written:** ❌ No BusinessFeedback row
**ActivityLog:** ❌ No ActivityLog written

---

## 4. POST /api/jobs/:id/profile-calibrations — biz_owner UNRELATED (403)

**Role:** business_owner (赵业务)
**Request:**
```json
{"sourceFeedbackIds":["cmqtaj2wm0004seqhty8q5xb4"],"calibrationReason":"test"}
```
Target job: cmqt44ze2000fzyqhm1zj56ue (品牌策划, bizOwner=孙面试官)

**Response: 403**
```json
{"success":false,"error":"Permission denied: you are not the business owner or owner of this job"}
```
**DB Written:** ❌
**ActivityLog:** ❌

---

## 5. PATCH /api/profile-calibrations/:id — recruiter (403)

**Role:** recruiter (王招聘)
**Request:**
```json
{"status":"confirmed"}
```
Target: cmqtajl5v000aseqhg70mg8s7

**Response: 403**
```json
{"success":false,"error":"Permission denied: only admin/leader/hrbp/business_owner can confirm calibrations"}
```

---

## 6. PATCH /api/profile-calibrations/:id — admin confirm (200)

**Role:** admin (陈总)
**Request:**
```json
{"status":"confirmed"}
```
Target: cmqtajl5v000aseqhg70mg8s7

**Response: 200**
```json
{"success":true,"data":{"id":"cmqtajl5v000aseqhg70mg8s7","status":"confirmed","confirmedAt":"2026-06-25T09:39:50.520Z","confirmedBy":"cmqt44zav0004zyqhbtt0lfha",...}}
```
**DB Written:** ✅ status="confirmed", confirmedAt set, confirmedBy set
**ActivityLog:** ✅ PROFILE_CALIBRATION_CONFIRMED

---

## 7. GET /api/jobs/:id/feedback-summary (200)

**Response: 200** — calibrationHistory now includes structured status:
```json
{"calibrationHistory":[{"id":"cmqtajl5v...","status":"confirmed","confirmedAt":"2026-06-25T09:39:50.520Z","confirmedBy":"cmqt44zav...","createdAt":"2026-06-25T09:19:40.003Z"}]}
```
**Status field:** Now uses structured `ProfileCalibration.status`, not `afterSnapshot._status` ✅
