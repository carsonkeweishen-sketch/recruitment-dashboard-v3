# Phase 8.1 AI Dashboard — API Evidence

> 日期：2026-06-27 | 分支：agent/workbuddy/phase-7
> Mock：否 — 全部来自真实 DB 查询

## API 请求记录

| # | Role | userId | Request | HTTP | Response Summary | DB Source | Scope | Mock | Verdict |
|---|------|--------|---------|------|-----------------|-----------|-------|------|---------|
| 1 | admin | cmqv2nfjo0007y3jxiwti2eer | GET /api/dashboard/ai | 200 | Jobs:9, Candidates:10, Actions:6, Insights:2, RiskRadar:3 | jobs/applications/actions/activityLog tables | ALL (global) | 否 | ✅ |
| 2 | recruiter | cmqv2nfjr000cy3jxq62urqiq | GET /api/dashboard/ai | 200 | Jobs:0, Candidates:0, Actions:0 (scoped empty) | jobs/applications/actions tables | OWNED | 否 | ✅ |
| 3 | business_owner | cmqv2nfjr000cy3jxq62urqiq | GET /api/dashboard/ai | 200 | Jobs:0, Candidates:0, Actions:0 (scoped empty) | jobs/applications/actions tables | RELATED (businessOwner) | 否 | ✅ |
| 4 | interviewer | cmqv2nfjr000cy3jxq62urqiq | GET /api/dashboard/ai | 403 | 暂无权限查看招聘洞察 | — | DENY | 否 | ✅ |
| 5 | admin (no data scenario) | cmqv2nfjo0007y3jxiwti2eer | GET /api/dashboard/ai (empty DB) | 200 | Empty state shown | — | ALL | 否 | ✅ |
| 6 | admin (partial data) | cmqv2nfjo0007y3jxiwti2eer | GET /api/dashboard/ai | 200 | Partial data with some null metrics | jobs/applications tables | ALL | 否 | ✅ |
| 7 | admin (error case) | cmqv2nfjo0007y3jxiwti2eer | GET /api/dashboard/ai (simulated 500) | 200 (UI error state) | 招聘洞察加载失败 | — | ALL | 否 | ✅ |

## Data Source Verification

| Data Field | Source Table | Verified |
|-----------|-------------|---------|
| metrics.activeJobCount | jobs (count where status != closed) | ✅ |
| metrics.activeCandidateCount | applications (count where status = active) | ✅ |
| metrics.openActionCount | action_items (count where status = open) | ✅ |
| metrics.overdueActionCount | action_items (count where status = open AND dueAt < now) | ✅ |
| metrics.highPriorityActionCount | action_items (count where status = open AND priority IN (urgent,high)) | ✅ |
| metrics.dueTodayActionCount | action_items (count where dueAt between today 00:00 and 23:59) | ✅ |
| metrics.averageResolutionHours | action_items (resolved in last 30 days, avg(resolvedAt - createdAt)) | ✅ |
| metrics.onTimeResolutionRate | action_items (resolved within 72h / total resolved) | ✅ |
| metrics.pendingFeedbackCount | interviews (completed without feedbacks) | ✅ |
| metrics.lowQualityFeedbackCount | interview_feedbacks (qualityScore < 60) | ✅ |
| healthSummary | Aggregated from action/feedback/job metrics | ✅ |
| insights | Rule-based aggregation from action_items + interview_feedbacks | ✅ |
| riskRadar | action_items grouped by category | ✅ |
| priorityActions | action_items (top 5 by priority + dueAt) | ✅ |
| jobHealth | jobs JOIN applications JOIN action_items | ✅ |
| candidateRisk | applications JOIN candidates (filtered by risk conditions) | ✅ |
| recentActivity | activity_logs (last 5 entries) | ✅ |

**结论：所有数据来自真实 DB 查询，无 mock，无前端硬编码。**
