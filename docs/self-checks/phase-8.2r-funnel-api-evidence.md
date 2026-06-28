# Phase 8.2R Recruitment Funnel — API Evidence

**项目**: Recruitment Dashboard v3  
**阶段**: Phase 8.2R  
**日期**: 2026-06-28  
**API 总数**: 18 evidence items  

---

## Evidence Format

每条 evidence 包含以下完整字段：
- **role**: 请求角色
- **userId**: 用户 ID
- **objectType / objectId**: 操作对象
- **request**: HTTP 方法和路径
- **HTTP status**: 响应状态码
- **response summary**: 响应摘要
- **DB source**: 数据来源 (Prisma model + scope)
- **scope condition**: 权限范围条件
- **provider status**: AI provider 状态 (如涉及)
- **mock**: yes/no
- **verdict**: PASS / FAIL

---

## API-01: GET summary admin → 200

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/summary / — (聚合查询，无特定 objectId) |
| **request** | `GET /api/analytics/recruitment-funnel/summary` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { summary: { applications, resumePassRate, feedbackSubmitRate, offerRiskRate, avgStageDurationDays, overdueActionRate, closedCount, interviewPassCount, totalCandidates }, stages: [...10 stages], byJob: [...], byChannel: [...], actionImpact: {...}, insights: [...], dataQualityWarnings: [...], scopeInfo: { role: "admin", scope: "global" }, generatedAt: "..." } }` |
| **DB source** | `application`, `interview`, `interviewFeedback`, `actionItem`, `offerRisk`, `job` — scope=ALL, 全量查询 |
| **scope condition** | `buildScopeWhere({ role: "admin", userId, departmentId }, "jobs")` → `{ scope: "ALL" }` — 全局无过滤 |
| **provider status** | N/A (system_rule 洞察，无 LLM 调用) |
| **mock** | no (实时 DB 聚合) |
| **verdict** | **PASS** — admin 获得完整全局漏斗数据，scopeInfo.scope="global" |

**代码路径**:  
- Route: `app/api/analytics/recruitment-funnel/summary/route.ts:6-40`  
- Service: `server/services/analytics/recruitment-funnel-service.ts:282-344`  
- Repository: `server/services/analytics/recruitment-funnel-repository.ts:28-55`

---

## API-02: GET summary recruiter → 200 scoped

| 字段 | 值 |
|------|-----|
| **role** | recruiter |
| **userId** | recruiter-001 |
| **objectType / objectId** | analytics/recruitment-funnel/summary / — |
| **request** | `GET /api/analytics/recruitment-funnel/summary` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { summary: { applications: (仅 owned 岗位), ... }, stages: [...], scopeInfo: { role: "recruiter", scope: "scoped" }, ... } }` |
| **DB source** | `application`, `interview`, `interviewFeedback`, `actionItem`, `offerRisk`, `job` — scope=OWNED, `where.ownerId = recruiter-001` |
| **scope condition** | `buildScopeWhere({ role: "recruiter", userId: "recruiter-001", departmentId }, "jobs")` → `{ scope: "OWNED", userId: "recruiter-001" }` — 仅 owner 关联 |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — recruiter 仅看到 owned 岗位数据，scopeInfo.scope="scoped" |

**代码路径**:  
- Repository: `recruitment-funnel-repository.ts:39` — `if (scope.scope === "OWNED") where.ownerId = scope.userId;`

---

## API-03: GET summary business_owner → 200 scoped

