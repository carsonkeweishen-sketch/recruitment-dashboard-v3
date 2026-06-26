# AI 输出溯源标准

> 版本：v1.0
> 生效日期：2026-06-27
> 适用范围：所有 AI 输出（Layer 1 规则智能 + Layer 2 LLM 辅助）
> 关联文档：`docs/product/AI_CAPABILITY_FRAMEWORK.md`

---

## 1. 概述

所有 AI 输出必须具备**可追溯性**。任何 AI 生成的内容必须回答三个问题：

1. **谁生成的？**（provider / model / promptVersion）
2. **基于什么生成的？**（inputSource / evidence）
3. **是否可以信任？**（confidence / humanReviewStatus）

本规范同时适用于 Layer 1（规则智能）和 Layer 2（LLM 辅助），两者溯源要求不同但遵循同一框架。

---

## 2. AI 输出元数据 Schema

所有 AI 输出（API 响应 / AiAnalysisLog 记录 / UI 展示）必须包含以下元数据：

```json
{
  "provider": "system_rule | openai | deepseek | claude",
  "model": "rule_engine | gpt-4o | deepseek-v3 | claude-4-sonnet",
  "promptVersion": "v1.0.0",
  "createdAt": "2026-06-27T10:30:00.000Z",
  "createdBy": "system | user_id",
  "inputSource": "岗位 ID cmxxx 的最近 10 条面试反馈",
  "evidence": [
    "面试 ID cmxxx，面试官赵六，评分 3/5，证据：候选人在项目经验方面回答不够深入",
    "面试 ID cmyyy，面试官钱七，评分 4/5，证据：具备行业经验，表达清晰"
  ],
  "humanReviewStatus": "pending | confirmed | rejected"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `provider` | string | ✅ | AI 提供商。规则智能固定为 `system_rule` |
| `model` | string | ✅ | 模型名称。规则智能固定为 `rule_engine` |
| `promptVersion` | string | LLM必填 | Prompt 模板版本号，用于回滚和 A/B 测试 |
| `createdAt` | ISO 8601 | ✅ | 生成时间戳 |
| `createdBy` | string | ✅ | 触发者 ID，系统自动生成为 `system` |
| `inputSource` | string | ✅ | 人类可读的数据来源描述 |
| `evidence` | string[] | ✅ | 引用的具体数据证据 |
| `humanReviewStatus` | string | ✅ | 人工审核状态 |

---

## 3. Layer 1：规则智能溯源

### 3.1 标识

```json
{
  "provider": "system_rule",
  "model": "rule_engine",
  "triggerCondition": "面试反馈超过 24 小时未提交",
  "inputSource": "面试 ID cmxxx，完成时间 2026-06-26T10:00:00Z，当前时间 2026-06-27T10:00:00Z",
  "evidence": [
    "面试轮次：二面",
    "面试官：赵六",
    "候选人：林可",
    "岗位：KA大客户销售"
  ]
}
```

### 3.2 UI 展示规范

**标题文案**：`系统发现` 或 `规则提醒`

**描述文案**：`基于当前招聘数据生成`

**完整示例**：

```
系统发现
面试反馈已逾期 24 小时
基于当前招聘数据生成

面试官赵六对候选人林可（KA大客户销售·二面）的反馈已超过 24 小时未提交。
→ 查看面试详情
```

### 3.3 规则智能特征

- ✅ 确定性（100% 置信度）
- ✅ 可解释（触发条件明确）
- ✅ 始终可用（不依赖外部 API）
- ✅ 不显示置信度（规则无概率概念）
- ❌ 不标记为 "AI"
- ❌ 不显示 provider/model

---

## 4. Layer 2：LLM 辅助溯源

### 4.1 标识

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "promptVersion": "v1.2.0",
  "confidence": 78,
  "inputSource": "岗位 KA大客户销售 的最近 10 条面试反馈（已脱敏）",
  "evidence": [
    "3 条淘汰记录中，2 条原因包含"行业经验不足"",
    "面试官赵六和钱七的反馈均提到"缺乏消费品行业经验""
  ],
  "humanReviewStatus": "pending"
}
```

### 4.2 UI 展示规范

**标题文案**：`AI 辅助建议`

**描述文案**：`{provider} {model} · 置信度 {confidence}% · 仅供参考`

**完整示例**：

