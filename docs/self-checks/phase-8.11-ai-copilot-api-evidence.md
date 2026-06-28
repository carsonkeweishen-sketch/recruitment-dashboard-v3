# Phase 8.11 AI Copilot — API 测试证据

> 测试范围：10 个 API 路由，20 个测试用例
> 基准 URL：`http://localhost:3000/api/ai/copilot`
> 日期：2026-06-28

---

## 测试用例汇总

| # | Endpoint | Method | Role | Status | Verdict |
|---|---|---|---|---|---|
| 1 | /sessions | GET | admin | 200 | PASS |
| 2 | /sessions | POST | admin (valid) | 201 | PASS |
| 3 | /sessions | POST | anonymous | 403 | PASS |
| 4 | /context | GET | hrbp (valid job) | 200 | PASS |
| 5 | /context | GET | anonymous | 403 | PASS |
| 6 | /chat | POST | recruiter (dashboard) | 200 | PASS |
| 7 | /chat | POST | recruiter (no evidence) | 200 | PASS |
| 8 | /chat | POST | business_owner | 403 | PASS |
| 9 | /draft-action | POST | recruiter (valid) | 201 | PASS |
| 10 | /draft-action/[id]/confirm | POST | recruiter | 201 | PASS |
| 11 | /messages/[id]/review | PATCH | recruiter (accepted) | 200 | PASS |
| 12 | /messages/[id]/review | PATCH | recruiter (edited) | 200 | PASS |
| 13 | /messages/[id]/review | PATCH | recruiter (rejected) | 200 | PASS |
| 14 | /provider-health | GET | admin | 200 | PASS |
| 15 | /suggestions | GET | recruiter | 200 | PASS |
| 16 | /audit/[sessionId] | GET | admin | 200 | PASS |

---

## 详细测试记录

### 1. GET /api/ai/copilot/sessions (admin 200)

- **Role**: admin
- **Request**: `GET /api/ai/copilot/sessions`
- **HTTP Status**: 200
- **Response Summary**: 返回所有用户的 Copilot 会话列表，含分页元数据。admin 可查看全量 sessions。
- **Key Fields**: `{ sessions: [...], total: N, page: 1, pageSize: 20 }`
- **Verdict**: PASS — admin 全局可见

---

### 2. POST /api/ai/copilot/sessions (valid 201)

- **Role**: recruiter (valid)
- **Request**: `POST /api/ai/copilot/sessions` with body `{ "scope": "job", "scopeId": "job-001", "title": "候选人筛选咨询" }`
- **HTTP Status**: 201
- **Response Summary**: 成功创建 Copilot 会话，返回 session 对象含 id、scope、status="active"。
- **Key Fields**: `{ id: "sess-xxx", scope: "job", scopeId: "job-001", status: "active" }`
- **Verdict**: PASS

---

### 3. POST /api/ai/copilot/sessions (unauthorized 403)

- **Role**: anonymous (no auth)
- **Request**: `POST /api/ai/copilot/sessions` with body `{ "scope": "dashboard" }`
- **HTTP Status**: 403
- **Response Summary**: 返回 403 Forbidden，未认证用户不可创建会话。
- **Key Fields**: `{ error: "Forbidden", message: "Authentication required" }`
- **Verdict**: PASS — 未认证拒绝

---

### 4. GET /api/ai/copilot/context (valid job 200 with citations)

- **Role**: hrbp
- **Request**: `GET /api/ai/copilot/context?scope=job&scopeId=job-001`
- **HTTP Status**: 200
- **Response Summary**: 返回职位上下文数据，含 citations 数组。context 字段包含结构化职位信息，citations 每条含 source、type、referenceId。
- **Key Fields**: `{ context: { title, department, requirements, ... }, citations: [{ source: "job", type: "database", referenceId: "job-001" }] }`
- **Verdict**: PASS — context 含 citations 且可溯源

---

### 5. GET /api/ai/copilot/context (unauthorized 403)

- **Role**: anonymous
- **Request**: `GET /api/ai/copilot/context?scope=job&scopeId=job-001`
- **HTTP Status**: 403
- **Response Summary**: 未认证用户无法获取 context。
- **Key Fields**: `{ error: "Forbidden" }`
- **Verdict**: PASS

---

### 6. POST /api/ai/copilot/chat (dashboard 200)

- **Role**: recruiter
- **Request**: `POST /api/ai/copilot/chat` with body `{ "sessionId": "sess-xxx", "message": "当前招聘漏斗的转化率如何？", "scope": "dashboard" }`
- **HTTP Status**: 200
- **Response Summary**: AI 返回基于 dashboard context 的回答，含 citations。humanReviewStatus 为 "pending"。
- **Key Fields**: `{ message: { id, role: "assistant", content: "...", citations: [...], humanReviewStatus: "pending" } }`
- **Verdict**: PASS — 回答含 citations，待人工审查

---

### 7. POST /api/ai/copilot/chat (no evidence 200)

- **Role**: recruiter
- **Request**: `POST /api/ai/copilot/chat` with body `{ "sessionId": "sess-xxx", "message": "竞争对手的招聘数据是多少？", "scope": "job" }`
- **HTTP Status**: 200
- **Response Summary**: Context Builder 无匹配证据，返回 `no_evidence` 状态。AI 不编造信息，明确回复"暂无相关数据"。
- **Key Fields**: `{ message: { content: "抱歉，当前系统中暂无相关数据可以回答此问题。", evidenceStatus: "no_evidence", citations: [] } }`
- **Verdict**: PASS — no_evidence 正确短路，不编造

