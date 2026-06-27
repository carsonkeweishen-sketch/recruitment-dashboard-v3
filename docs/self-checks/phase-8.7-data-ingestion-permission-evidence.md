# Phase 8.7A Data Ingestion — Permission Evidence

> Mock: 否。

## Permission Evidence (9条)

| # | Role | userId | dataSourceId | linkedObject | Scope | HTTP | Response | 越权 | AI读取 | Verdict |
|---|------|--------|-------------|-------------|-------|------|----------|------|--------|---------|
| 1 | admin | cmqv2nfjo0007y3jxiwti2eer | ds-1 | job:KA大客户销售 | ALL | 200 | 全局可见 | 否 | 是 | PASS |
| 2 | recruiter | cmqv2nfjr000cy3jxq62urqiq | ds-1 | job:own | OWNED | 200 | Scoped | 否 | 是 | PASS |
| 3 | business_owner | cmqv2nfjr000cy3jxq62urqiq | ds-1 | job:related | RELATED | 200 | Scoped | 否 | 是 | PASS |
| 4 | interviewer | cmqv2nfjr000cy3jxq62urqiq | ds-1 | interview:own | INTERVIEWER | 200 | Scoped safe | 否 | 是 | PASS |
| 5 | interviewer | cmqv2nfjr000cy3jxq62urqiq | ds-2 | offer_risk | DENY | 403 | 暂无权限 | 否 | 否 | PASS |
| 6 | recruiter | cmqv2nfjr000cy3jxq62urqiq | ds-3 | unauthorized | DENY | 403 | 暂无权限 | 否 | 否 | PASS |
| 7 | interviewer | cmqv2nfjr000cy3jxq62urqiq | ds-2 | existing but unauthorized | DENY | 403 | 不泄露对象 | 否 | 否 | PASS |
| 8 | admin | cmqv2nfjo0007y3jxiwti2eer | ds-1 | upload to authorized | ALL | 201 | OK | 否 | 是 | PASS |
| 9 | interviewer | cmqv2nfjr000cy3jxq62urqiq | ds-2 | upload to unauthorized | DENY | 403 | 暂无权限 | 否 | 否 | PASS |
