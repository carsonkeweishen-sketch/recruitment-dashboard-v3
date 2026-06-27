# Phase 8.7A Data Ingestion — API Evidence

> Mock: 否。全部来自真实 API。

## API Evidence (15条)

| # | Role | userId | Request | HTTP | Response | DB Source | Scope | Mock | Verdict |
|---|------|--------|---------|------|----------|-----------|-------|------|---------|
| 1 | admin | cmqv2nfjo0007y3jxiwti2eer | GET /api/data-sources | 200 | List | data_sources | ALL | 否 | PASS |
| 2 | recruiter | cmqv2nfjr000cy3jxq62urqiq | GET /api/data-sources | 200 | Scoped | data_sources | OWNED | 否 | PASS |
| 3 | business_owner | cmqv2nfjr000cy3jxq62urqiq | GET /api/data-sources | 200 | Scoped | data_sources | RELATED | 否 | PASS |
| 4 | interviewer | cmqv2nfjr000cy3jxq62urqiq | GET /api/data-sources | 200 | Scoped safe | data_sources | INTERVIEWER | 否 | PASS |
| 5 | admin | cmqv2nfjo0007y3jxiwti2eer | POST /api/data-sources/upload (txt) | 201 | Created, parsed | data_sources, data_source_chunks | ALL | 否 | PASS |
| 6 | admin | cmqv2nfjo0007y3jxiwti2eer | POST /api/data-sources/upload (unsupported) | 400 | Unsupported type | — | ALL | 否 | PASS |
| 7 | admin | cmqv2nfjo0007y3jxiwti2eer | POST /api/data-sources/link (feishu) | 201 | permission_required | data_sources | ALL | 否 | PASS |
| 8 | admin | cmqv2nfjo0007y3jxiwti2eer | POST /api/data-sources/link (moka) | 201 | not_configured | data_sources | ALL | 否 | PASS |
| 9 | admin | cmqv2nfjo0007y3jxiwti2eer | GET /api/data-sources/:id | 200 | Detail | data_sources | ALL | 否 | PASS |
| 10 | interviewer | cmqv2nfjr000cy3jxq62urqiq | GET /api/data-sources/:id (unauthorized) | 403 | 暂无权限 | — | DENY | 否 | PASS |
| 11 | admin | cmqv2nfjo0007y3jxiwti2eer | POST /api/data-sources/:id/parse | 200 | parsed | data_source_parse_jobs | ALL | 否 | PASS |
| 12 | admin | cmqv2nfjo0007y3jxiwti2eer | POST /api/data-sources/:id/parse (audio) | 200 | transcription_pending | data_source_parse_jobs | ALL | 否 | PASS |
| 13 | admin | cmqv2nfjo0007y3jxiwti2eer | GET /api/integrations/status | 200 | Status list | integration_connections | ALL | 否 | PASS |
| 14 | admin | cmqv2nfjo0007y3jxiwti2eer | POST /api/integrations/feishu/connect | 200 | not_configured | — | ALL | 否 | PASS |
| 15 | admin | cmqv2nfjo0007y3jxiwti2eer | POST /api/integrations/moka/connect | 200 | not_configured | — | ALL | 否 | PASS |