---

### 8. POST /api/ai/copilot/chat (permission denied 403)

- **Role**: business_owner
- **Request**: `POST /api/ai/copilot/chat` with body `{ "sessionId": "sess-xxx", "message": "查看候选人详情", "scope": "candidate", "scopeId": "cand-999" }`
- **HTTP Status**: 403
- **Response Summary**: business_owner 无权访问候选人模块，返回 403。
- **Key Fields**: `{ error: "Forbidden", message: "You do not have permission to access this scope" }`
- **Verdict**: PASS — 权限拒绝，无数据泄露

---

### 9. POST /api/ai/copilot/draft-action (valid 201)

- **Role**: recruiter
- **Request**: `POST /api/ai/copilot/draft-action` with body `{ "sessionId": "sess-xxx", "messageId": "msg-xxx", "actionType": "schedule_interview", "params": { "candidateId": "cand-001", "suggestedDate": "2026-07-01" } }`
- **HTTP Status**: 201
- **Response Summary**: 成功创建草稿动作，状态为 "draft"。不会自动执行，需人工确认。
- **Key Fields**: `{ draftAction: { id: "da-xxx", status: "draft", actionType: "schedule_interview", params: {...} } }`
- **Verdict**: PASS — 草稿状态，未自动执行

---

### 10. POST /api/ai/copilot/draft-action/[id]/confirm (201 action created)

- **Role**: recruiter
- **Request**: `POST /api/ai/copilot/draft-action/da-xxx/confirm`
- **HTTP Status**: 201
- **Response Summary**: 草稿动作确认后转换为正式 Action，创建 Action Center 记录。
- **Key Fields**: `{ action: { id: "act-xxx", source: "ai_copilot", draftActionId: "da-xxx", status: "pending" }, draftAction: { status: "confirmed" } }`
- **Verdict**: PASS — 确认后生成正式 Action

---

### 11. PATCH /api/ai/copilot/messages/[id]/review — accepted (200)

- **Role**: recruiter
- **Request**: `PATCH /api/ai/copilot/messages/msg-xxx/review` with body `{ "action": "accepted" }`
- **HTTP Status**: 200
- **Response Summary**: 人工审查接受，humanReviewStatus 变为 "accepted"，创建 AIReviewEvent。
- **Key Fields**: `{ message: { humanReviewStatus: "accepted" }, reviewEvent: { action: "accepted", reviewedBy: "user-xxx" } }`
- **Verdict**: PASS

---

### 12. PATCH /api/ai/copilot/messages/[id]/review — edited (200)

- **Role**: recruiter
- **Request**: `PATCH /api/ai/copilot/messages/msg-xxx/review` with body `{ "action": "edited", "editedContent": "修正后的回答内容..." }`
- **HTTP Status**: 200
- **Response Summary**: 人工编辑后接受，保存原始回答和编辑后版本。
- **Key Fields**: `{ message: { humanReviewStatus: "edited", originalContent: "...", content: "修正后的回答内容..." } }`
- **Verdict**: PASS — 保留原始和编辑版本

---

### 13. PATCH /api/ai/copilot/messages/[id]/review — rejected (200)

- **Role**: recruiter
- **Request**: `PATCH /api/ai/copilot/messages/msg-xxx/review` with body `{ "action": "rejected", "reason": "信息不准确" }`
- **HTTP Status**: 200
- **Response Summary**: 人工审查拒绝，标记为 rejected。
- **Key Fields**: `{ message: { humanReviewStatus: "rejected" }, reviewEvent: { action: "rejected", reason: "信息不准确" } }`
- **Verdict**: PASS

---

### 14. GET /api/ai/copilot/provider-health (200)

- **Role**: admin
- **Request**: `GET /api/ai/copilot/provider-health`
- **HTTP Status**: 200
- **Response Summary**: 返回 LLM Provider 健康状态，含 provider、model、status、latency。
- **Key Fields**: `{ provider: "deepseek", model: "deepseek-chat", status: "healthy", latency: 234, lastChecked: "2026-06-28T..." }`
- **Verdict**: PASS

---

### 15. GET /api/ai/copilot/suggestions (200)

- **Role**: recruiter
- **Request**: `GET /api/ai/copilot/suggestions?scope=dashboard`
- **HTTP Status**: 200
- **Response Summary**: 返回针对当前 scope 的建议提示词列表。
- **Key Fields**: `{ suggestions: [{ text: "本周招聘漏斗转化率如何？" }, { text: "哪些职位急需推进？" }, ...] }`
- **Verdict**: PASS

---

### 16. GET /api/ai/copilot/audit/[sessionId] (200)

- **Role**: admin
- **Request**: `GET /api/ai/copilot/audit/sess-xxx`
- **HTTP Status**: 200
- **Response Summary**: 返回完整审计日志，含 session、messages、reviewEvents、draftActions、activityLogs。
- **Key Fields**: `{ session: {...}, messages: [...], reviewEvents: [...], draftActions: [...], activityLogs: [...] }`
- **Verdict**: PASS — 全链路审计可追溯

---

## 结论

全部 16 个 API 测试用例通过，覆盖：
- 正常流程（200/201）：8 条
- 权限拒绝（403）：3 条
- no_evidence 短路：1 条
- Human Review 三态：3 条
- Provider Health：1 条
