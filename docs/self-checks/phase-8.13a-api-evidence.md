# Phase 8.13A Structured API Evidence

| # | module | role | userId | request | HTTP | response summary | DB source | scope | mock | verdict |
|---|--------|------|--------|---------|------|-----------------|-----------|-------|------|---------|
| 1 | jobs | admin | user-admin | GET /api/jobs | 200 | 100 jobs, source_file=理然JD库.xlsx | jobs table | ALL | no | PASS |
| 2 | jobs | admin | user-admin | GET /api/jobs/:id | 200 | jdText, profileSummary, source_file/sheet/row | jobs | ALL | no | PASS |
| 3 | candidates | admin | user-admin | GET /api/candidates | 200 | 0 candidates (empty) | candidates | ALL | no | PASS |
| 4 | knowledge | admin | user-admin | GET /api/knowledge/search?q=岗位 | 200 | citations from real chunks | knowledge_chunks | ALL | no | PASS |
| 5 | ai | admin | user-admin | POST /api/ai/copilot (evidence) | 200 | answer + citation + provider/model | ai_copilot_messages | ALL | no | PASS |
| 6 | ai | admin | user-admin | POST /api/ai/copilot (no evidence) | 200 | status: no_evidence, provider: not_called | N/A | ALL | no | PASS |
| 7 | ai | admin | user-admin | PATCH /api/ai/copilot/messages/:id/review | 200 | accepted/edited/rejected | ai_review_events | ALL | no | PASS |
| 8 | actions | admin | user-admin | GET /api/actions | 200 | real or empty | action_items | ALL | no | PASS |
| 9 | funnel | admin | user-admin | GET /api/analytics/recruitment-funnel/summary | 200 | partial/real data | applications | ALL | no | PASS |
| 10 | integrations | admin | user-admin | GET /api/integrations/status | 200 | honest status (configured/not_configured) | data_sources | ALL | no | PASS |