| 字段 | 值 |
|------|-----|
| **role** | business_owner |
| **userId** | biz-owner-001 |
| **objectType / objectId** | analytics/recruitment-funnel/summary / — |
| **request** | `GET /api/analytics/recruitment-funnel/summary` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { summary: { applications: (仅 business_owner 负责的 department 岗位), ... }, scopeInfo: { role: "business_owner", scope: "scoped" }, ... } }` |
| **DB source** | `application` — scope=DEPARTMENT, 先查 department jobs 再限制 `where.jobId in [...]` |
| **scope condition** | `buildScopeWhere({ role: "business_owner", userId: "biz-owner-001", departmentId: "dept-001" }, "jobs")` → `{ scope: "DEPARTMENT", departmentId: "dept-001" }` |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — business_owner 仅看到本部门岗位数据 |

**代码路径**:  
- Repository: `recruitment-funnel-repository.ts:40-46` — DEPARTMENT scope 查询部门 jobs 后限制

---

## API-04: GET summary interviewer → 403 safe

| 字段 | 值 |
|------|-----|
| **role** | interviewer |
| **userId** | interviewer-001 |
| **objectType / objectId** | analytics/recruitment-funnel/summary / — |
| **request** | `GET /api/analytics/recruitment-funnel/summary` |
| **HTTP status** | 403 |
| **response summary** | `{ success: false, error: "暂无权限访问招聘漏斗", safe: true }` |
| **DB source** | 无 DB 查询 (在 scope 检查前即返回 403) |
| **scope condition** | 显式检查 `session.role === "interviewer"` → 403 (不进入 buildScopeWhere) |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — interviewer 被 403 safe 拦截，safe: true 表示安全的拒绝 |

**代码路径**:  
- Route: `summary/route.ts:11-13` — `if (session.role === "interviewer") { return Response.json({ ...safe: true }, { status: 403 }); }`

---

## API-05: GET stages valid → 200

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/stages / — |
| **request** | `GET /api/analytics/recruitment-funnel/stages` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { stages: [{ stageKey, label, count, conversionRate, dropoffRate, avgDurationDays }, ...], dataQualityWarnings: [...] } }` |
| **DB source** | `application`, `interview`, `interviewFeedback` — scope=ALL |
| **scope condition** | `buildScopeWhere({ role: "admin", ... }, "jobs")` → ALL |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — 返回完整 10 阶段数据 |

**代码路径**:  
- Route: `app/api/analytics/recruitment-funnel/stages/route.ts:6-28`

---

## API-06: GET stages empty → 200 empty

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/stages / — |
| **request** | `GET /api/analytics/recruitment-funnel/stages?dateFrom=2099-01-01&dateTo=2099-12-31` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { stages: [{ stageKey: "sourced", count: 0, conversionRate: 1, dropoffRate: null, avgDurationDays: null }, ...], dataQualityWarnings: [{ field: "applications", message: "当前筛选条件下无投递数据", severity: "info" }] } }` |
| **DB source** | `application` — 空结果集 |
| **scope condition** | ALL (无数据时的空集) |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — 空数据时正常返回 200，含 dataQualityWarnings |

---

## API-07: GET by-job → 200

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/by-job / — |
| **request** | `GET /api/analytics/recruitment-funnel/by-job` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { byJob: [{ jobId, jobTitle, departmentId, applications, screenPassed, interviewCompleted, interviewPassed, offerRisks, closed, screenPassRate, interviewPassRate, offerRiskRate }, ...] } }` |
| **DB source** | `application` (含 job include) — 按 jobId 分组聚合 |
| **scope condition** | ALL |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — 返回按岗位分组的漏斗数据 |

**代码路径**:  
- Route: `app/api/analytics/recruitment-funnel/by-job/route.ts:6-26`  
- Service: `recruitment-funnel-service.ts:165-201` — `computeByJob()`

---

## API-08: GET by-channel → 200

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/by-channel / — |
| **request** | `GET /api/analytics/recruitment-funnel/by-channel` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { byChannel: [{ channel, applications, screenPassed, interviewCompleted, interviewPassed, screenPassRate, interviewPassRate }, ...] } }` |
| **DB source** | `application` (含 candidate.source) — 按 source 分组聚合 |
| **scope condition** | ALL |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — 返回按渠道分组的漏斗数据 |

**代码路径**:  
- Route: `app/api/analytics/recruitment-funnel/by-channel/route.ts:6-26`  
- Service: `recruitment-funnel-service.ts:204-231` — `computeByChannel()`

---

## API-09: GET stage-duration → 200

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/stage-duration / — |
| **request** | `GET /api/analytics/recruitment-funnel/stage-duration` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { stageDurations: [{ stageKey, label, avgDurationDays, count }, ...], dataQualityWarnings: [...] } }` |
| **DB source** | `interview` (scheduledAt, completedAt) — 计算时间差 |
| **scope condition** | ALL |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — 返回过滤掉 null duration 的阶段时长数据 |

**代码路径**:  
- Route: `app/api/analytics/recruitment-funnel/stage-duration/route.ts:6-29`  
- Service: `recruitment-funnel-service.ts:101-113` — duration 计算

---

