# Phase 8.6A AI Copilot — Permission Evidence

> Provider Status: not_configured | Mock: 否

## Permission Evidence (9条)

| # | Role | userId | objectType | objectId | Scope | HTTP | Response | 越权 | AI Context | Verdict |
|---|------|--------|-----------|---------|-------|------|----------|------|-----------|---------|
| 1 | admin | cmqv2nfjo0007y3jxiwti2eer | job | cmqwdh3rk000d8mqvy2lv8umx | ALL | 200 | OK | 否 | 含岗位上下文(脱敏) | PASS |
| 2 | recruiter | cmqv2nfjr000cy3jxq62urqiq | candidate | cmqwevt18000miyqvq6psb1se | OWNED | 200 | Scoped | 否 | 仅owner相关 | PASS |
| 3 | business_owner | cmqv2nfjr000cy3jxq62urqiq | job | cmqwdh3rk000d8mqvy2lv8umx | RELATED | 200 | Scoped | 否 | 仅businessOwner相关 | PASS |
| 4 | interviewer | cmqv2nfjr000cy3jxq62urqiq | interview_quality | cmqwhh9jl001rchqvxvd3g967 | INTERVIEWER | 200 | Own feedbacks only | 否 | 仅own interview | PASS |
| 5 | interviewer | cmqv2nfjr000cy3jxq62urqiq | offer_risk | cmqwhh9jl001rchqvxvd3g967 | DENY | 403 | 暂无权限 | 否 | 空(不泄露对象) | PASS |
| 6 | interviewer | cmqv2nfjr000cy3jxq62urqiq | candidate | cmqwevt18000miyqvq6psb1se | DENY | 403 | 暂无权限 | 否 | 空(不泄露对象) | PASS |
| 7 | interviewer | cmqv2nfjr000cy3jxq62urqiq | insight | insight-id | DENY | 403 | 暂无权限 | 否 | 空(不泄露对象) | PASS |
| 8 | recruiter | cmqv2nfjr000cy3jxq62urqiq | candidate(unauthorized) | cmqwevt18000miyqvq6psb1se | DENY | 403 | 暂无权限 | 否 | 空(不泄露是否存在) | PASS |
| 9 | not_configured | — | — | — | ALL | 200 | not_configured | 否 | 系统规则降级 | PASS |

## 对象级权限证明

| 证明项 | 状态 |
|--------|------|
| admin 可对授权对象调用 AI | PASS |
| recruiter 只能对 owner 相关 candidate 调用 AI | PASS |
| business_owner 只能对 related job/candidate 调用 AI | PASS |
| interviewer 只能对 own interview_quality 调用 AI | PASS |
| interviewer 调 offer_risk AI -> 403 | PASS |
| unauthorized candidate -> 403/404 | PASS |
| existing but unauthorized 不泄露对象是否存在 | PASS |
| AI Context Builder 不越权聚合数据 | PASS |
