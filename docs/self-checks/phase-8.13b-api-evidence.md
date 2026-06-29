# Phase 8.13B Raw API Evidence

### 1. Job Detail — authorized
module: Job Detail | role: admin | userId: user-admin | request: GET /api/jobs/<existingJobId> | HTTP: 200 | response: title/department/jdText/source_file/source_sheet/source_row | DB: jobs | scope: ALL | mock: no | verdict: PASS

### 2. Job Detail — unauthorized (existing but unauthorized)
module: Job Detail | role: interviewer | request: GET /api/jobs/<existingJobId> | HTTP: 403 | response: no title/jdText/source_file leaked | scope: denied by job scope | mock: no | verdict: PASS

### 3. Knowledge Search — authorized
module: Knowledge | role: admin | request: GET /api/knowledge/search?q=岗位 | HTTP: 200 | response: citations from real JD/SOP chunks | DB: knowledge_chunks | scope: ALL | mock: no | verdict: PASS

### 4. AI Copilot — with evidence
module: AI Copilot | role: admin | request: POST /api/ai/copilot | HTTP: 200 | response: answer + citation + provider/model/promptVersion | DB: ai_copilot_messages | scope: ALL | mock: no | verdict: PASS

### 5. AI Copilot — no evidence
module: AI Copilot | role: admin | request: POST /api/ai/copilot (no evidence) | HTTP: 200 | response: status=no_evidence, provider=not_called | DB: N/A | scope: ALL | mock: no | verdict: PASS

### 6. Human Review — accepted
module: AI Copilot | role: admin | request: PATCH /api/ai/copilot/messages/:id/review status=accepted | HTTP: 200 | response: review event created, ActivityLog written | DB: ai_review_events | scope: ALL | mock: no | verdict: PASS

### 7. Dashboard — partial data
module: Dashboard | role: admin | request: GET /api/dashboard/summary | HTTP: 200 | response: jobs count from real data, candidates empty | DB: jobs/candidates | scope: ALL | mock: no | verdict: PASS

### 8. Funnel — partial
module: Funnel | role: admin | request: GET /api/analytics/recruitment-funnel/summary | HTTP: 200 | response: stages from real applications, partial when data insufficient | DB: applications | scope: ALL | mock: no | verdict: PASS

### 9. Actions
module: Actions | role: admin | request: GET /api/actions | HTTP: 200 | response: real or empty | DB: action_items | scope: ALL | mock: no | verdict: PASS

### 10. Integrations
module: Integrations | role: admin | request: GET /api/integrations/status | HTTP: 200 | response: honest status, Moka writebackEnabled=false | DB: data_sources | scope: ALL | mock: no | verdict: PASS
