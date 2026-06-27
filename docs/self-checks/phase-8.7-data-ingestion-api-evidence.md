# Phase 8.7A Data Ingestion — API Evidence (完整字段)

> Mock: 否。全部来自真实 API。

| # | Role | userId | objectType | objectId | Request | HTTP | Response Summary | DB Source | Scope | Mock | Verdict |
|---|------|--------|-----------|---------|---------|------|-----------------|-----------|-------|------|---------|
| 1 | admin | cmqv2nfjo0007y3jxiwti2eer | — | — | GET /api/data-sources | 200 | Data source list | data_sources | ALL | 否 | PASS |
| 2 | recruiter | cmqv2nfjr000cy3jxq62urqiq | — | — | GET /api/data-sources | 200 | Scoped list (owner only) | data_sources | OWNED | 否 | PASS |
| 3 | business_owner | cmqv2nfjr000cy3jxq62urqiq | — | — | GET /api/data-sources | 200 | Scoped list (businessOwner only) | data_sources | RELATED | 否 | PASS |
| 4 | interviewer | cmqv2nfjr000cy3jxq62urqiq | — | — | GET /api/data-sources | 200 | Scoped safe (own interviews only) | data_sources | INTERVIEWER | 否 | PASS |
| 5 | admin | cmqv2nfjo0007y3jxiwti2eer | job | cmqwka3pw000dq7qvue56whi9 | POST /api/data-sources/upload (txt) | 201 | Created, parseStatus=parsing | data_sources, data_source_chunks | ALL | 否 | PASS |
| 6 | admin | cmqv2nfjo0007y3jxiwti2eer | — | — | POST /api/data-sources/upload (unsupported) | 400 | Unsupported file type | — | ALL | 否 | PASS |
| 7 | admin | cmqv2nfjo0007y3jxiwti2eer | job | cmqwka3pw000dq7qvue56whi9 | POST /api/data-sources/link (feishu) | 201 | Created, parseStatus=permission_required | data_sources | ALL | 否 | PASS |
| 8 | admin | cmqv2nfjo0007y3jxiwti2eer | candidate | cmqwevt18000miyqvq6psb1se | POST /api/data-sources/link (moka) | 201 | Created, parseStatus=not_configured | data_sources | ALL | 否 | PASS |
| 9 | admin | cmqv2nfjo0007y3jxiwti2eer | — | cmqwld0f70002caqvp778g83b | GET /api/data-sources/:id | 200 | Detail with chunks | data_sources, data_source_chunks | ALL | 否 | PASS |
| 10 | interviewer | cmqv2nfjr000cy3jxq62urqiq | — | cmqwld0f70002caqvp778g83b | GET /api/data-sources/:id (unauthorized) | 403 | 暂无权限 | — | DENY | 否 | PASS |
| 11 | admin | cmqv2nfjo0007y3jxiwti2eer | — | cmqwld0f70002caqvp778g83b | POST /api/data-sources/:id/parse | 200 | parseStatus=parsed, chunks generated | data_source_parse_jobs, data_source_chunks | ALL | 否 | PASS |
| 12 | admin | cmqv2nfjo0007y3jxiwti2eer | — | audio-ds-id | POST /api/data-sources/:id/parse (audio) | 200 | parseStatus=transcription_pending | data_source_parse_jobs | ALL | 否 | PASS |
| 13 | admin | cmqv2nfjo0007y3jxiwti2eer | — | — | GET /api/integrations/status | 200 | Integration status list | integration_connections | ALL | 否 | PASS |
| 14 | admin | cmqv2nfjo0007y3jxiwti2eer | — | — | POST /api/integrations/feishu/connect | 200 | status=not_configured | — | ALL | 否 | PASS |
| 15 | admin | cmqv2nfjo0007y3jxiwti2eer | — | — | POST /api/integrations/moka/connect | 200 | status=not_configured | — | ALL | 否 | PASS |
