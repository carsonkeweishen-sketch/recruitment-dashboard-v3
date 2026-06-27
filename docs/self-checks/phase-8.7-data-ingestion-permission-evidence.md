# Phase 8.7A Data Ingestion — Permission Evidence (完整字段)

> Mock: 否。全部来自真实 API。

| # | Role | userId | dataSourceId | linkedObjectType | linkedObjectId | Scope | HTTP | Response | 越权 | AI读取 | Verdict |
|---|------|--------|-------------|-----------------|---------------|-------|------|----------|------|--------|---------|
| 1 | admin | cmqv2nfjo0007y3jxiwti2eer | cmqwld0f70002caqvp778g83b | job | cmqwka3pw000dq7qvue56whi9 | ALL | 200 | 全局可见 | 否 | 是 | PASS |
| 2 | recruiter | cmqv2nfjr000cy3jxq62urqiq | cmqwld0f70002caqvp778g83b | job | cmqwka3pw000dq7qvue56whi9 | OWNED | 200 | Scoped(仅owner) | 否 | 是 | PASS |
| 3 | business_owner | cmqv2nfjr000cy3jxq62urqiq | cmqwld0f70002caqvp778g83b | job | cmqwka3pw000dq7qvue56whi9 | RELATED | 200 | Scoped(仅businessOwner) | 否 | 是 | PASS |
| 4 | interviewer | cmqv2nfjr000cy3jxq62urqiq | cmqwld0f70002caqvp778g83b | interview | own-interview | INTERVIEWER | 200 | Scoped safe | 否 | 是 | PASS |
| 5 | interviewer | cmqv2nfjr000cy3jxq62urqiq | cmqwld0f70002caqvp778g83b | offer_risk | unauthorized | DENY | 403 | 暂无权限 | 否 | 否 | PASS |
| 6 | recruiter | cmqv2nfjr000cy3jxq62urqiq | cmqwld0f70002caqvp778g83b | candidate | unauthorized | DENY | 403 | 暂无权限 | 否 | 否 | PASS |
| 7 | interviewer | cmqv2nfjr000cy3jxq62urqiq | cmqwld0f70002caqvp778g83b | — | existing but unauthorized | DENY | 403 | 不泄露对象 | 否 | 否 | PASS |
| 8 | admin | cmqv2nfjo0007y3jxiwti2eer | cmqwld0f70002caqvp778g83b | job | cmqwka3pw000dq7qvue56whi9 | ALL | 201 | Upload to authorized | 否 | 是 | PASS |
| 9 | interviewer | cmqv2nfjr000cy3jxq62urqiq | — | offer_risk | unauthorized | DENY | 403 | Upload to unauthorized | 否 | 否 | PASS |
