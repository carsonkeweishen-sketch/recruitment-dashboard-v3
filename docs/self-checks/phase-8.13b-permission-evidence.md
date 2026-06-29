# Phase 8.13B Permission Evidence (Object-Level)

| role | objectId | existing | expected | HTTP | response | object leak | verdict |
|------|----------|----------|----------|------|----------|-------------|---------|
| admin | real-job-1 | yes | 200 | 200 | full job data | N/A | PASS |
| recruiter | owned-job | yes | 200 | 200 | owner-related | no | PASS |
| recruiter | not-owned-job | yes | 403/404 | 403 | no object info | no | PASS |
| business_owner | owned-job | yes | 200 | 200 | own job | no | PASS |
| business_owner | not-owned-job | yes | 403/404 | 403 | no object info | no | PASS |
| interviewer | any-job | yes | 403 | 403 | no job info | no | PASS |
| interviewer | offer-risk | yes | 403 | 403 | forbidden | no | PASS |
| interviewer | aiAssistant:analyze | N/A | 403 | 403 | permission denied | no | PASS |
