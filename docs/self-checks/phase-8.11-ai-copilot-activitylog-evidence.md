# Phase 8.11 AI Copilot — ActivityLog 证据

> 验证范围：9 种 ActivityLog 类型 + 人话化文案
> 辅助服务：copilot-activity-helper
> 日期：2026-06-28

---

## ActivityLog 类型汇总

| # | Log Type | 触发时机 | 人话化文案模板 | 截图 | Verdict |
|---|---|---|---|---|---|
| 1 | SESSION_CREATED | 创建 Copilot 会话 | "创建了 AI Copilot 会话「{title}」，上下文：{scope}" | 24 | PASS |
| 2 | CONTEXT_BUILT | Context Builder 构建完成 | "AI 上下文已构建，包含 {citationCount} 个数据来源，覆盖 {scopeList}" | 24 | PASS |
| 3 | ANSWER_GENERATED | AI 生成回答 | "AI 生成了回答（{tokenCount} tokens），模型：{model}，耗时 {latency}ms" | 24 | PASS |
| 4 | NO_EVIDENCE | 无证据短路 | "AI 查询无匹配证据，scope={scope}，返回 no_evidence" | 24 | PASS |
| 5 | REVIEW_ACCEPTED | 人工审查接受 | "人工审查已接受 AI 回答，审查人：{reviewer}" | 24 | PASS |
| 6 | REVIEW_EDITED | 人工编辑后接受 | "人工审查已编辑 AI 回答，修改 {editDistance} 字符，审查人：{reviewer}" | 24 | PASS |
| 7 | REVIEW_REJECTED | 人工审查拒绝 | "人工审查已拒绝 AI 回答，原因：{reason}，审查人：{reviewer}" | 24 | PASS |
| 8 | DRAFT_ACTION_CREATED | 生成草稿动作 | "AI 生成了草稿动作「{actionType}」，关联对象：{targetId}" | 24 | PASS |
| 9 | DRAFT_ACTION_CONFIRMED | 确认草稿动作 | "草稿动作「{actionType}」已确认并创建正式 Action #{actionId}" | 24 | PASS |

---

## 逐类型详细验证

### 1. SESSION_CREATED

```
事件: SESSION_CREATED
触发: POST /api/ai/copilot/sessions (201)
人话化文案: "创建了 AI Copilot 会话「候选人筛选咨询」，上下文：职位中心"
存储字段: { type, sessionId, userId, scope, scopeId, title, timestamp }
Verdict: PASS
```

### 2. CONTEXT_BUILT

```
事件: CONTEXT_BUILT
触发: GET /api/ai/copilot/context (200) — 内部自动记录
人话化文案: "AI 上下文已构建，包含 3 个数据来源，覆盖 职位信息、候选人数据、面试反馈"
存储字段: { type, sessionId, citationCount, scopeList, timestamp }
Verdict: PASS
```

### 3. ANSWER_GENERATED

```
事件: ANSWER_GENERATED
触发: POST /api/ai/copilot/chat (200) — AI 返回回答后
人话化文案: "AI 生成了回答（452 tokens），模型：deepseek-chat，耗时 1234ms"
存储字段: { type, sessionId, messageId, model, tokenCount, latency, timestamp }
Verdict: PASS
```

### 4. NO_EVIDENCE

```
事件: NO_EVIDENCE
触发: POST /api/ai/copilot/chat (200) — context 无匹配数据
人话化文案: "AI 查询无匹配证据，scope=offer-risk，返回 no_evidence"
存储字段: { type, sessionId, scope, timestamp }
Verdict: PASS
```

### 5. REVIEW_ACCEPTED

```
事件: REVIEW_ACCEPTED
触发: PATCH /api/ai/copilot/messages/:id/review { action: "accepted" }
人话化文案: "人工审查已接受 AI 回答，审查人：张经理"
存储字段: { type, sessionId, messageId, reviewerId, timestamp }
Verdict: PASS
```

### 6. REVIEW_EDITED

```
事件: REVIEW_EDITED
触发: PATCH /api/ai/copilot/messages/:id/review { action: "edited", editedContent: "..." }
人话化文案: "人工审查已编辑 AI 回答，修改 47 字符，审查人：张经理"
存储字段: { type, sessionId, messageId, reviewerId, editDistance, timestamp }
Verdict: PASS
```

### 7. REVIEW_REJECTED

```
事件: REVIEW_REJECTED
触发: PATCH /api/ai/copilot/messages/:id/review { action: "rejected", reason: "信息不准确" }
人话化文案: "人工审查已拒绝 AI 回答，原因：信息不准确，审查人：张经理"
存储字段: { type, sessionId, messageId, reviewerId, reason, timestamp }
Verdict: PASS
```

### 8. DRAFT_ACTION_CREATED

```
事件: DRAFT_ACTION_CREATED
触发: POST /api/ai/copilot/draft-action (201)
人话化文案: "AI 生成了草稿动作「安排面试」，关联对象：候选人-张三"
存储字段: { type, sessionId, draftActionId, actionType, targetId, timestamp }
Verdict: PASS
```

### 9. DRAFT_ACTION_CONFIRMED

```
事件: DRAFT_ACTION_CONFIRMED
触发: POST /api/ai/copilot/draft-action/:id/confirm (201)
人话化文案: "草稿动作「安排面试」已确认并创建正式 Action #ACT-20260628-001"
存储字段: { type, sessionId, draftActionId, actionId, actionType, timestamp }
Verdict: PASS
```

---

## ActivityLog 展示验证

| 检查项 | 截图 | Verdict |
|---|---|---|
| 列表按时间倒序排列 | 24 | PASS |
| 每条日志含人话化文案 | 24 | PASS |
| 日志含时间戳 | 24 | PASS |
| 日志含操作人 | 24 | PASS |
| 日志类型标签可见 | 24 | PASS |
| 全 9 种类型可区分展示 | 24 | PASS |

---

## copilot-activity-helper 接口

```typescript
// 核心函数签名
function logCopilotActivity(params: {
  type: ActivityLogType;
  sessionId: string;
  userId: string;
  metadata?: Record<string, unknown>;
}): Promise<ActivityLog>;

// 人话化文案生成
function humanizeActivity(log: ActivityLog): string;
```

---

## 结论

| 检查项 | 结果 |
|---|---|
| ActivityLog 类型覆盖 | 9/9 PASS |
| 人话化文案生成 | 9/9 PASS |
| 触发时机正确 | 9/9 PASS |
| 存储字段完整 | 9/9 PASS |
| 前端展示可读 | PASS |

**ActivityLog 全链路审计验证通过。**
