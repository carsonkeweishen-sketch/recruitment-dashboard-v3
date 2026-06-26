# 理然智能招聘 AI 看板 — AI 能力框架

> 版本：v1.0
> 日期：2026-06-27
> 适用范围：Phase 8.0 起所有 AI 相关设计
> 前置阅读：`PRODUCT_INFORMATION_ARCHITECTURE.md`、`CORE_DOMAIN_OBJECT_MODEL.md`

---

## 目录

1. [AI 能力概述与设计原则](#1-ai-能力概述与设计原则)
2. [Layer 1：System Intelligence（系统智能 / 规则引擎）](#2-layer-1system-intelligence系统智能--规则引擎)
3. [Layer 2：Assisted Intelligence（辅助智能 / AI 增强分析）](#3-layer-2assisted-intelligence辅助智能--ai-增强分析)
4. [Layer 3：Human-Confirmed Execution（人工确认后的执行闭环）](#4-layer-3human-confirmed-execution人工确认后的执行闭环)
5. [AI 数据契约](#5-ai-数据契约)
6. [AI 安全与合规](#6-ai-安全与合规)
7. [AI 能力-模块映射矩阵](#7-ai-能力-模块映射矩阵)
8. [AI Prompt 管理规范](#8-ai-prompt-管理规范)
9. [AI 不做什么（红线清单）](#9-ai-不做什么红线清单)
10. [分阶段 AI 落地路线图](#10-分阶段-ai-落地路线图)

---

## 1. AI 能力概述与设计原则

### 1.1 产品 AI 定位

理然智能招聘 AI 看板的 AI 能力**不是**一个独立的聊天机器人或对话界面，而是将 AI 能力分层嵌入招聘工作流的每个环节：

```
招聘数据沉淀
  → Layer 1 规则引擎识别风险
    → Layer 2 AI 增强分析提供判断依据
      → Layer 3 有限自动执行低风险操作
        → 人确认关键决策
          → Action 闭环
            → Activity 留痕
              → 管理层复盘
```

### 1.2 核心设计原则

| # | 原则 | 说明 |
|---|------|------|
| 1 | **AI 辅助，不替代** | AI 输出永远是参考建议，最终决策权在人 |
| 2 | **分层递进** | L1 确定性规则 → L2 AI 增强 → L3 有限自动，逐层成熟后开放 |
| 3 | **数据闭环** | 每次 AI 调用必须记录 AiAnalysisLog，包含输入快照、输出结果、确认状态 |
| 4 | **可追溯** | 所有 AI 建议必须标注来源（依据哪些数据）和置信度 |
| 5 | **可撤销** | L3 自动操作必须可回滚，人可覆盖 |
| 6 | **不接裸数据** | 不把原始简历文本、邮件正文等非结构化 PII 直接送入 LLM |
| 7 | **Provider 无关** | AI 调用层抽象 provider（OpenAI / Claude / 本地模型），不锁定单一供应商 |
| 8 | **渐进式验证** | L1 先行验证 → L2 小范围灰度 → L3 全量需人确认 |

### 1.3 三层能力总览

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 3: Autonomous Intelligence                            │
│  "自主执行低风险操作"                                           │
│  周报初稿 / 模板推荐 / 自动标记                                   │
│  Phase 13+ | 置信度：待验证                                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Layer 2: Assisted Intelligence                      │    │
│  │  "AI 增强分析，人确认"                                  │    │
│  │  匹配度 / 质量评估 / 聚类 / 校准建议 / 风险预测 / 趋势摘要    │    │
│  │  Phase 10+ | 置信度：60-90%                            │    │
│  │  ┌──────────────────────────────────────────────┐    │    │
│  │  │  Layer 1: System Intelligence                │    │    │
│  │  │  "确定性规则引擎，全自动"                        │    │    │
│  │  │  逾期检测 / 状态异常 / 数据完整性 / 阈值告警       │    │    │
│  │  │  ✅ Phase 7.D 已实现 | 置信度：100%              │    │    │
│  │  └──────────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Layer 1：System Intelligence（系统智能 / 规则引擎）

### 2.1 定义

基于真实 DB 数据的**确定性规则**，不调用任何 LLM，100% 可解释、可复现。

### 2.2 技术实现

```
Prisma Query + 业务规则配置
  ├── 实时检测：API 请求时同步执行（如创建 Feedback 后检查是否逾期）
  ├── 定时任务：每分钟/每小时轮询（如检查长期无推进的候选人）
  └── 手动触发：用户在 UI 点击"刷新检测"
```

关键代码位置（已实现）：
- `server/repositories/action/action-repository.ts` — `getActionByIdWithScope()`
- `app/api/actions/route.ts` — GET handler 含 overdueOnly 筛选

### 2.3 能力清单

| # | 能力 | 规则 | 触发时机 | Action 类型 | 当前状态 |
|---|------|------|---------|------------|---------|
| L1-1 | 反馈逾期检测 | 面试完成 > 24h 无 Feedback | 定时 + API 实时 | `FEEDBACK_OVERDUE` | ✅ 已实现 |
| L1-2 | 业务反馈逾期 | 业务反馈请求 > 48h 无响应 | 定时 + API 实时 | `FEEDBACK_OVERDUE` | ✅ 已实现 |
| L1-3 | 候选人长期无推进 | Application 在同一 stage > 14 天 | 定时 | `STALLED_HR_SCREEN` / `STALLED_BUSINESS_SCREEN` | ✅ 已实现 |
| L1-4 | 岗位超期未关闭 | Job status=open 且超过目标到岗日期 | 定时 | `STALLED_HR_SCREEN` | ✅ 已实现 |
| L1-5 | Offer 风险检测 | Offer 阶段候选人 72h 无活动 | 定时 | `OFFER_RISK_HIGH` | 🔲 Phase 9+ |
| L1-6 | 反馈质量阈值 | feedbackQualityScore < 60 | API 实时 | `EVIDENCE_INSUFFICIENT` | 🔲 Phase 10+ |
| L1-7 | 淘汰率异常 | 某岗位某阶段淘汰率 > 80% | 定时 | `CALIBRATION_NEEDED` | 🔲 Phase 10+ |
| L1-8 | 画像校准逾期 | ProfileCalibration status=draft > 7 天 | 定时 | `CALIBRATION_NEEDED` | 🔲 Phase 11+ |

### 2.4 输入输出契约

**输入**：无外部输入，仅依赖 DB 查询

**输出**：`ActionItem` 记录

```json
{
  "title": "媒介投放一面反馈已超时 5 天，需催办面试官",
  "category": "反馈催办",
  "priority": "high",
  "sourceType": "system_rule",
  "sourceRefId": "interview_cmxxx",
  "sourceSummary": "面试完成于 2026-06-22，至今未收到反馈",
  "dueAt": "2026-06-28T00:00:00Z",
  "jobId": "cmxxx",
  "candidateId": "cmxxx"
}
```

### 2.5 人机协作模式

- **生成**：全自动（无需人触发）
- **处理**：人手动 Resolve / Dismiss
- **可覆盖**：人可手动创建 Action 补充规则未覆盖的情况

### 2.6 当前状态

✅ **已实现并验证**。Phase 7.D Final Lock 中已验证：
- 逾期 Action 自动出现在列表
- 逾期筛选正常工作
- ActivityLog 记录完整

---

## 3. Layer 2：Assisted Intelligence（辅助智能 / AI 增强分析）

### 3.1 定义

调用 LLM 对**已结构化**的招聘数据进行分析，输出**结构化建议**。人审核确认后才执行后续操作。

### 3.2 技术实现

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  结构化数据    │────▶│  Prompt       │────▶│  LLM API    │
│  (JSON)      │     │  Engineering  │     │  (可切换)    │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                    ┌──────────────┐              │
                    │  AiAnalysis  │◀─────────────┘
                    │  Log 记录     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  人审核确认    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         生成 Action   更新画像      忽略建议
```

### 3.3 能力清单

| # | 能力 | 输入数据 | LLM 任务 | 输出 | 触发方式 | 当前状态 |
|---|------|---------|---------|------|---------|---------|
| L2-1 | 候选人匹配度分析 | 岗位画像 + 候选人简历摘要 + 面试评分 | 多维度匹配度评分 + 推荐理由 + 风险提示 | MatchResult JSON | 用户手动触发 | 🔲 Phase 10+ |
| L2-2 | 面试反馈质量评估 | 6 维度评分 + evidenceText + riskNotes | 证据充分度 + 评分一致性 + 改进建议 | QualityAssessment JSON | 反馈提交时自动 | 🔲 Phase 10+ |
| L2-3 | 淘汰原因聚类分析 | 同岗位 BusinessFeedback reasonCode 列表 | 识别淘汰模式 + 画像偏差建议 | ClusterAnalysis JSON | 用户手动触发 | 🔲 Phase 11+ |
| L2-4 | 岗位画像校准建议 | 淘汰数据 + 面试反馈 + 当前画像 | 建议调整 mustHave/niceToHave/目标公司 | CalibrationSuggestion JSON | 连续淘汰触发 | 🔲 Phase 11+ |
| L2-5 | Offer 风险预测 | 候选人薪资期望 + 历史 Offer 数据 + 竞品信息 | 风险等级 + 概率 + 建议动作 | OfferRiskPrediction JSON | 用户手动触发 | 🔲 Phase 11+ |
| L2-6 | 招聘趋势摘要 | 周期内 KPI 数据（结构化） | 自然语言描述趋势变化 | TrendSummary JSON | 生成报告时 | 🔲 Phase 13+ |

### 3.4 输入数据契约

**关键规则**：不传原始文本，只传结构化 JSON。必须去除 PII。

```typescript
// 示例：候选人匹配度分析的输入
interface MatchAnalysisInput {
  job: {
    title: string;
    level: string;
    mustHave: string[];       // 结构化标签，非原始 JD 文本
    niceToHave: string[];
    targetCompanies: string[];
  };
  candidate: {
    yearsOfExperience: number;
    currentLevel: string;
    industryTags: string[];   // 结构化标签，非简历全文
    skillTags: string[];
    educationLevel: string;
  };
  interviewSummary?: {
    round: string;
    scores: Record<string, number>;  // 结构化评分，非面试记录全文
    recommendation: string;
  };
  // 注意：以下字段明确不传
  // ❌ candidateName
  // ❌ candidateEmail
  // ❌ candidatePhone
  // ❌ resumeFullText
  // ❌ interviewTranscript
}
```

### 3.5 输出数据契约

所有 Layer 2 输出必须遵循统一结构：

```typescript
interface AiAnalysisOutput {
  analysisType: string;
  confidence: number;           // 0-1，置信度
  reasoning: string;            // 分析推理过程（自然语言）
  suggestion: string;           // 建议动作（自然语言）
  evidenceRefs: {               // 依据的数据引用
    type: string;               // "business_feedback" | "interview_feedback" | "application" | ...
    id: string;
    summary: string;            // 人类可读的摘要
  }[];
  riskLevel?: "low" | "medium" | "high" | "critical";
  actionable: boolean;          // 是否建议生成 Action
  suggestedAction?: {           // 如果 actionable=true
    title: string;
    category: string;
    priority: string;
  };
}
```

### 3.6 人机协作模式

```
1. 用户点击"AI 分析"或系统事件触发
2. 系统准备结构化输入 → 调用 LLM → 记录 AiAnalysisLog
3. UI 展示分析结果（含置信度 + 依据引用）
4. 用户选择：
   a. 确认 → isConfirmed=true → 按建议执行（生成 Action / 更新画像）
   b. 调整 → 用户修改建议后确认
   c. 忽略 → isConfirmed=false → 仅保留日志
```

### 3.7 当前状态

🔲 **框架已定义，API 路由预留，Phase 10+ 实现**

已就绪的基础设施：
- `AiAnalysisLog` 模型已完整定义（Prisma schema）
- `aiAnalysisType` 枚举已包含 resume_analysis / interview_performance / interviewer_quality / job_bottleneck / ai_qa
- `/api/actions/generate` 路由已预留

---

## 4. Layer 3：Human-Confirmed Execution（人工确认后的执行闭环）

### 4.1 定义

Layer 3 不是 AI 自主决策或自动执行。它是在 Layer 2（AI 辅助建议）输出 + 人工确认后，系统在严格约束下执行低风险操作。

**核心原则：所有执行动作必须由 HR / 业务 / 管理者确认。**

### 4.2 当前状态

**🔒 当前不启用自动执行。**

在以下条件全部满足之前，Layer 3 不开放任何自动执行能力：
1. Layer 2 的置信度和准确性经过充分验证
2. 每条自动规则有对应的回滚机制
3. 所有自动操作有完整的 AiAnalysisLog 审计
4. 管理后台可查看和撤销任何自动操作

### 4.3 未来允许的范围（严格限定）

当条件成熟后，仅允许以下低风险操作：

- 自动生成周报初稿（draft 状态，需人确认后发布）
- 自动推荐知识库模板（基于岗位类型匹配，需人选择使用）
- 自动标记低质量反馈（标记为"待复核"，不自动下结论）

### 4.4 红线（永远不自动执行）

| 禁止的自动操作 | 原因 |
|---------------|------|
| 不自动录用 | 录用决策必须由人做出 |
| 不自动淘汰 | 淘汰决策必须由人做出 |
| 不自动推进候选人阶段 | 流程推进必须由 HR 确认 |
| 不自动发 Offer | Offer 发送必须由 HR 操作 |
| 不自动创建或关闭 Action | Action 管理必须由责任人确认 |
| 不自动修改岗位画像 | 画像变更必须由业务确认 |
| 不自动发送外部通知 | 外部沟通必须由人发起 |

### 4.5 人机协作模式

```
AI 分析 → 生成建议 → 人工审核 → 确认执行 → ActivityLog 记录
                                ↘ 驳回 → 记录驳回原因
```

每一步执行后必须在 ActivityLog 中记录：
- 谁确认的
- 确认时间
- 执行的什么操作
- 操作的依据（AI 分析 ID）

---

## 5. AI 数据契约

### 5.1 通用输入契约

```typescript
interface AiAnalysisRequest {
  analysisType: AiAnalysisType;
  resourceType: string;
  resourceId: string;
  userId: string;
  input: Record<string, unknown>;  // 结构化 JSON，必须符合各能力输入 schema
  promptName: string;
  promptVersion: string;
  provider?: string;  // 可选，默认使用系统配置
  model?: string;     // 可选
}
```

### 5.2 通用输出契约

```typescript
interface AiAnalysisResponse {
  id: string;
  analysisType: AiAnalysisType;
  resourceType: string;
  resourceId: string;
  confidence: number;
  output: AiAnalysisOutput;  // 见 Layer 2 输出契约
  isFallback: boolean;       // 是否使用了 fallback 规则
  provider: string;
  model: string;
  createdAt: string;
}
```

### 5.3 PII 脱敏规则

| 数据类别 | 处理方式 | 说明 |
|---------|---------|------|
| 候选人姓名 | ❌ 不传 | 用匿名 ID 替代 |
| 候选人邮箱/电话 | ❌ 不传 | 完全剥离 |
| 简历全文 | ❌ 不传 | 提取结构化标签后传入 |
| 面试记录全文 | ❌ 不传 | 提取评分和关键结论后传入 |
| 面试官姓名 | ❌ 不传 | 用匿名 ID 替代 |
| 岗位名称 | ✅ 可传 | 非 PII |
| 部门名称 | ✅ 可传 | 非 PII |
| 评分数据 | ✅ 可传 | 结构化数字 |
| 淘汰原因代码 | ✅ 可传 | 枚举值 |
| 技能标签 | ✅ 可传 | 结构化标签 |

---

## 6. AI 安全与合规

### 6.1 AiAnalysisLog 审计

每次 AI 调用必须记录以下字段到 `AiAnalysisLog`：

| 字段 | 说明 |
|------|------|
| `id` | 唯一标识 |
| `analysisType` | 分析类型枚举 |
| `resourceType` + `resourceId` | 分析目标 |
| `userId` | 触发者 |
| `inputHash` | 输入数据的 hash（用于去重和审计） |
| `promptName` + `promptVersion` | Prompt 版本追踪 |
| `provider` + `model` | 使用的 AI 服务 |
| `confidence` | AI 输出置信度 |
| `outputJson` | 完整 AI 输出 |
| `sanitizedInputSnapshot` | 脱敏后的输入快照（用于审计） |
| `isFallback` | 是否使用了 fallback 规则 |
| `isConfirmed` + `confirmedBy` + `confirmedAt` | 人工确认追踪 |

### 6.2 人工确认门

以下操作必须经过人工确认：

| 操作 | 确认方式 | 可撤销 |
|------|---------|--------|
| 基于 AI 建议生成 Action | 点击"确认并创建" | ✅ 可 Dismiss |
| 基于 AI 建议更新画像 | 点击"确认并更新" | ✅ ProfileCalibration 版本化 |
| 发布 AI 生成的报告 | 点击"确认并发布" | ✅ 可归档 |
| AI 自动标记低质量反馈 | 人复核确认 | ✅ 可修改标记 |

### 6.3 数据隔离

- AI 调用的数据不与招聘主数据混存
- `sanitizedInputSnapshot` 与 `outputJson` 存储在独立的 `AiAnalysisLog` 表
- 支持按 `userId` / `resourceId` / `analysisType` 查询和清理

---

## 7. AI 能力-模块映射矩阵

| 模块 | Layer 1 规则引擎 | Layer 2 AI 增强 | Layer 3 自动执行 | 当前状态 |
|------|:---:|:---:|:---:|------|
| 招聘总览（AI 招聘洞察看板） | ✅ 逾期/卡点统计 | 🔲 趋势摘要 | — | 🔲 Phase 9+ |
| 风险行动中心 | ✅ 自动生成 Action | — | — | ✅ 已交付 |
| 岗位中心 | ✅ 卡点/逾期检测 | 🔲 画像校准建议 | — | 🔲 Phase 10+ |
| 候选人中心 | ✅ 长期无推进检测 | 🔲 匹配度分析 | — | 🔲 Phase 10+ |
| 面试中心 | ✅ 反馈逾期检测 | 🔲 反馈质量评估 | 🔲 自动标记低质量 | 🔲 Phase 10+ |
| 面评质量中心 | ✅ 质量阈值检测 | 🔲 质量趋势分析 | 🔲 自动标记 | 🔲 Phase 11+ |
| Offer 风险中心 | ✅ 风险检测 | 🔲 风险预测 | — | 🔲 Phase 11+ |
| 报告与复盘 | — | 🔲 趋势摘要 + 聚类 | 🔲 自动生成初稿 | 🔲 Phase 13+ |
| 知识库 | — | 🔲 模板推荐 | 🔲 自动推荐 | 🔲 Phase 14+ |
| 系统设置 | — | — | — | — |

---

## 8. AI Prompt 管理规范

### 8.1 Prompt 版本化

```
prompts/
├── v1/
│   ├── match-analysis.md        # 候选人匹配度分析
│   ├── feedback-quality.md      # 反馈质量评估
│   ├── cluster-analysis.md      # 淘汰原因聚类
│   └── trend-summary.md         # 招聘趋势摘要
├── v2/
│   └── ...
└── production.yaml              # 当前生产版本配置
```

### 8.2 Prompt 结构规范

每个 prompt 文件必须包含：

```markdown
# Prompt: [能力名称]
- Version: v1.0.0
- Model: gpt-4o / claude-sonnet-4
- Temperature: 0.3 (分析类任务低温度)
- Max Tokens: 2000

## System Prompt
[系统角色和约束]

## Input Schema
[JSON Schema 定义]

## Output Schema
[JSON Schema 定义]

## Examples
[Few-shot examples]

## Fallback Rules
[当 LLM 不可用时的降级策略]
```

### 8.3 A/B 测试

- 同一能力可配置多个 prompt 版本
- 通过 `promptVersion` 字段追踪效果
- 以人工确认率（isConfirmed / total）作为核心评估指标

### 8.4 回退机制

```
LLM 调用
  ├── 成功 → 返回 AI 结果
  ├── 超时 (5s) → isFallback=true → 返回规则引擎结果
  ├── 错误 → isFallback=true → 返回空 + 错误提示
  └── Provider 不可用 → 切换备用 Provider → 仍失败 → fallback
```

---

## 9. AI 不做什么（红线清单）

### 9.1 绝对红线

| # | 禁止事项 | 原因 |
|---|---------|------|
| 1 | **不自动淘汰候选人** | 招聘决策权在人 |
| 2 | **不自动推进候选人阶段** | 同上 |
| 3 | **不自动发送外部通知** | 避免不可控的客户沟通 |
| 4 | **不自动生成或发送 Offer** | 法律风险 |
| 5 | **不覆盖面试官评分** | 破坏数据真实性 |
| 6 | **不做情绪分析** | 技术不成熟 + 伦理风险 |
| 7 | **不做候选人排名** | 避免算法偏见放大 |
| 8 | **不做薪资建议** | 薪酬策略是管理决策 |
| 9 | **不基于受保护特征做判断** | 避免歧视（性别/年龄/种族等） |
| 10 | **不做"黑箱"决策** | 所有 AI 输出必须有 reasoning |

### 9.2 设计红线

| # | 禁止事项 | 原因 |
|---|---------|------|
| 1 | 不在 UI 上展示未确认的 AI 建议为"事实" | 必须标注"AI 辅助分析，仅供参考" |
| 2 | 不隐藏置信度 | 所有 AI 输出必须显示置信度 |
| 3 | 不伪造 AI 分析 | 没有 LLM 接入就不要展示 AI 区域 |
| 4 | 不把 AI 当搜索 | AI 不是数据库查询替代品 |

---

## 10. 分阶段 AI 落地路线图

```
Phase 7.D ✅
  └── Layer 1：逾期检测、卡点识别、Action 自动生成
      已验证：9 条 Action，逾期筛选正常，ActivityLog 完整

Phase 9 (下一阶段)
  └── Layer 1 扩展：Offer 风险检测规则
  └── Dashboard KPI 聚合（非 AI，但为 AI 准备数据基础）

Phase 10
  └── Layer 2 试点：候选人匹配度分析（单个能力）
  └── Layer 2 试点：面试反馈质量评估
  └── Prompt v1 上线 + A/B 测试框架
  └── AiAnalysisLog 查询和审计 UI

Phase 11
  └── Layer 2 扩展：淘汰原因聚类 + 画像校准建议
  └── Layer 2 扩展：Offer 风险预测
  └── Layer 1 扩展：反馈质量阈值 + 淘汰率异常

Phase 12
  └── Layer 2 成熟期：全量 Prompt 优化
  └── 置信度校准（基于人工确认率反馈）
  └── Provider 切换和 fallback 验证

Phase 13
  └── Layer 3 试点：自动生成周报初稿
  └── Layer 2 扩展：招聘趋势摘要
  └── 人工确认门 UI 完善

Phase 14
  └── Layer 3 扩展：自动推荐模板 + 自动标记低质量反馈
  └── AI 能力全面运营和迭代

Phase 15+
  └── Layer 3 扩展（基于 Phase 13-14 验证结果）
  └── 自定义规则引擎（允许 HR 配置自己的检测规则）
```

---

> **结论**：AI 在理然招聘看板中不是点缀，而是分层嵌入工作流的能力体系。从确定性规则（L1）到 AI 增强分析（L2）再到有限自动执行（L3），每一步都建立在数据闭环和人工确认的基础上。当前 L1 已交付，L2/L3 框架已定义，后续按路线图逐步落地。