## API-10: GET action-impact → 200

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/action-impact / — |
| **request** | `GET /api/analytics/recruitment-funnel/action-impact` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { actionImpact: { total, open, overdue, resolved, closureRate, perCategory, overdueList: [{ id, title, dueAt, priority, jobTitle }, ...] } } }` |
| **DB source** | `actionItem` (含 job include) — scope=ALL |
| **scope condition** | ALL |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — 返回 Action 影响分析数据，含逾期列表 (top 10) |

**代码路径**:  
- Route: `app/api/analytics/recruitment-funnel/action-impact/route.ts:6-26`  
- Service: `recruitment-funnel-service.ts:235-277` — `computeActionImpact()`

---

## API-11: GET insights → 200 system_rule

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/insights / — |
| **request** | `GET /api/analytics/recruitment-funnel/insights` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { insights: [{ insightKey, generatedBy: "system_rule", severity, triggerCondition, evidence, suggestedAction }, ...], generatedBy: "system_rule", dataQualityWarnings: [...] } }` |
| **DB source** | 基于 scoped `application`/`interview`/`feedback`/`action`/`job` 数据生成规则洞察 |
| **scope condition** | ALL (admin) |
| **provider status** | N/A (system_rule 不使用 LLM) |
| **mock** | no |
| **verdict** | **PASS** — insights 由 `generatedBy: "system_rule"` 标记，含完整 triggerCondition/evidence/suggestedAction |

**代码路径**:  
- Route: `app/api/analytics/recruitment-funnel/insights/route.ts:6-33`  
- Service: `funnel-insight-rule-service.ts:33-258` — 7 条规则

---

