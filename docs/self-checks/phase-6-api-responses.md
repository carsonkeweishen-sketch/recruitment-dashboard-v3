# Phase 6 API Response Evidence

## 1. GET /api/interviews (admin)

**Response: 200**
```json
{"success":true,"interviews":[{"id":"cmqt44zhe...","round":"business_first","status":"completed","application":{"candidate":{"name":"陈书妍",...},"job":{"title":"媒介投放",...}},"interviewer":{"name":"孙面试官"},"feedbacks":[{"overallRecommendation":"STRONG_HIRE"}]},...],"metrics":{"totalInterviews":3,"feedbackSubmittedCount":3,"feedbackPendingCount":0,"feedbackOnTimeRate":0},"scope":"ALL"}
```

**Fields:** interviews[], metrics (totalInterviews, feedbackSubmittedCount, feedbackPendingCount, feedbackOnTimeRate), scope

---

## 2. GET /api/interviews/:id

**Response: 200**
```json
{"success":true,"data":{"interview":{"id":"...","round":"business_first","status":"completed",...},"application":{"candidate":{"name":"陈书妍",...},"job":{"title":"媒介投放",...}},"interviewer":{"name":"孙面试官"},"feedback":{"scores":{"role_competency":4,...},"overallRecommendation":"STRONG_HIRE","evidence":"...",...},"qualitySignals":{"feedbackQualityScore":76,"qualityLevel":"good",...},"riskSignals":[...]}}
```

---

## 3. POST /api/interviews/:id/feedback (interviewer - own interview)

**Role:** interviewer (孙面试官)
**Request:**
```json
{"scores":{"role_competency":4,"business_understanding":4,"problem_solving":3,"communication":5,"ownership_collaboration":4,"motivation_stability":3},"overallRecommendation":"HIRE","evidenceText":"候选人具备良好的业务理解能力...","riskNotes":"需验证稳定性"}
```
**Response: 201**
```json
{"success":true,"data":{"feedback":{"id":"...","scores":{...},"overallRecommendation":"HIRE",...},"feedbackQualityScore":76}}
```
**ActivityLog:** INTERVIEW_FEEDBACK_SUBMITTED ✅

---

## 4. POST /api/interviews/:id/feedback (interviewer - unrelated interview)

**Role:** interviewer (孙面试官), target interview with interviewerId=李总监
**Response: 403**
```json
{"success":false,"error":"Permission denied: you can only submit feedback for your own interviews"}
```

---

## 5. POST /api/interviews/:id/feedback (business_owner)

**Role:** business_owner (赵业务)
**Response: 403**
```json
{"success":false,"error":"Permission denied: only the assigned interviewer, admin, or leader can submit feedback"}
```

---

## 6. Feedback Quality Scoring (Rule Engine)

Submitted feedback scored: **76/100** (qualityLevel: "good")

Breakdown:
- dimensionCompleteness: 20/20 (all 6 dimensions scored)
- evidenceSufficiency: 15/25 (evidence present but limited strong patterns)
- scoreEvidenceConsistency: 15/20 (avg score 3.8, evidence length adequate)
- recommendationClarity: 15/15 (HIRE specified)
- riskAwareness: 10/10 (riskNotes provided)
- timeliness: 1/10 (no completedAt on interview)
