# Phase 8.14 API Evidence

| method | URL | role | userId | HTTP | response summary | DB source | scope | mock | verdict |
|--------|-----|------|--------|------|-----------------|-----------|-------|------|---------|
| GET | /api/dashboard/summary | admin | user-admin | 200 | jobs count, candidates empty | jobs/candidates | ALL | no | PASS |
| GET | /api/jobs | admin | user-admin | 200 | 100 jobs, source_file present | jobs | ALL | no | PASS |
| GET | /api/jobs/:id | admin | user-admin | 200 | jdText, profileSummary, source_file/sheet/row | jobs | ALL | no | PASS |
| GET | /api/knowledge/search?q=岗位 | admin | user-admin | 200 | chunks from real JD/SOP | knowledge_chunks | ALL | no | PASS |
| POST | /api/ai/copilot | admin | user-admin | 200 | answer + citation + provider/model | ai_copilot_messages | ALL | no | PASS |
| POST | /api/ai/copilot (no evidence) | admin | user-admin | 200 | status: no_evidence, provider: not_called | N/A | ALL | no | PASS |
| GET | /api/funnel | admin | user-admin | 200 | stages, partial when data insufficient | applications | ALL | no | PASS |
| GET | /api/actions | admin | user-admin | 200 | real or empty | action_items | ALL | no | PASS |
| GET | /api/data-sources | admin | user-admin | 200 | real files with parse status | data_sources | ALL | no | PASS |
| GET | /api/integrations | admin | user-admin | 200 | honest status, writebackEnabled=false | data_sources | ALL | no | PASS |
