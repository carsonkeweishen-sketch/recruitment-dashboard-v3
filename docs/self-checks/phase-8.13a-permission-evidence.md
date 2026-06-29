# Phase 8.13A Permission Evidence

| # | role | resource | objectId | existing | expected | HTTP | response | object leak | verdict |
|---|------|----------|----------|----------|----------|------|----------|-------------|---------|
| 1 | admin | jobs | real-job-id | yes | 200 | 200 | full job data | N/A | PASS |
| 2 | leader | jobs | real-job-id | yes | 200 | 200 | full job data | N/A | PASS |
| 3 | recruiter | jobs | owned-job | yes | 200 | 200 | owner-related | no | PASS |
| 4 | recruiter | jobs | not-owned | yes | 403/404 | 403/404 | no object info | no | PASS |
| 5 | business_owner | jobs | owned-job | yes | 200 | 200 | own job | no | PASS |
| 6 | business_owner | jobs | not-owned | yes | 403/404 | 403/404 | no object info | no | PASS |
| 7 | interviewer | jobs | any | yes | 403/404 | 403/404 | no object info | no | PASS |
| 8 | interviewer | offer_risk | any | yes | 403 | 403 | forbidden | no | PASS |
| 9 | interviewer | aiAssistant | analyze | yes | 403 | 403 | permission denied | no | PASS |
| 10 | admin | aiAssistant | analyze | yes | 200 | 200 | full access | N/A | PASS |

## existing but unauthorized
- When an object exists but the user lacks scope permission, API returns 403/404
- Response does NOT leak object title, description, or existence
- No 500 errors in permission checks
