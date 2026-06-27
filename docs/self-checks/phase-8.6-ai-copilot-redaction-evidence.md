# Phase 8.6A AI Copilot — Redaction Evidence

> Provider Status: not_configured | Mock: 否

## AI Context Redaction 验证

| 检查项 | AI Context Payload | 脱敏后 | 通过 |
|--------|-------------------|--------|------|
| 手机号 (1[3-9]\d{9}) | 不存在 | — | PASS |
| 邮箱 | 不存在 | — | PASS |
| 身份证 (18位) | 不存在 | — | PASS |
| 详细薪资数字 | 不存在 | — | PASS |
| 薪资数字 (\d+k\|\d+万) | 不存在 | — | PASS |
| 完整简历原文 | 不存在(仅摘要) | — | PASS |
| 完整面试纪要 | 不存在(仅评分) | — | PASS |
| API Key (sk-...) | 不存在 | — | PASS |
| DATABASE_URL | 不存在 | — | PASS |

## Redaction Service 规则

`server/services/ai/ai-redaction-service.ts` 过滤规则：

1. 手机号: `/\b1[3-9]\d{9}\b/g` → `[PHONE]`
2. 邮箱: `/\b[\w.-]+@[\w.-]+\.\w+\b/g` → `[EMAIL]`
3. 身份证: `/\b\d{17}[\dXx]\b/g` → `[ID]`
4. 薪资数字: `/\b\d+[kKwW万]\b/g` → `[SALARY]`
5. API Key: `/\bsk-[a-zA-Z0-9]+\b/g` → `[API_KEY]`

## Context Builder 脱敏策略

- job: 仅包含岗位名称/JD摘要/漏斗指标/Action摘要(不含敏感信息)
- candidate: 仅包含脱敏名/岗位/阶段/匹配标签/证据链摘要(不含手机号/邮箱/身份证/薪资/简历全文)
- interview_quality: 仅包含评分/qualityScore/evidenceScore/证据缺口(不含面试官排名/羞辱性评价)
- offer_risk: 仅包含风险等级/类型/意向摘要/closing建议(不含详细薪资数字)

## Redaction Evidence

| 验证项 | 方法 | 结果 |
|--------|------|------|
| requestHash 不含明文 | Playwright textContent | PASS (无手机号/邮箱/身份证/薪资) |
| logs 不含明文 | grep -R | PASS |
| DOM 不含敏感信息 | Playwright DOM check | PASS |
| AI Context 不泄露敏感信息 | Context Builder scope-aware | PASS |
