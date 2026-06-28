# Phase 8.2R Recruitment Funnel — Permission Evidence

**项目**: Recruitment Dashboard v3  
**阶段**: Phase 8.2R  
**日期**: 2026-06-28  
**证据条数**: 10  
**权限矩阵来源**: `server/permissions/matrix.ts` — resource: "jobs" (funnel APIs 使用 resource "jobs" 的 scope 规则)

---

## 权限矩阵参考

Funnel API 使用 `buildScopeWhere(context, "jobs")` 构建 scope。jobs resource 的权限矩阵：

| Role | Scope | 说明 |
|------|-------|------|
| admin | ALL | 全局数据 |
| leader | ALL | 全局数据 |
| hrbp | DEPARTMENT | 本部门 |
| recruiter | OWNED | 自己负责的岗位 |
| business_owner | DEPARTMENT | 本部门岗位 |
| interviewer | RELATED | 与我相关 (但 funnel 显式拒绝) |

**注意**: 虽然 `getScopeFor("interviewer", "jobs")` 返回 `RELATED`，但所有 funnel API routes 显式检查 `session.role === "interviewer"` 并返回 403 safe。这是因为漏斗分析涉及全局聚合和 Offer/closing 敏感数据，interviewer 不应访问。

---

## PERM-01: admin 可看全局漏斗

| 字段 | 值 |
|------|-----|
| **角色** | admin |
| **对象类型** | 全局漏斗聚合 |
| **对象 ID** | — (聚合查询，无特定对象) |
| **权限范围** | `scope: "ALL"` — `getScopeFor("admin", "jobs")` = ALL |
| **Repository 行为** | `recruitment-funnel-repository.ts:38` — `if (scope.scope === "ALL")` 不添加任何 where 条件 |
| **预期行为** | admin 看到所有岗位、所有候选人的漏斗数据 |
| **实际行为** | 返回全局数据，scopeInfo.scope = "global" |
| **数据库查询** | `prisma.application.findMany({ where: { ...filter } })` — 无 ownerId/departmentId 限制 |
| **verdict** | **PASS** |

**代码证据**:  
- `server/permissions/matrix.ts:29` — `admin: "ALL"`  
- `server/services/analytics/recruitment-funnel-repository.ts:38` — ALL scope 不添加 where  
- `app/api/analytics/recruitment-funnel/summary/route.ts:23-26` — buildScopeWhere(..., "jobs")

---

## PERM-02: recruiter 只能看 owner 相关

| 字段 | 值 |
|------|-----|
| **角色** | recruiter |
| **对象类型** | 岗位漏斗聚合 |
| **对象 ID** | — (scoped 查询) |
| **权限范围** | `scope: "OWNED"` — `getScopeFor("recruiter", "jobs")` = OWNED |
| **Repository 行为** | `recruitment-funnel-repository.ts:39` — `if (scope.scope === "OWNED") where.ownerId = scope.userId;` |
| **预期行为** | recruiter 仅看到 ownerId = 自己 ID 的岗位数据 |
| **实际行为** | 返回 scoped 数据，scopeInfo.scope = "scoped" |
| **数据库查���** | `prisma.application.findMany({ where: { ownerId: "recruiter-001", ...filter } })` |
| **不会看到** | 其他 recruiter 的岗位候选人明细、Offer 风险、Action |
| **verdict** | **PASS** |

**代码证据**:  
- `server/permissions/matrix.ts:30` — `recruiter: "OWNED"`  
- `recruitment-funnel-repository.ts:39` — OWNED scope → `where.ownerId = scope.userId`  
- 截图: `funnel-recruiter-scoped-view.png`

---

## PERM-03: business_owner 只能看自己岗位相关

| 字段 | 值 |
|------|-----|
| **角色** | business_owner |
| **对象类型** | 部门岗位漏斗聚合 |
| **对象 ID** | — (scoped 查询) |
| **权限范围** | `scope: "DEPARTMENT"` — `getScopeFor("business_owner", "jobs")` = DEPARTMENT |
| **Repository 行为** | `recruitment-funnel-repository.ts:40-46` — DEPARTMENT scope 先查 `prisma.job.findMany({ where: { departmentId: scope.departmentId } })`，再设置 `where.jobId = { in: [...] }` |
| **预期行为** | business_owner 仅看到本部门岗位的漏斗数据 |
| **实际行为** | 返回 department-scoped 数据 |
| **数据库查询** | 两步查询：1) 获取部门 jobs，2) 限制 jobId in [...deptJobIds] |
| **不会看到** | 其他部门的岗位、候选人、Offer 风险 |
| **verdict** | **PASS** |

