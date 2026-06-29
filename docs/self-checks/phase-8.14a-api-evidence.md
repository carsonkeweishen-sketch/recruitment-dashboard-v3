# Phase 8.14A API Evidence

| method | URL | role | HTTP | response | DB | scope | mock | verdict |
|--------|-----|------|------|----------|-----|-------|------|---------|
| GET | /api/dashboard/summary | admin | 200 | jobs count, candidates empty | jobs | ALL | no | PASS |
| GET | /api/jobs | admin | 200 | 100 jobs, source_file present | jobs | ALL | no | PASS |
| GET | /api/jobs/:id | admin | 200 | jdText, source_file/sheet/row | jobs | ALL | no | PASS |
| GET | /api/knowledge/search?q=岗位 | admin | 200 | chunks from real JD/SOP | knowledge_chunks | ALL | no | PASS |
| POST | /api/ai/copilot | admin | 200 | answer + citation | ai_copilot_messages | ALL | no | PASS |
| POST | /api/ai/copilot (no evid) | admin | 200 | no_evidence, provider not_called | N/A | ALL | no | PASS |
| GET | /api/funnel | admin | 200 | stages, partial | applications | ALL | no | PASS |
| GET | /api/actions | admin | 200 | real or empty | action_items | ALL | no | PASS |
| GET | /api/data-sources | admin | 200 | real files | data_sources | ALL | no | PASS |
| GET | /api/integrations | admin | 200 | honest, writeback=false | data_sources | ALL | no | PASS |
