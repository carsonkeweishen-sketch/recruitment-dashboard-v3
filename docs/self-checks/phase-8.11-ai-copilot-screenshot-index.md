# Phase 8.11 AI Copilot — 截图索引

> 截图目录：`/workspace/recruitment-dashboard/screenshots/phase-8.11-ai-copilot/`
> 截图数量：30 张（含 _u 未压缩版本共 60 个文件）
> 日期：2026-06-28

---

## 截图清单

| # | 文件名 | 描述 | 验证内容 |
|---|---|---|---|
| 01 | `01-copilot-panel-dashboard-context.png` | Copilot 面板 — 看板上下文 | Dashboard context source 适配器工作正常，Copilot 面板展示看板聚合数据 |
| 02 | `02-copilot-panel-job-context.png` | Copilot 面板 — 职位上下文 | Job context source 适配器，展示职位详情数据 |
| 03 | `03-copilot-panel-candidate-context.png` | Copilot 面板 — 候选人上下文 | Candidate context source 适配器，候选人信息已脱敏展示 |
| 04 | `04-copilot-panel-interview-quality-context.png` | Copilot 面板 — 面试质量上下文 | Interview-feedback context source，面试评价数据展示 |
| 05 | `05-copilot-panel-offer-risk-context.png` | Copilot 面板 — Offer 风险上下文 | Offer-risk context source，风险等级和因子展示 |
| 06 | `06-copilot-panel-action-context.png` | Copilot 面板 — 动作上下文 | Action context source，待办动作数据展示 |
| 07 | `07-copilot-panel-funnel-context.png` | Copilot 面板 — 漏斗上下文 | Funnel context source，转化率数据展示 |
| 08 | `08-copilot-panel-knowledge-context.png` | Copilot 面板 — 知识库上下文 | Knowledge context source，知识库条目展示 |
| 09 | `09-copilot-panel-speech-transcript-context.png` | Copilot 面板 — 语音转写上下文 | Transcript context source，转写文本片段展示 |
| 10 | `10-copilot-context-stack-with-chips.png` | Context 来源堆叠 Chips | CopilotContextStack 组件，多来源堆叠为 chips 展示 |
| 11 | `11-copilot-panel-data-source-context.png` | Copilot 面板 — 数据源上下文 | Data-source context source 适配器 |
| 12 | `12-copilot-answer-with-citations.png` | AI 回答含引用 | CopilotAnswerCard + CopilotCitationList，citations 可点击溯源 |
| 13 | `13-copilot-provider-model-prompt-visible.png` | Provider/Model/Prompt 信息可见 | 前端可见 provider、model、promptVersion，API Key 不可见 |
| 14 | `14-copilot-human-review-pending.png` | 人工审查待处理 | CopilotHumanReviewBar，显示"接受/编辑后接受/忽略"三按钮 |
| 15 | `15-copilot-not-configured-state.png` | 未配置状态 | Copilot 未配置时的空状态展示 |
| 16 | `16-copilot-human-review-accepted.png` | 人工审查 — 已接受 | humanReviewStatus = "accepted"，显示已接受标记 |
| 17 | `17-copilot-human-review-edited.png` | 人工审查 — 已编辑 | humanReviewStatus = "edited"，显示原始版本和编辑后版本 |
| 18 | `18-copilot-human-review-rejected.png` | 人工审查 — 已拒绝 | humanReviewStatus = "rejected"，显示拒绝原因 |
| 19 | `19-copilot-draft-action-preview.png` | 草稿动作预览 | CopilotDraftActionPreview，显示"仅生成草稿"，需人工确认 |
| 20 | `20-copilot-draft-action-confirmed-to-action-center.png` | 草稿确认 → Action Center | 确认后草稿转为正式 Action，Action Center 可见 |
| 21 | `21-copilot-no-evidence-blocked.png` | 无证据短路 | evidenceStatus = "no_evidence"，AI 不编造信息 |
| 22 | `22-copilot-redaction-proof.png` | 脱敏验证 | context 和回答中无手机号/邮箱/身份证/薪资明文 |
| 23 | `23-copilot-permission-denied-no-object-leak.png` | 权限拒绝 — 无数据泄露 | 403 场景，context 和 citations 不含未授权数据 |
| 24 | `24-copilot-activity-log-readable.png` | ActivityLog 人话化展示 | 9 种 ActivityLog 类型可读展示 |
| 25 | `25-copilot-audit-log-provider-call.png` | 审计日志 — Provider 调用记录 | 审计页面展示 LLM 调用详情 |
| 26 | `26-copilot-provider-timeout-state.png` | Provider 超时状态 | Provider 健康检查超时时的状态展示 |
| 27 | `27-copilot-mobile-width-safe.png` | 移动端宽度安全 | 移动端视口下 Copilot 面板正常展示 |
| 28 | `28-copilot-topbar-ai-button-closeup.png` | Topbar AI 按钮特写 | AppShell Topbar 中的 AI Copilot 入口按钮 |
| 29 | `29-copilot-prompt-starters-closeup.png` | 建议提示词特写 | 针对当前 scope 的建议提示词列表 |
| 30 | `30-copilot-safety-banner-closeup.png` | 安全提示横幅特写 | "AI 辅助建议仅供参考" 安全提示横幅 |

---

## 截图覆盖矩阵

### 按功能模块

| 模块 | 截图编号 | 数量 |
|---|---|---|
| Context Builder (10 sources) | 01-11 | 11 |
| Answer + Citations | 12 | 1 |
| Provider/Model 信息 | 13 | 1 |
| Human Review (4 states) | 14, 16, 17, 18 | 4 |
| Draft Action (2 states) | 19, 20 | 2 |
| No Evidence | 21 | 1 |
| Redaction | 22 | 1 |
| Permission | 23 | 1 |
| ActivityLog | 24 | 1 |
| Audit | 25 | 1 |
| Provider Health | 26 | 1 |
| Mobile | 27 | 1 |
| Topbar Integration | 28 | 1 |
| Prompt Starters | 29 | 1 |
| Safety Banner | 30 | 1 |
| Not Configured | 15 | 1 |

### 按证据类型

| 证据类型 | 截图编号 |
|---|---|
| API 证据 | 01-26 (context/chat/review/draft-action 结果) |
| DOM 证据 | 全部 (UI 展示) |
| 权限证据 | 23 (403 无泄露) |
| 脱敏证据 | 03, 22 (PII 脱敏) |
| Context 证据 | 01-11 (10 个 source) |
| ActivityLog 证据 | 24 |

---

## 结论

全部 30 张截图覆盖 Phase 8.11 所有功能模块和证据类型，无遗漏。
