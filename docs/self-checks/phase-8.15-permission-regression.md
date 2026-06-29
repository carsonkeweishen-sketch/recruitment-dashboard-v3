# Phase 8.15 权限回归测试报告

**项目**: 理然智能招聘 AI 看板 (Recruitment Dashboard v3)  
**分支**: agent/workbuddy/phase-7  
**测试日期**: 2026-06-29

---

## 角色权限验证表

| # | Role | Object ID | Request | HTTP | Response | Scope | Leak | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | **admin** | job-042 | `GET /api/jobs/job-042` | 200 | 返回完整岗位详情（含 source_file/source_sheet/source_row） | Full access | — | **PASS** |
| 2 | **admin** | job-042 | `POST /api/ai/copilot` | 200 | AI 回复正常，可查看所有岗位上下文 | Full access | — | **PASS** |
| 3 | **admin** | job-042 | `GET /api/funnel` | 200 | 返回全部漏斗数据 | Full access | — | **PASS** |
| 4 | **admin** | job-042 | `GET /api/actions` | 200 | 返回全部 action_items | Full access | — | **PASS** |
| 5 | **recruiter** | job-042 (own) | `GET /api/jobs/job-042` | 200 | 返回岗位详情（recruiter-001 拥有此岗位） | Own jobs only | — | **PASS** |
| 6 | **recruiter** | job-088 (other) | `GET /api/jobs/job-088` | 403 | `{"error":"Forbidden","message":"您无权查看此岗位"}` | — | No leak | **PASS** |
| 7 | **recruiter** | job-088 (other) | `POST /api/ai/copilot` | 403 | `{"error":"Forbidden","message":"您无权访问此岗位的 AI 功能"}` | — | No leak | **PASS** |
| 8 | **business_owner** | job-015 (own) | `GET /api/jobs/job-015` | 200 | 返回岗位详情（business_owner-003 拥有此岗位） | Own jobs only | — | **PASS** |
| 9 | **business_owner** | job-073 (other) | `GET /api/jobs/job-073` | 403 | `{"error":"Forbidden","message":"您无权查看此岗位"}` | — | No leak | **PASS** |
| 10 | **business_owner** | job-073 (other) | `POST /api/ai/copilot` | 403 | `{"error":"Forbidden","message":"您无权访问此岗位的 AI 功能"}` | — | No leak | **PASS** |
| 11 | **interviewer** | job-021 | `GET /api/jobs/job-021` | 403 | `{"error":"Forbidden","message":"面试官无权查看岗位详情"}` | — | No leak | **PASS** |
| 12 | **interviewer** | candidate-001 | `GET /api/funnel` | 403 | `{"error":"Forbidden","message":"面试官无权查看漏斗数据"}` | — | No leak | **PASS** |
| 13 | **interviewer** | — | `POST /api/ai/copilot` | 403 | `{"error":"Forbidden","message":"面试官无权使用 AI Copilot"}` | — | No leak | **PASS** |
| 14 | **hrbp** | job-055 (own org) | `GET /api/jobs/job-055` | 200 | 返回岗位详情（限本组织内岗位） | Own org only | — | **PASS** |
| 15 | **hrbp** | job-099 (other org) | `GET /api/jobs/job-099` | 403 | `{"error":"Forbidden","message":"HRBP 无权查看此组织的岗位"}` | — | No leak | **PASS** |
| 16 | **hrbp** | job-055 (own org) | `GET /api/funnel` | 200 | 返回本组织漏斗数据 | Own org only | — | **PASS** |
| 17 | **hrbp** | job-099 (other org) | `GET /api/funnel` | 403 | `{"error":"Forbidden","message":"HRBP 无权查看此组织的漏斗数据"}` | — | No leak | **PASS** |

---

## 权限矩阵总结

| 角色 | Dashboard | Job Detail (own) | Job Detail (other) | AI Copilot | Funnel | Actions | Offer Risk |
|---|---|---|---|---|---|---|---|
| **admin** | Full | Full | Full | Full | Full | Full | Full |
| **recruiter** | Limited | View | 403 | Own only | Own only | Own only | View |
| **business_owner** | Limited | View | 403 | Own only | Own only | Own only | View |
| **interviewer** | Limited | 403 | 403 | 403 | 403 | Limited | 403 |
| **hrbp** | Limited | View (org) | 403 | Org only | Org only | Org only | View |

---

## 回归结论

| 指标 | 结果 |
|---|---|
| 总测试场景 | 17 |
| 通过 | 17 |
| 失败 | 0 |
| 权限泄露 | 0 |
| 权限回归通过率 | 100% |

### 关键说明

1. **横向越权防护**: recruiter 和 business_owner 无法访问非自有岗位，返回 403。
2. **纵向越权防护**: interviewer 无法访问岗位详情、漏斗、AI Copilot，权限最低。
3. **组织隔离**: HRBP 仅可访问所属组织的岗位和数据，跨组织请求返回 403。
4. **admin 全权限**: admin 角色可访问所有资源，用于演示和系统管理。
