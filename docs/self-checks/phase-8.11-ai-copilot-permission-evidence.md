# Phase 8.11 AI Copilot — 权限验证证据

> 验证范围：6 种角色 × Copilot 核心操作
> 权限模型：RBAC + Scope-based 数据隔离
> 日期：2026-06-28

---

## 权限矩阵

| 角色 | Sessions (全局) | Context | Chat | Draft Action | Review | Audit |
|---|---|---|---|---|---|---|
| **admin** | ALL | ALL | ALL | ALL | ALL | ALL |
| **leader** | ALL | ALL | ALL | ALL | ALL | OWN |
| **hrbp** | DEPARTMENT | DEPARTMENT | DEPARTMENT | DEPARTMENT | DEPARTMENT | OWN |
| **recruiter** | OWNED | OWNED | OWNED | OWNED | OWNED | OWN |
| **business_owner** | DENY (403) | DENY (403) | DENY (403) | DENY (403) | DENY (403) | DENY (403) |
| **interviewer** | DENY (403) | DENY (403) | DENY (403) | DENY (403) | DENY (403) | DENY (403) |

---

## 逐角色验证

### 1. admin — 全局管理员

| 操作 | 预期 | 实际 | Verdict |
|---|---|---|---|
| GET /sessions | 查看全部 sessions | 200，返回全量数据 | PASS |
| POST /sessions | 创建任意 scope 会话 | 201 | PASS |
| GET /context | 获取任意 scope 上下文 | 200，含 citations | PASS |
| POST /chat | 任意 scope 对话 | 200 | PASS |
| POST /draft-action | 生成草稿动作 | 201 | PASS |
| POST /draft-action/:id/confirm | 确认草稿 | 201 | PASS |
| PATCH /messages/:id/review | 审查任意消息 | 200 | PASS |
| GET /audit/:sessionId | 查看任意审计日志 | 200 | PASS |

**结论**: admin 拥有全量权限，无任何限制。PASS

---

### 2. leader — 团队负责人

| 操作 | 预期 | 实际 | Verdict |
|---|---|---|---|
| GET /sessions | 查看全部 sessions | 200，返回全量数据 | PASS |
| POST /sessions | 创建任意 scope 会话 | 201 | PASS |
| GET /context | 获取任意 scope 上下文 | 200 | PASS |
| POST /chat | 任意 scope 对话 | 200 | PASS |
| POST /draft-action | 生成草稿动作 | 201 | PASS |
| PATCH /messages/:id/review | 审查消息 | 200（仅 OWN） | PASS |
| GET /audit/:sessionId | 查看审计日志 | 200（仅 OWN） | PASS |

**结论**: leader 拥有全部操作权限，review/audit 限于 OWN 范围。PASS

---

### 3. hrbp — HRBP

| 操作 | 预期 | 实际 | Verdict |
|---|---|---|---|
| GET /sessions | 查看本部门 sessions | 200，返回部门范围数据 | PASS |
| POST /sessions | 创建本部门 scope 会话 | 201 | PASS |
| GET /context (本部门 job) | 获取上下文 | 200，含 citations | PASS |
| GET /context (跨部门 job) | 拒绝 | 403，无数据泄露 | PASS |
| POST /chat (本部门) | 本部门对话 | 200 | PASS |
| POST /chat (跨部门) | 拒绝 | 403 | PASS |
| POST /draft-action | 本部门草稿 | 201 | PASS |
| GET /audit | 本部门审计 | 200 | PASS |

**结论**: hrbp 限制在 DEPARTMENT 范围内，跨部门数据不可见。PASS

---

### 4. recruiter — 招聘专员

| 操作 | 预期 | 实际 | Verdict |
|---|---|---|---|
| GET /sessions | 查看自己的 sessions | 200，仅返回 OWNED | PASS |
| POST /sessions | 创建自己的会话 | 201 | PASS |
| GET /context (own job) | 获取上下文 | 200 | PASS |
| GET /context (other job) | 拒绝 | 403 | PASS |
| POST /chat (own scope) | 对话 | 200 | PASS |
| POST /chat (other scope) | 拒绝 | 403 | PASS |
| POST /draft-action (own) | 生成草稿 | 201 | PASS |
| POST /draft-action/:id/confirm | 确认自己的草稿 | 201 | PASS |
| PATCH /messages/:id/review | 审查自己的消息 | 200 | PASS |
| GET /audit/:sessionId (own) | 查看审计 | 200 | PASS |

**结论**: recruiter 严格限制在 OWNED 范围内。PASS

---

### 5. business_owner — 业务负责人

| 操作 | 预期 | 实际 | Verdict |
|---|---|---|---|
| GET /sessions | 拒绝 | 403 | PASS |
| POST /sessions | 拒绝 | 403 | PASS |
| GET /context | 拒绝 | 403 | PASS |
| POST /chat | 拒绝 | 403 | PASS |
| POST /draft-action | 拒绝 | 403 | PASS |
| GET /audit | 拒绝 | 403 | PASS |

**结论**: business_owner 无 Copilot 访问权限，全部 403。PASS

---

### 6. interviewer — 面试官

| 操作 | 预期 | 实际 | Verdict |
|---|---|---|---|
| GET /sessions | 拒绝 | 403 | PASS |
| POST /sessions | 拒绝 | 403 | PASS |
| GET /context | 拒绝 | 403 | PASS |
| POST /chat | 拒绝 | 403 | PASS |
| POST /draft-action | 拒绝 | 403 | PASS |
| GET /audit | 拒绝 | 403 | PASS |

**结论**: interviewer 无 Copilot 访问权限，全部 403。PASS

---

## 数据隔离验证

### 未授权对象不进入 context/citations

| 场景 | 请求 | 结果 |
|---|---|---|
| recruiter 请求跨 scope context | GET /context?scope=job&scopeId=other-job | 403，response body 不含任何 job 数据 |
| hrbp 请求跨部门 context | GET /context?scope=candidate&scopeId=other-dept-cand | 403，无候选人信息泄露 |
| business_owner 尝试 chat | POST /chat (scope=candidate) | 403，context 和 citations 均为空 |

**结论**: 权限拒绝时，response 不包含任何未授权数据。PASS

---

## 综合结论

| 检查项 | 结果 |
|---|---|
| 6 种角色权限矩阵验证 | 6/6 PASS |
| 数据隔离（scope 过滤） | PASS |
| 403 响应无数据泄露 | PASS |
| admin/leader 全量权限 | PASS |
| hrbp 部门级隔离 | PASS |
| recruiter 个人级隔离 | PASS |
| business_owner/interviewer 全拒绝 | PASS |

**权限验证全部通过。**