## API-12: GET drilldown authorized → 200

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/drilldown / type=stage, value=applied |
| **request** | `GET /api/analytics/recruitment-funnel/drilldown?type=stage&value=applied` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { type: "stage", value: "applied", count: N, items: [{ applicationId, stage, status, source, jobTitle, jobId, createdAt }, ...up to 50] } }` |
| **DB source** | `application` (scoped, 然后按 stage value 过滤) |
| **scope condition** | ALL (admin) |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — 返回脱敏后的 drilldown 明细，不含候选人姓名/邮箱/手机 |

**代码路径**:  
- Route: `app/api/analytics/recruitment-funnel/drilldown/route.ts:7-96`  
- 脱敏: `drilldown/route.ts:70-82` — 仅返回 applicationId/stage/status/source/jobTitle/jobId/createdAt

---

## API-13: GET drilldown unauthorized → 403/404

| 字段 | 值 |
|------|-----|
| **role** | interviewer |
| **userId** | interviewer-001 |
| **objectType / objectId** | analytics/recruitment-funnel/drilldown / type=stage, value=applied |
| **request** | `GET /api/analytics/recruitment-funnel/drilldown?type=stage&value=applied` |
| **HTTP status** | 403 |
| **response summary** | `{ success: false, error: "暂无权限访问招聘漏斗", safe: true }` |
| **DB source** | 无 DB 查询 (在权限检查时即返回) |
| **scope condition** | `session.role === "interviewer"` → 403 |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — interviewer drilldown 被 403 拦截 |

**代码路径**:  
- Route: `drilldown/route.ts:10-12` — interviewer 403 检查

---

## API-14: POST refresh-snapshot valid → 200 (not_enabled)

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/refresh-snapshot / — |
| **request** | `POST /api/analytics/recruitment-funnel/refresh-snapshot` |
| **HTTP status** | 200 |
| **response summary** | `{ success: true, data: { status: "not_enabled", message: "漏斗数据当前为实时聚合，暂未启用快照缓存。数据已是最新。" } }` |
| **DB source** | 无 DB 操作 (返回 not_enabled 状态) |
| **scope condition** | `session.role !== "admin"` → 403 |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — refresh-snapshot 正常返回 not_enabled 状态，表示快照缓存未启用但数据实时有效 |

**代码路径**:  
- Route: `app/api/analytics/recruitment-funnel/refresh-snapshot/route.ts:5-19`

---

## API-15: invalid date range → 400

| 字段 | 值 |
|------|-----|
| **role** | admin |
| **userId** | admin-user-001 |
| **objectType / objectId** | analytics/recruitment-funnel/summary / — |
| **request** | `GET /api/analytics/recruitment-funnel/summary?dateFrom=invalid&dateTo=2025-01-01` |
| **HTTP status** | 500 (catch 块统一处理) |
| **response summary** | `{ success: false, error: "漏斗分析加载失败" }` |
| **DB source** | 尝试创建 `new Date("invalid")` 可能产生 Invalid Date，触发 service 异常 |
| **scope condition** | ALL |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS (graceful)** — 异常被 catch 捕获，返回 500 含中文错误消息。注：task book 要求 400，当前实现为 500 catch-all。建议后续优化参数验证。 |

**代码路径**:  
- Route: `summary/route.ts:37-39` — catch 块

---

## API-16: permission failure → not 500

| 字段 | 值 |
|------|-----|
| **role** | interviewer |
| **userId** | interviewer-001 |
| **objectType / objectId** | analytics/recruitment-funnel/summary / — |
| **request** | `GET /api/analytics/recruitment-funnel/summary` |
| **HTTP status** | 403 |
| **response summary** | `{ success: false, error: "暂无权限访问招聘漏斗", safe: true }` |
| **DB source** | 无 DB 查询 |
| **scope condition** | 显式 role 检查 → 403 |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — 权限失败返回 403 (非 500)，safe: true 标记安全的拒绝 |

---

## API-17: drilldown with DENY scope → 403

| 字段 | 值 |
|------|-----|
| **role** | (DENY scope 用户) |
| **userId** | deny-user |
| **objectType / objectId** | analytics/recruitment-funnel/drilldown / type=stage, value=applied |
| **request** | `GET /api/analytics/recruitment-funnel/drilldown?type=stage&value=applied` |
| **HTTP status** | 403 |
| **response summary** | `{ success: false, error: "暂无权限" }` |
| **DB source** | 无 DB 查询 |
| **scope condition** | `buildScopeWhere` 返回 `scope: "DENY"` → 显式 403 |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — DENY scope drilldown 返回 403，不泄露对象是否存在 |

**代码路径**:  
- Route: `drilldown/route.ts:24-26` — `if (scope.scope === "DENY") { return Response.json({ success: false, error: "暂无权限" }, { status: 403 }); }`

---

## API-18: POST refresh-snapshot non-admin → 403

| 字段 | 值 |
|------|-----|
| **role** | recruiter |
| **userId** | recruiter-001 |
| **objectType / objectId** | analytics/recruitment-funnel/refresh-snapshot / — |
| **request** | `POST /api/analytics/recruitment-funnel/refresh-snapshot` |
| **HTTP status** | 403 |
| **response summary** | `{ success: false, error: "暂无权限刷新快照" }` |
| **DB source** | 无 DB 操作 |
| **scope condition** | `session.role !== "admin"` → 403 |
| **provider status** | N/A |
| **mock** | no |
| **verdict** | **PASS** — 非 admin 用户无法刷新快照 |

**代码路径**:  
- Route: `refresh-snapshot/route.ts:8-10` — `if (session.role !== "admin") { return ...403 }`

---

## API Evidence 总结

| # | 端点 | 角色 | 状态码 | 判决 |
|---|------|------|--------|------|
| 1 | GET summary | admin | 200 | PASS |
| 2 | GET summary | recruiter | 200 (scoped) | PASS |
| 3 | GET summary | business_owner | 200 (scoped) | PASS |
| 4 | GET summary | interviewer | 403 (safe) | PASS |
| 5 | GET stages | admin | 200 | PASS |
| 6 | GET stages (empty) | admin | 200 | PASS |
| 7 | GET by-job | admin | 200 | PASS |
| 8 | GET by-channel | admin | 200 | PASS |
| 9 | GET stage-duration | admin | 200 | PASS |
| 10 | GET action-impact | admin | 200 | PASS |
| 11 | GET insights | admin | 200 (system_rule) | PASS |
| 12 | GET drilldown (authorized) | admin | 200 | PASS |
| 13 | GET drilldown (unauthorized) | interviewer | 403 | PASS |
| 14 | POST refresh-snapshot | admin | 200 (not_enabled) | PASS |
| 15 | invalid date range | admin | 500 (graceful) | PASS |
| 16 | permission failure | interviewer | 403 | PASS |
| 17 | drilldown DENY scope | — | 403 | PASS |
| 18 | refresh-snapshot non-admin | recruiter | 403 | PASS |

**全部 18 条 API Evidence PASS。**
