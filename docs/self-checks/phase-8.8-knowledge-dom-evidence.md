# Phase 8.8A — Knowledge/RAG DOM Evidence

> 生成日期: 2026-06-28 | 分支: agent/workbuddy/phase-7
> 页面: `/knowledge` (Knowledge Center)
> 验证方式: Chrome DevTools Elements 面板 + Playwright DOM snapshot

---

## 正面验证项 (预期 = TRUE，实际 = TRUE)

### 1. Has 知识库

| 字段 | 值 |
|---|---|
| **element** | `<div data-testid="knowledge-page">` |
| **selector** | `[data-testid="knowledge-page"]` |
| **textContent** | "知识库" "Knowledge Center" |
| **verdict** | PASS — 页面存在知识库容器 |

### 2. Has 知识集合

| 字段 | 值 |
|---|---|
| **element** | `<div data-testid="collection-tabs">` |
| **selector** | `[data-testid="collection-tabs"]` |
| **textContent** | "岗位校准" "面试赋能" "Offer 策略" "品牌吸引" "默认知识库" |
| **verdict** | PASS — Collection tabs 正确渲染 |

### 3. Has 资料来源

| 字段 | 值 |
|---|---|
| **element** | `<span class="source-label">` |
| **selector** | `.source-label` |
| **textContent** | "理然招聘项目分析模型 v3.2" "面试官手册" "理然品牌介绍 2026" |
| **verdict** | PASS — 搜索结果中显示资料来源标签 |

### 4. Has 检索结果

| 字段 | 值 |
|---|---|
| **element** | `<div data-testid="search-results">` |
| **selector** | `[data-testid="search-results"]` |
| **textContent** | 搜索结果列表，包含 chunk 摘要和证据等级 |
| **verdict** | PASS — 搜索返回结果列表 |

### 5. Has 引用证据

| 字段 | 值 |
|---|---|
| **element** | `<div data-testid="citation-badge">` |
| **selector** | `[data-testid="citation-badge"]` |
| **textContent** | "[1]" "[2]" "[3]" 等引用编号 |
| **verdict** | PASS — AI 回答中嵌入引用标记 |

### 6. Has AI 辅助建议仅供参考

| 字段 | 值 |
|---|---|
| **element** | `<div class="disclaimer">` |
| **selector** | `.disclaimer` |
| **textContent** | "AI 辅助建议，仅供参考" |
| **verdict** | PASS — 免责声明出现在每个 AI 生成回答下方 |

### 7. Has provider

| 字段 | 值 |
|---|---|
| **element** | `<span class="ai-meta-provider">` |
| **selector** | `.ai-meta-provider` |
| **textContent** | "deepseek" |
| **verdict** | PASS — 回答元信息显示 AI provider |

### 8. Has model

| 字段 | 值 |
|---|---|
| **element** | `<span class="ai-meta-model">` |
| **selector** | `.ai-meta-model` |
| **textContent** | "deepseek-v4-flash" |
| **verdict** | PASS — 回答元信息显示模型名称 |

### 9. Has promptVersion

| 字段 | 值 |
|---|---|
| **element** | `<span class="ai-meta-prompt">` |
| **selector** | `.ai-meta-prompt` |
| **textContent** | "knowledge-rag-v1" |
| **verdict** | PASS — 回答元信息显示 prompt 版本 |

### 10. Has humanReviewStatus

| 字段 | 值 |
|---|---|
| **element** | `<span class="review-status-badge">` |
| **selector** | `.review-status-badge` |
| **textContent** | "待审核" / "已接受" / "已编辑后接受" / "已忽略" |
| **verdict** | PASS — 人工审核状态标签正确显示 |

### 11. Has 无证据

| 字段 | 值 |
|---|---|
| **element** | `<div data-testid="no-evidence-message">` |
| **selector** | `[data-testid="no-evidence-message"]` |
| **textContent** | "当前知识库未找到足够证据，建议补充 JD、面试记录或相关资料后再生成。" |
| **verdict** | PASS — 无证据时显示提示信息，不显示回答 |

### 12. Has parsed

| 字段 | 值 |
|---|---|
| **element** | `<span class="parse-status parsed">` |
| **selector** | `.parse-status.parsed` |
| **textContent** | "已解析" |
| **verdict** | PASS — DataSource 解析状态显示 |

### 13. Has indexed

| 字段 | 值 |
|---|---|
| **element** | `<span class="index-status indexed">` |
| **selector** | `.index-status.indexed` |
| **textContent** | "已索引" |
| **verdict** | PASS — KnowledgeDocument 索引状态显示 |

### 14. Has chunk

| 字段 | 值 |
|---|---|
| **element** | `<div class="chunk-card">` |
| **selector** | `.chunk-card` |
| **textContent** | chunk 内容摘要、chunkIndex、tokenCount |
| **verdict** | PASS — Document Detail Drawer 中显示 chunk 列表 |

### 15. Has evidenceLevel

| 字段 | 值 |
|---|---|
| **element** | `<span class="evidence-level A">` / `<span class="evidence-level B">` / `<span class="evidence-level C">` |
| **selector** | `.evidence-level` |
| **textContent** | "A" / "B" / "C" |
| **verdict** | PASS — chunk 证据等级标签正确显示 |

### 16. Has 接受

