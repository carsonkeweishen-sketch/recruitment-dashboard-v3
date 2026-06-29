# Phase 8.14 Permission Evidence

| role | userId | objectId | request | HTTP | response | scope | leak fields | verdict |
|------|--------|----------|---------|------|----------|-------|-------------|---------|
| admin | user-admin | real-job | GET /api/jobs/:id | 200 | full job data | ALL | N/A | PASS |
| recruiter | user-recruiter-wang | owned-job | GET /api/jobs/:id | 200 | owner-related | OWNED | no | PASS |
| recruiter | user-recruiter-wang | not-owned | GET /api/jobs/:id | 403 | no object info | DENY | no | PASS |
| business_owner | user-biz-zhang | owned-job | GET /api/jobs/:id | 200 | own job | OWNED | no | PASS |
| business_owner | user-biz-zhang | not-owned | GET /api/jobs/:id | 403 | no object info | DENY | no | PASS |
| interviewer | user-interviewer | any-job | GET /api/jobs/:id | 403 | no job info | DENY | no | PASS |
| interviewer | user-interviewer | offer-risk | GET /api/offer-risks | 403 | forbidden | DENY | no | PASS |
| interviewer | user-interviewer | aiAssistant:analyze | POST /api/ai/copilot | 403 | permission denied | DENY | no | PASS |

## existing but unauthorized
- Object exists but user lacks scope → 403/404
- No object title, description, or fields leaked
- No 500 errors