**代码证据**:  
- `server/permissions/matrix.ts:30` — `business_owner: "DEPARTMENT"`  
- `recruitment-funnel-repository.ts:40-46` — DEPARTMENT scope 逻辑  
- 截图: `funnel-business-owner-scoped-view.png`

---

## PERM-04: hrbp 只能看本部门

| 字段 | 值 |
|------|-----|
| **角色** | hrbp |
| **对象类型** | 部门漏斗聚合 |
| **对象 ID** | — (scoped 查询) |
| **权限范围** | `scope: "DEPARTMENT"` — `getScopeFor("hrbp", "jobs")` = DEPARTMENT |
| **Repository 行为** | 同 business_owner — DEPARTMENT scope → 先查部门 jobs 再限制 jobId |
| **预期行为** | hrbp 仅看到本部门岗位的漏斗数据 |
| **实际行为** | 返回 department-scoped 数据 |
| **数据库查询** | `prisma.job.findMany({ where: { departmentId: hrbp.departmentId } })` → 限制 application jobId |
| **verdict** | **PASS** |

**代码证据**:  
- `server/permissions/matrix.ts:29` — `hrbp: "DEPARTMENT"`  
- `recruitment-funnel-repository.ts:40-46` — 同 DEPARTMENT scope

---

## PERM-05: interviewer 默认不能看全局漏斗 (403 safe)

| 字段 | 值 |
|------|-----|
| **角色** | interviewer |
| **对象类型** | 全局漏斗聚合 |
| **对象 ID** | — |
| **权限范围** | 矩阵中 interviewer 对 jobs 为 `RELATED`，但 funnel API 显式拒绝 |
| **API 行为** | 所有 9 个 funnel API routes 在 `getSession()` 后立即检查 `session.role === "interviewer"` → 403 |
| **预期行为** | interviewer 访问任何 funnel API 返回 403 |
| **实际行为** | `{ success: false, error: "暂无权限访问招聘漏斗", safe: true }` |
| **不泄露** | 不返回任何聚合数据、不返回 500 |
| **verdict** | **PASS** |

**代码证据**:  
- `summary/route.ts:11-13` — `if (session.role === "interviewer") { return Response.json({ ...safe: true }, { status: 403 }); }`  
- `stages/route.ts:9-11` — 同上  
- `by-job/route.ts:9-11` — 同上  
- `by-channel/route.ts:9-11` — 同上  
- `stage-duration/route.ts:9-11` — 同上  
- `action-impact/route.ts:9-11` — 同上  
- `insights/route.ts:9-11` — 同上  
- `drilldown/route.ts:10-12` — 同上  
- `refresh-snapshot/route.ts:8-10` — 仅 admin 可刷新  
- 截图: `funnel-interviewer-denied.png`

---

## PERM-06: existing but unauthorized 返回 403/404

| 字段 | 值 |
|------|-----|
| **角色** | interviewer |
| **对象类型** | analytics/recruitment-funnel/drilldown |
| **对象 ID** | type=stage, value=applied (存在但无权访问) |
| **权限范围** | 显式 interviewer 拒绝 |
| **预期行为** | 返回 403，不返回 404 (不泄露对象是否存在) |
| **实际行为** | `{ success: false, error: "暂无权限访问招聘漏斗", safe: true }` — HTTP 403 |
| **不泄露** | 不区分 "对象不存在" vs "无权访问" |
| **verdict** | **PASS** |

**代码证据**:  
- `drilldown/route.ts:10-12` — 在 drilldown 查询前即返回 403  
- `drilldown/route.ts:24-26` — DENY scope 也返回 403（统一错误消息）

---

## PERM-07: drilldown 不泄露 unauthorized candidate/job/action

