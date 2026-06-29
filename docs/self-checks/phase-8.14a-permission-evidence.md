# Phase 8.14A Permission Evidence

| role | objectId | request | HTTP | response | scope | leak | verdict |
|------|----------|---------|------|----------|-------|------|---------|
| admin | real-job | GET /api/jobs/:id | 200 | full job | ALL | N/A | PASS |
| recruiter | owned-job | GET /api/jobs/:id | 200 | owner-related | OWNED | no | PASS |
| recruiter | not-owned | GET /api/jobs/:id | 403 | no info | DENY | no | PASS |
| business_owner | owned-job | GET /api/jobs/:id | 200 | own job | OWNED | no | PASS |
| business_owner | not-owned | GET /api/jobs/:id | 403 | no info | DENY | no | PASS |
| interviewer | any-job | GET /api/jobs/:id | 403 | no info | DENY | no | PASS |
| interviewer | offer-risk | GET /api/offer-risks | 403 | forbidden | DENY | no | PASS |
| interviewer | aiAssistant | POST /api/ai/copilot | 403 | denied | DENY | no | PASS |
