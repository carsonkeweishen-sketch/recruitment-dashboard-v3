# Phase 8.11 AI Copilot — DOM 证据

> 验证方式：浏览器端 DOM 断言（cypress/playwright 选择器验证）
> 截图目录：`/screenshots/phase-8.11-ai-copilot/`
> 日期：2026-06-28

---

## 正向断言（必须存在的元素/文本）

| # | 断言 | 选择器/文本 | 截图 | Verdict |
|---|---|---|---|---|
| 1 | Has AI Copilot | `[data-testid="ai-copilot-panel"]` 或 `.copilot-panel` | 01-11 | PASS |
| 2 | Has "AI 辅助建议仅供参考" | 文本包含 "AI 辅助建议仅供参考" | 30 | PASS |
| 3 | Has provider | 页面可见 provider 名称（如 "DeepSeek"） | 13 | PASS |
| 4 | Has model | 页面可见 model 名称（如 "deepseek-chat"） | 13 | PASS |
| 5 | Has promptVersion | 页面可见 prompt 版本号 | 13 | PASS |
| 6 | Has humanReviewStatus | 页面显示审查状态（pending/accepted/edited/rejected） | 14,16,17,18 | PASS |
| 7 | Has citation | AI 回答中包含可点击的引用来源 | 12 | PASS |
| 8 | Has transcript segment | 语音转写文本在 context 中展示 | 09 | PASS |
| 9 | Has draft action | 草稿动作卡片展示 | 19 | PASS |
| 10 | Has "仅生成草稿" | 草稿动作区域显示 "仅生成草稿" 说明 | 19 | PASS |
| 11 | Has "接受" 按钮 | 人工审查栏含 "接受" 按钮 | 14,16 | PASS |
| 12 | Has "编辑后接受" 按钮 | 人工审查栏含 "编辑后接受" 按钮 | 14,17 | PASS |
| 13 | Has "忽略" 按钮 | 人工审查栏含 "忽略" 按钮 | 14,18 | PASS |
| 14 | Has no_evidence 提示 | 无证据时显示 "暂无相关数据" | 21 | PASS |
| 15 | Has Topbar AI 按钮 | AppShell Topbar 中有 AI Copilot 入口 | 28 | PASS |
| 16 | Has prompt starters | 建议提示词列表可见 | 29 | PASS |
| 17 | Has context stack chips | Context 来源堆叠显示为 chips | 10 | PASS |
| 18 | Has safety banner | 安全提示横幅可见 | 30 | PASS |
| 19 | Has activity log readable | ActivityLog 列表人话化展示 | 24 | PASS |
| 20 | Has provider health status | Provider 健康状态指示 | 26 | PASS |

---

## 负向断言（不得存在的元素/文本）

| # | 断言 | 禁止出现的文本/行为 | 截图 | Verdict |
|---|---|---|---|---|
| 1 | No "AI 决策" | 不出现 "AI 自动决策" 等文字 | 全部 | PASS |
| 2 | No "AI 自动淘汰" | 不出现 "AI 自动淘汰候选人" | 全部 | PASS |
| 3 | No "AI 自动录用" | 不出现 "AI 自动录用" | 全部 | PASS |
| 4 | No "自动发 Offer" | 不出现 "自动发送 Offer" | 全部 | PASS |
| 5 | No fake citation | 引用必须可点击溯源，不存在无效链接 | 12 | PASS |
| 6 | No 手机号（明文） | context/answer 中不含未脱敏手机号 | 22 | PASS |
| 7 | No 邮箱（明文） | context/answer 中不含未脱敏邮箱 | 22 | PASS |
| 8 | No 身份证号 | context/answer 中不含身份证号 | 22 | PASS |
| 9 | No API Key | 前端页面不暴露 API Key | 13 | PASS |
| 10 | No 跨权限数据 | 未授权 scope 的数据不可见 | 23 | PASS |
| 11 | No 自动执行标记 | 草稿动作无 "已自动执行" 标记 | 19 | PASS |
| 12 | No 情绪分析结果 | 页面不展示情绪/情感分析 | 全部 | PASS |

---

## 逐截图 DOM 覆盖

| 截图编号 | 描述 | 覆盖的正向断言 | 覆盖的负向断言 |
|---|---|---|---|
| 01 | Copilot Panel — Dashboard Context | #1 | — |
| 02 | Copilot Panel — Job Context | #1 | — |
| 03 | Copilot Panel — Candidate Context | #1 | #10 (候选人数据脱敏) |
| 04 | Copilot Panel — Interview Quality Context | #1 | — |
| 05 | Copilot Panel — Offer Risk Context | #1 | — |
| 06 | Copilot Panel — Action Context | #1 | — |
| 07 | Copilot Panel — Funnel Context | #1 | — |
| 08 | Copilot Panel — Knowledge Context | #1 | — |
| 09 | Copilot Panel — Speech Transcript Context | #1, #8 | — |
| 10 | Context Stack with Chips | #17 | — |
| 11 | Copilot Panel — Data Source Context | #1 | — |
| 12 | Answer with Citations | #7 | #5 |
| 13 | Provider/Model/Prompt Visible | #3, #4, #5 | #9 |
| 14 | Human Review Pending | #6, #11, #12, #13 | — |
| 15 | Not Configured State | — | — |
| 16 | Human Review Accepted | #6, #11 | — |
| 17 | Human Review Edited | #6, #12 | — |
| 18 | Human Review Rejected | #6, #13 | — |
| 19 | Draft Action Preview | #9, #10 | #11 |
| 20 | Draft Action Confirmed → Action Center | — | — |
| 21 | No Evidence Blocked | #14 | — |
| 22 | Redaction Proof | — | #6, #7, #8 |
| 23 | Permission Denied — No Object Leak | — | #10 |
| 24 | Activity Log Readable | #19 | — |
| 25 | Audit Log — Provider Call | — | — |
| 26 | Provider Timeout State | #20 | — |
| 27 | Mobile Width Safe | — | — |
| 28 | Topbar AI Button Closeup | #15 | — |
| 29 | Prompt Starters Closeup | #16 | — |
| 30 | Safety Banner Closeup | #2, #18 | #1, #2, #3, #4, #12 |

---

## 结论

| 检查项 | 结果 |
|---|---|
| 正向断言 | 20/20 PASS |
| 负向断言 | 12/12 PASS |
| 截图覆盖 | 30/30 张 |

**DOM 证据全部通过。**
