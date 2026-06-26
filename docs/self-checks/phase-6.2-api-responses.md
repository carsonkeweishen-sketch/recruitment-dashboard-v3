# Phase 6.2 — API Response Evidence

> 测试服务器：Next.js dev @ localhost:3456
> Session Cookie：rd_dev_role / rd_dev_user_id / rd_dev_dept_id

---

## POST /api/interviews/:id/feedback

### TEST 1: Own interviewer submits feedback → 201

```text
role: interviewer
userId: cmqunojpw000c0brnlizkxkpf (孙面试官)
interviewId: cmquo2exi0000hyrnvmb8113h
payload: {
  scores: { role_competency:4, business_understanding:4, problem_solving:3, communication:5, ownership_collaboration:4, motivation_stability:3 },
  overallRecommendation: "HIRE",
  evidenceText: "候选人在KA渠道拓展中主导了多个项目...年度销售额达成3000万。",
  riskNotes: "需要进一步验证稳定性。",
  suggestedFollowUpQuestions: ["请补充项目数据结果。"]
}
HTTP status: 201
response summary: {
  success: true,
  data: {
    feedback: { id: "cmquoihdy0000x8rnti06ab3k", ... },
    quality: { score: 80, level: "good" },
    riskSignals: [2 signals detected]
  }
}
DB write: yes
ActivityLog: yes — INTERVIEW_FEEDBACK_SUBMITTED written
verdict: ✅ PASS
```

### TEST 2: Unrelated recruiter submits feedback → 403

```text
role: recruiter
userId: cmqunojpq000a0brnsq0ukhnw (王招聘)
interviewId: cmquoj0ao000096rnzw5tfrkb
payload: { scores:{...6 dims}, overallRecommendation:"HOLD", evidenceText:"..." }
HTTP status: 403
response summary: { success: false, error: "Only the assigned interviewer can submit feedback" }
DB write: no
ActivityLog: no
verdict: ✅ PASS
```

### TEST 3: Invalid body (missing scores) → 400

```text
role: interviewer
userId: cmqunojpw000c0brnlizkxkpf
payload: { overallRecommendation:"HIRE", evidenceText:"缺评分" }
HTTP status: 400
response summary: { success: false, error: "scores is required and must be an object" }
DB write: no
ActivityLog: no
verdict: ✅ PASS
```

### TEST 4: Duplicate submit → 409

```text
role: interviewer
userId: cmqunojpw000c0brnlizkxkpf
interviewId: cmquo2exi0000hyrnvmb8113h (already has feedback from T1)
payload: { scores:{...6 dims}, overallRecommendation:"HIRE", evidenceText:"..." }
HTTP status: 409
response summary: { success: false, error: "Feedback already submitted for this interview" }
DB write: no
ActivityLog: no
verdict: ✅ PASS
```

---

## GET /api/interviews/:id

### TEST 5: Authorized (own interview) → 200

```text
role: interviewer
userId: cmqunojpw000c0brnlizkxkpf (孙面试官)
request: GET /api/interviews/cmquo2exi0000hyrnvmb8113h
HTTP status: 200
verdict: ✅ PASS
```

### TEST 6: Unauthorized (nonexistent) → 404

```text
role: admin
request: GET /api/interviews/nonexistent-id
HTTP status: 404
verdict: ✅ PASS
```

---

## GET /api/jobs/:id/interview-signals

### TEST 7: Authorized (admin) — 3 consecutive runs

```text
role: admin
Run 1: HTTP 200
Run 2: HTTP 200
Run 3: HTTP 200
verdict: ✅ PASS — stable
```

---

## GET /api/interviewers/:id/quality-summary

### TEST 8: Admin access → 200

```text
role: admin
request: GET /api/interviewers/cmqunojpw000c0brnlizkxkpf/quality-summary
HTTP status: 200
response: { accessible: true, feedbackCount: 2, avgQuality: 0 }
verdict: ✅ PASS
```

### TEST 9: biz_owner denied → 403

```text
role: business_owner
request: GET /api/interviewers/cmqunojpw000c0brnlizkxkpf/quality-summary
HTTP status: 403
response: { success: false, error: "business_owner does not have access to interviewer quality summaries" }
verdict: ✅ PASS
```
