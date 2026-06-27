# Phase 8.6A AI Copilot — API Evidence

> Provider Status: **not_configured** (OPENAI_API_KEY not set in environment)
> 方案 B: 诚实降级，不生成假 AI。真实 Provider 生成路径标记为 blocked_by_not_configured。
> Mock: 否。

## API Evidence (13条)

| # | Role | userId | objectType | objectId | Request | HTTP | Response Summary | DB Source | Scope | Provider | Mock | Verdict |
|---|------|--------|-----------|---------|---------|------|-----------------|-----------|-------|----------|------|---------|
| 1 | admin | cmqv2nfjo0007y3jxiwti2eer | — | — | GET /api/ai/provider/status | 200 | {status:"not_configured"} | — | ALL | not_configured | 否 | PASS |
| 2 | admin | cmqv2nfjo0007y3jxiwti2eer | job | cmqwdh3rk000d8mqvy2lv8umx | POST /api/ai/copilot | 200 | not_configured, system_rule fallback | ai_insights | ALL | not_configured | 否 | PASS |
| 3 | admin | cmqv2nfjo0007y3jxiwti2eer | candidate | cmqwevt18000miyqvq6psb1se | POST /api/ai/copilot | 200 | not_configured, system_rule fallback | ai_insights | ALL | not_configured | 否 | PASS |
| 4 | admin | cmqv2nfjo0007y3jxiwti2eer | interview_quality | cmqwhh9jl001rchqvxvd3g967 | POST /api/ai/copilot | 200 | not_configured, system_rule fallback | ai_insights | ALL | not_configured | 否 | PASS |
| 5 | admin | cmqv2nfjo0007y3jxiwti2eer | offer_risk | cmqwhh9jl001rchqvxvd3g967 | POST /api/ai/copilot | 200 | not_configured, system_rule fallback | ai_insights | ALL | not_configured | 否 | PASS |
| 6 | interviewer | cmqv2nfjr000cy3jxq62urqiq | offer_risk | cmqwhh9jl001rchqvxvd3g967 | POST /api/ai/copilot | 403 | 暂无权限 | — | DENY | not_configured | 否 | PASS |
| 7 | interviewer | cmqv2nfjr000cy3jxq62urqiq | candidate | cmqwevt18000miyqvq6psb1se | POST /api/ai/copilot | 403 | 暂无权限 | — | DENY | not_configured | 否 | PASS |
| 8 | admin | cmqv2nfjo0007y3jxiwti2eer | — | — | POST /api/ai/insights/generate | 200 | not_configured, insight saved | ai_insights | ALL | not_configured | 否 | PASS |
| 9 | admin | cmqv2nfjo0007y3jxiwti2eer | — | insight-id | PATCH /api/ai/insights/:id/review (accepted) | 200 | Review accepted | ai_insights, ai_human_reviews | ALL | not_configured | 否 | PASS |
| 10 | interviewer | cmqv2nfjr000cy3jxq62urqiq | — | insight-id | PATCH /api/ai/insights/:id/review (unauthorized) | 403 | 暂无权限 | — | DENY | not_configured | 否 | PASS |
| 11 | admin | cmqv2nfjo0007y3jxiwti2eer | — | — | GET /api/ai/insights | 200 | List of insights | ai_insights | ALL | not_configured | 否 | PASS |
| 12 | admin | cmqv2nfjo0007y3jxiwti2eer | — | — | GET /api/ai/audit-logs | 200 | List of call logs | ai_call_logs | ALL | not_configured | 否 | PASS |
| 13 | admin | cmqv2nfjo0007y3jxiwti2eer | job | cmqwdh3rk000d8mqvy2lv8umx | POST /api/ai/copilot (simulated timeout) | 500 | Clean error state | — | ALL | not_configured | 否 | PASS |

## 降级声明

Phase 8.6A 采用方案 B：
- ✅ Provider not_configured 降级完成
- ✅ 不生成假 AI
- ✅ 不伪造 LLM 输出
- ✅ System rule fallback 正常工作
- ❌ 真实 Provider 生成路径：**blocked_by_not_configured**（需要配置 OPENAI_API_KEY 后验证）

## Redaction 验证

| 检查项 | 结果 |
|--------|------|
| AI context 含手机号 | FALSE |
| AI context 含邮箱 | FALSE |
| AI context 含身份证 | FALSE |
| AI context 含详细薪资 | FALSE |
| AI context 含 API Key | FALSE |
| AI context 含 DATABASE_URL | FALSE |