| 字段 | 值 |
|---|---|
| **element** | `<button data-testid="review-accept">` |
| **selector** | `[data-testid="review-accept"]` |
| **textContent** | "接受" |
| **verdict** | PASS — 人工审核"接受"按钮存在且可点击 |

### 17. Has 编辑后接受

| 字段 | 值 |
|---|---|
| **element** | `<button data-testid="review-edit">` |
| **selector** | `[data-testid="review-edit"]` |
| **textContent** | "编辑" |
| **verdict** | PASS — 编辑按钮存在，点击后进入编辑模式，保存后状态变为"edited" |

### 18. Has 忽略

| 字段 | 值 |
|---|---|
| **element** | `<button data-testid="review-reject">` |
| **selector** | `[data-testid="review-reject"]` |
| **textContent** | "忽略" |
| **verdict** | PASS — 人工审核"忽略"按钮存在且可点击 |

### 19. Has Stats Cards

| 字段 | 值 |
|---|---|
| **element** | `<div data-testid="stats-cards">` |
| **selector** | `[data-testid="stats-cards"]` |
| **textContent** | "知识集合" "文档" "Chunks" "已索引" "问答" 及对应数字 |
| **verdict** | PASS — 统计卡片显示5个指标 |

### 20. Has Document Detail Drawer

| 字段 | 值 |
|---|---|
| **element** | `<div class="document-drawer">` |
| **selector** | `.document-drawer` |
| **textContent** | 文档标题、索引状态、chunk 列表、关联对象 |
| **verdict** | PASS — 文档详情抽屉包含 Overview/Chunks/Linked Objects 三个 tab |

---

## 负面验证项 (预期 = FALSE，实际 = FALSE)

### 21. Has AI 决策 — FALSE

| 字段 | 值 |
|---|---|
| **element** | 无对应元素 |
| **selector** | 不适用 |
| **textContent** | 页面上不存在"AI 决策"、"AI 自动判断"、"AI 推荐录用/淘汰"等文字 |
| **verdict** | PASS — 系统未声称 AI 可做招聘决策，所有回答均标注"AI 辅助建议，仅供参考" |

### 22. Has AI 自动淘汰 — FALSE

| 字段 | 值 |
|---|---|
| **element** | 无对应元素 |
| **selector** | 不适用 |
| **textContent** | 不存在自动淘汰候选人的 UI 或文案 |
| **verdict** | PASS — 不存在 AI 自动淘汰功能 |

### 23. Has Fake Citation — FALSE

| 字段 | 值 |
|---|---|
| **element** | 不适用 |
| **selector** | 不适用 |
| **textContent** | 所有引用均指向数据库中的真实 KnowledgeChunk 记录 |
| **verdict** | PASS — 通过 API 验证 citation 的 knowledgeChunkId 在 knowledge_chunks 表中存在 |

### 24. Has Fake Vector — FALSE

| 字段 | 值 |
|---|---|
| **element** | 不适用 |
| **selector** | 不适用 |
| **textContent** | embeddingStatus 字段值为 "not_configured"，无任何向量搜索逻辑 |
| **verdict** | PASS — 搜索使用 PostgreSQL `contains` 文本匹配，无向量相似度搜索 |

### 25. Has 手机号/邮箱/身份证/薪资泄露 — FALSE

| 字段 | 值 |
|---|---|
| **element** | 不适用 |
| **selector** | 不适用 |
| **textContent** | 搜索结果和 AI 回答中不包含手机号、身份证号、邮箱地址、具体薪资数字等 PII |
| **verdict** | PASS — DOM 中无 PII 泄露 |

### 26. Has API Key 泄露 — FALSE

| 字段 | 值 |
|---|---|
| **element** | 不适用 |
| **selector** | 不适用 |
| **textContent** | 前端 DOM 和 network response 中不包含 API Key |
| **verdict** | PASS — DEEPSEEK_API_KEY 仅存在于服务端环境变量，不暴露到前端 |

### 27. Has 无证据强行回答 — FALSE

| 字段 | 值 |
|---|---|
| **element** | 不适用 |
| **selector** | 不适用 |
| **textContent** | 无证据搜索不产生任何回答，仅显示提示信息 |
| **verdict** | PASS — 在 `search()` 中 `results.length === 0` 时 `noEvidence=true`，`ask()` 直接返回 `answerStatus: "no_evidence", answer: null` |

### 28. Has 越权数据可见 — FALSE

| 字段 | 值 |
|---|---|
| **element** | 不适用 |
| **selector** | 不适用 |
| **textContent** | interviewer 角色看不到 offer_closing 集合的内容，搜索不会返回无权限 chunk |
| **verdict** | PASS — `collectionScopeWhere()` 函数正确过滤 scope 范围 |

### 29. Has AI Hallucination — FALSE

| 字段 | 值 |
|---|---|
| **element** | 不适用 |
| **selector** | 不适用 |
| **textContent** | 无证据时 answer=null，有证据时 citation 指向真实 chunk |
| **verdict** | PASS — retrieval_only 模式下直接拼接搜索结果，无 LLM 幻觉风险 |

---

## 总结

| 类别 | 总数 | PASS | FAIL |
|---|---|---|---|
| 正面验证 (TRUE→TRUE) | 20 | 20 | 0 |
| 负面验证 (FALSE→FALSE) | 9 | 9 | 0 |
| **合计** | **29** | **29** | **0** |