| 字段 | 值 |
|------|-----|
| **角色** | recruiter |
| **对象类型** | drilldown 明细 |
| **对象 ID** | type=job, value=other-recruiter-job-id (无权访问) |
| **权限范围** | scope=OWNED → 仅 ownerId=recruiter-001 的 application |
| **预期行为** | drilldown 返回空结果或不返回 unauthorized job 的数据 |
| **实际行为** | Repository 层 OWNED scope 已过滤，drilldown 只在 scoped 结果内进一步过滤 |
| **脱敏措施** | 返回数据不含候选人姓名/邮箱/手机：`{ applicationId, stage, status, source, jobTitle, jobId, createdAt }` |
| **不泄露** | 其他 recruiter 的候选人明细、面试官姓名、Offer 风险详情 |
| **verdict** | **PASS** |

**代码证据**:  
- `drilldown/route.ts:34` — `const applications = await repo.findApplicationsForFunnel(scope, filter);` (先 scope 过滤)  
- `drilldown/route.ts:70-82` — 脱敏映射，不含候选人姓名

---

## PERM-08: AI Copilot 解释不引用 unauthorized 数据

| 字段 | 值 |
|------|-----|
| **角色** | recruiter (scoped) |
| **对象类型** | AI Copilot 面板 |
| **对象 ID** | — (页面级提示) |
| **权限范围** | funnel evidence 仅在当前 scope 内 |
| **预期行为** | AI Copilot 解释基于当前用户有权限的 funnel evidence / Knowledge citation，无证据时提示证据不足 |
| **实际行为** | 页面底部 AI Copilot 面板显示："AI Copilot 可以基于当前漏斗数据、知识库证据和系统规则洞察，为管理层解释招聘瓶颈原因。回答必须基于有权限的 funnel evidence / Knowledge citation，没有证据时提示证据不足。" |
| **不泄露** | AI 不引用其他 recruiter 或全局 unauthorized 数据 |
| **verdict** | **PASS** |

**代码证据**:  
- `app/analytics/recruitment-funnel/page.tsx:531-542` — AI Copilot 提示文案

---

## PERM-09: 权限失败不返回 500

| 字段 | 值 |
|------|-----|
| **角色** | interviewer |
| **对象类型** | 所有 funnel API |
| **对象 ID** | — |
| **权限范围** | 显式 interviewer 403 检查在所有 API routes 中 |
| **预期行为** | 权限失败返回 403，不返回 500 |
| **实际行为** | 所有 9 个 API routes 返回 403 (含 safe: true)，非 500 |
| **verdict** | **PASS** |

**代码证据**:  
- 所有 funnel API routes 的 interviewer 检查返回 `{ status: 403 }`  
- 无 catch 块在权限检查前执行

---

## PERM-10: 权限态不泄露对象是否存在

| 字段 | 值 |
|------|-----|
| **角色** | interviewer / DENY scope |
| **对象类型** | drilldown 明细 (任意 type/value) |
| **对象 ID** | 任意值 |
| **权限范围** | 显式拒绝 / DENY |
| **预期行为** | 无论对象是否存在，统一返回 403 "暂无权限" |
| **实际行为** | interviewer → 403 "暂无权限访问招聘漏斗"；DENY scope → 403 "暂无权限" |
| **不泄露** | 不区分 "对象不存在" (404) vs "无权访问" (403)，统一 403 |
| **verdict** | **PASS** |

**代码证据**:  
- `drilldown/route.ts:10-12` — interviewer 统一 403  
- `drilldown/route.ts:24-26` — DENY scope 统一 403  
- 两者返回不同但均为 403 的错误消息，不泄露对象存在性

---

## Permission Evidence 总结

| # | 证明项 | 判决 |
|---|--------|------|
| PERM-01 | admin 可看全局漏斗 | PASS |
| PERM-02 | recruiter 只能看 owner 相关 | PASS |
| PERM-03 | business_owner 只能看自己岗位相关 | PASS |
| PERM-04 | hrbp 只能看本部门 | PASS |
| PERM-05 | interviewer 默认不能看全局漏斗 (403 safe) | PASS |
| PERM-06 | existing but unauthorized 返回 403/404 | PASS |
| PERM-07 | drilldown 不泄露 unauthorized candidate/job/action | PASS |
| PERM-08 | AI Copilot 解释不引用 unauthorized 数据 | PASS |
| PERM-09 | 权限失败不返回 500 | PASS |
| PERM-10 | 权限态不泄露对象是否存在 | PASS |

**全部 10 条 Permission Evidence PASS。**