```
AI 辅助建议
KA大客户销售岗位可能存在画像偏差
OpenAI GPT-4o · 置信度 78% · 仅供参考

连续 3 位候选人在业务二面因"行业经验不足"被淘汰。
建议：调整岗位画像中"必须项"与"加分项"的行业经验要求。
→ 创建画像校准

依据：3 条淘汰记录 | 待人工确认
```

### 4.3 LLM 辅助特征

- ✅ 必须显示 provider + model
- ✅ 必须显示置信度
- ✅ 必须显示 "仅供参考"
- ✅ 必须有人工确认入口
- ❌ 禁止在未接入模型时显示
- ❌ 禁止使用 "GPT 生成" / "OpenAI 已生成"（未接入时）

---

## 5. 用户可见标签格式

### 5.1 规则智能标签

```
┌──────────────────────────────────────────┐
│ ⚡ 系统规则提醒                            │
│ 基于当前招聘数据生成                        │
└──────────────────────────────────────────┘
```

### 5.2 LLM 辅助标签

```
┌──────────────────────────────────────────┐
│ 🤖 AI 辅助建议                             │
│ OpenAI GPT-4o · 置信度 78% · 仅供参考       │
│ 待人工确认                                 │
└──────────────────────────────────────────┘
```

### 5.3 已确认标签

```
┌──────────────────────────────────────────┐
│ ✅ 已确认                                  │
│ 张三（HRBP）于 2026-06-27 确认              │
└──────────────────────────────────────────┘
```

---

## 6. 禁止事项

### 6.1 禁止的 AI 文案

| 禁止文案 | 原因 |
|---------|------|
| "AI 自动判断" | AI 不替代人类判断 |
| "AI 决定录用" | 严重误导 |
| "AI 自动淘汰" | 严重误导 |
| "AI 自动推进" | AI 不操作业务数据 |
| "智能决策" | 过度承诺 |
| "AI 排名" | 不透明、不可解释 |
| "GPT 生成"（未接入时） | 虚假 AI |
| "OpenAI 已生成"（未接入时） | 虚假 AI |

### 6.2 禁止的 AI 行为

| 禁止行为 | 正确做法 |
|---------|---------|
| 无溯源的 AI 输出 | 必须包含 provider/model/evidence |
| 无置信度的 AI 输出 | 必须标注置信度 |
| 无人工确认门的自动操作 | 所有操作需人工确认 |
| 未接入模型显示 AI 标识 | 未接入时不显示 AI 区域 |
| AI 输出替代业务判断 | AI = 参考，不 = 结论 |
| 脱敏不充分的数据传入 LLM | 必须去除 PII（姓名/手机/邮箱/薪资） |

---

## 7. AiAnalysisLog 数据库记录规范

每条 AI 分析结果必须在 `ai_analysis_logs` 表中记录：

| 字段 | 对应元数据 | 说明 |
|------|-----------|------|
| `analysisType` | — | 分析类型枚举 |
| `resourceType` | — | 关联资源类型 |
| `resourceId` | — | 关联资源 ID |
| `userId` | `createdBy` | 触发用户 |
| `inputHash` | — | 输入数据哈希（去重） |
| `promptName` | — | Prompt 模板名称 |
| `promptVersion` | `promptVersion` | Prompt 版本 |
| `provider` | `provider` | AI 提供商 |
| `model` | `model` | 模型名称 |
| `confidence` | `confidence` | 置信度 |
| `outputJson` | — | 完整输出 |
| `sanitizedInputSnapshot` | `inputSource` | 脱敏后输入快照 |
| `isFallback` | — | 是否降级输出 |
| `isConfirmed` | `humanReviewStatus` | 是否已人工确认 |
| `confirmedBy` | — | 确认人 ID |
| `confirmedAt` | — | 确认时间 |

---

## 8. 开发检查清单

在实现任何 AI 功能时，必须通过以下检查：

- [ ] AI 输出包含 provider + model
- [ ] LLM 输出包含 promptVersion + confidence
- [ ] 规则智能输出包含 triggerCondition + evidence
- [ ] UI 展示包含 "仅供参考" / "基于当前招聘数据生成"
- [ ] 所有 AI 输出记录到 ai_analysis_logs
- [ ] 输入数据已脱敏（无 PII）
- [ ] 有人工确认门
- [ ] 不包含禁止文案
- [ ] 不自动执行操作

---

> 版本：v1.0 | 日期：2026-06-27 | 分支：agent/workbuddy/phase-8
