# Phase 6 — Structured Interview Feedback & Quality Report

## 1. Branch & HEAD

- **Branch:** agent/workbuddy/phase-6
- **Based on:** agent/workbuddy/phase-5 (e9e1413)

## 2. Schema Changes

**No Schema changes.** Existing `Interview` + `InterviewFeedback` models are sufficient for Phase 6.

## 3. Modified/New Files

### New Files (17)
```
app/api/interviews/route.ts
app/api/interviews/[id]/route.ts
app/api/interviews/[id]/feedback/route.ts
app/api/jobs/[id]/interview-signals/route.ts
app/api/interviewers/[id]/quality-summary/route.ts
app/interviews/page.tsx
components/domain/interviews/InterviewList.tsx
components/domain/interviews/InterviewDetailDrawer.tsx
components/domain/interviews/InterviewFeedbackForm.tsx
server/repositories/interview/interview-repository.ts
server/repositories/interview/interview-feedback-repository.ts
server/services/interview/interview-service.ts
server/services/interview/interview-quality-service.ts
server/services/interview/interview-risk-signal-service.ts
server/services/interview/interviewer-quality-service.ts
server/services/interview/activity-log-helper.ts
scripts/phase-6-screenshots.ts
```

### Modified Files (1)
```
components/layout/Sidebar.tsx — enabled 面试反馈 nav item
```

## 4. Interview API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/interviews | GET | List interviews (scope-filtered) + metrics |
| /api/interviews/:id | GET | Interview detail + feedback + quality + risk |
| /api/interviews/:id/feedback | POST | Submit structured feedback |
| /api/jobs/:id/interview-signals | GET | Job interview quality + risk signals |
| /api/interviewers/:id/quality-summary | GET | Interviewer feedback quality summary |

## 5. Feedback Quality Scoring Rules

Rule engine (no AI), score 0-100:

| Dimension | Max | Rule |
|-----------|-----|------|
| 维度完整度 | 20 | 6 core dimensions scored |
| 证据充分度 | 25 | Evidence length + strong patterns (项目/数据/案例) - weak patterns (感觉不错/还可以) |
| 评分证据一致性 | 20 | High scores require strong evidence; low scores with long evidence flagged |
| 推荐结论清晰度 | 15 | Recommendation specified (STRONG_HIRE/HIRE/HOLD/NO_HIRE/STRONG_NO_HIRE) |
| 风险意识 | 10 | Risk notes provided |
| 反馈及时性 | 10 | Submitted within 24h of interview completion |

Quality levels: excellent(85-100), good(70-84), needs_improvement(50-69), insufficient(0-49)

## 6. Interview Risk Signal Rules

9 detection rules:

1. communication>=4 & role_competency<=3 → 表达强但证据弱风险
2. HIRE/STRONG_HIRE & evidence<50 chars → 能力证据不足风险
3. 3+ dimensions>=4 & weak evidence only → 能力证据不足风险 (high)
4. HIRE/STRONG_HIRE & no risk notes → 高分候选人缺少风险记录
5. Cross-round score deviation >=2 → 多轮面试评分偏差

Risk levels: low/medium/high. Suggestions only, no auto-action.

## 7. Interviewer Quality Metrics

| Metric | Calculation |
|--------|-------------|
| feedbackCompletionRate | submitted / completed interviews |
| feedbackOnTimeRate | on-time submissions / total |
| avgFeedbackQualityScore | average of quality scores |
| evidenceSufficiencyRate | feedbacks with evidence>=15 / total |

All suggestions are constructive, no ranking/羞辱.

## 8. Permission Matrix

| Role | View Interviews | Submit Feedback | View Quality | View Interviewer Quality |
|------|----------------|-----------------|-------------|------------------------|
| admin | ALL | ✅ | ALL | ALL |
| leader | ALL | ✅ | ALL | ALL |
| hrbp | DEPARTMENT | ❌ | DEPARTMENT | DEPARTMENT |
| recruiter | OWNED | ❌ | OWNED | OWNED |
| business_owner | RELATED | ❌ | RELATED | ❌ |
| interviewer | Own only | Own only | Own only | ❌ |

## 9. Permission Test Results

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| interviewer submit own feedback | 201 | 201 | ✅ |
| interviewer submit unrelated | 403 | 403 | ✅ |
| biz_owner submit feedback | 403 | 403 | ✅ |
| admin view all | 200 | 200 | ✅ |

## 10. ActivityLog

| Action | Written |
|--------|---------|
| INTERVIEW_FEEDBACK_SUBMITTED | ✅ (interviewId, applicationId, candidateId, jobId, overallRecommendation, feedbackQualityScore) |

## 11. Hardcode / Mock / Adapter

| Check | Result |
|-------|--------|
| mockInterview/demoInterview | 0 matches |
| 候选人A/测试面试/王招聘/赵业务 in app/components/server | 0 matches |
| OpenAI/DeepSeek/Moka/Feishu | 0 matches |

All names come from DB (candidate.name, interviewer.name, job.title).

## 12. UI Screenshots (12)

| Screenshot | Status |
|-----------|--------|
| interviews-page-success.png | ✅ |
| interview-detail-drawer-overview.png | ✅ |
| interview-feedback-form.png | ✅ |
| feedback-quality-signals.png | ✅ |
| interview-risk-signals.png | ✅ |
| interviewer-submit-denied-unrelated.png | ✅ |
| business-owner-interview-view.png | ✅ |
| hrbp-department-interview-view.png | ✅ |
| feedback-empty.png | ✅ |
| feedback-loading.png | ✅ |
| feedback-error.png | ✅ |
| interviewer-permission-denied.png | ✅ |

## 13. Page States

| State | Covered |
|-------|---------|
| Loading | ✅ |
| Empty | ✅ |
| Error | ✅ |
| PermissionDenied | ✅ |
| Success | ✅ |
| Form validation | ✅ |

## 14. Build Verification

| Check | Result |
|-------|--------|
| typecheck | 0 errors |
| lint | 0 errors, 0 warnings |
| build | PASS |
| git status | Clean |

## Final Conclusion

| Item | Status |
|------|--------|
| Phase 6 是否完成 | 是 |
| 结构化面试反馈是否完成 | 是 |
| 反馈质量评分是否完成 | 是 |
| 面试表现偏差风险是否完成 | 是 |
| 面试官质量评估基础是否完成 | 是 |
| 权限是否通过 | 是 |
| ActivityLog 是否通过 | 是 |
| 是否建议进入 Phase 7 | 等待外部审查 |
| 是否自行进入 Phase 7 | 否 |
| 当前风险 | interviewer-quality-summary 和 job-interview-quality-tab 截图因需要特定数据场景未单独截取（功能代码已实现） |
| 需要外部确认 | 1) 质量评分规则权重 2) 风险检测规则覆盖 3) 权限矩阵 |
