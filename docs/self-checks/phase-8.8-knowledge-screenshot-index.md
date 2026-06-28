# Phase 8.8A — Knowledge/RAG Screenshot Index

> 生成日期: 2026-06-28 | 分支: agent/workbuddy/phase-7
> 截图总数: 32 张（22 张原始 Phase 8.8 截图 + 10 张 Phase 8.8A 新增近景截图）
> 截图路径: `/docs/self-checks/screenshots/phase-8.8/`

---

## 原始 Phase 8.8 截图 (22 张)

### #1 | knowledge-page-success.png
- **描述**: Knowledge Center 首页 — 正常加载状态
- **证明**: 知识库页面完整渲染，包含 collection tabs、stats cards、搜索框
- **类型**: Page

### #2 | knowledge-page-empty.png
- **描述**: Knowledge Center — 空状态（无已索引文档时）
- **证明**: 空状态 UI 正确处理，不显示异常或报错
- **类型**: State

### #3 | knowledge-page-error.png
- **描述**: Knowledge Center — 错误状态（API 请求失败时）
- **证明**: 错误状态 UI 正确显示，包含重试按钮
- **类型**: State

### #4 | knowledge-page-permission-denied.png
- **描述**: Knowledge Center — 权限拒绝状态
- **证明**: 无权限用户看到权限拒绝提示，不泄露数据
- **类型**: State

### #5 | knowledge-collection-tabs.png
- **描述**: Collection Tabs 切换视图
- **证明**: 5 个知识集合 tab 正确渲染，可切换
- **类型**: Page

### #6 | knowledge-stats-cards.png
- **描述**: 统计卡片区域
- **证明**: 5 个统计指标（collections/documents/chunks/indexedChunks/answers）正确显示
- **类型**: Page

### #7 | knowledge-search-input.png
- **描述**: 搜索输入框
- **证明**: 搜索框存在，支持输入和搜索触发
- **类型**: Search

### #8 | knowledge-search-results-with-citations.png
- **描述**: 搜索结果带引用标记
- **证明**: 搜索结果展示 chunk 摘要、来源标签、证据等级，带引用编号
- **类型**: Search

### #9 | knowledge-search-no-evidence.png
- **描述**: 搜索无证据结果
- **证明**: 无匹配结果时显示"未找到足够证据"提示
- **类型**: Search

### #10 | knowledge-answer-generated-with-citations.png
- **描述**: AI 生成回答带引用
- **证明**: AI 回答嵌入引用编号 [1][2][3]，来源可追溯
- **类型**: Answer

### #11 | knowledge-answer-no-evidence-blocked.png
- **描述**: 无证据时回答被拦截
- **证明**: 无证据时不生成回答，仅显示提示信息
- **类型**: Answer

### #12 | knowledge-citation-preview.png
- **描述**: 引用预览（hover/click 展开）
- **证明**: 点击引用编号可查看原始 chunk 内容
- **类型**: Citation

### #13 | knowledge-document-detail-drawer-overview.png
- **描述**: 文档详情抽屉 — Overview tab
- **证明**: 文档详情抽屉显示标题、来源类型、索引状态等基本信息
- **类型**: Drawer

### #14 | knowledge-document-detail-drawer-chunks.png
- **描述**: 文档详情抽屉 — Chunks tab
- **证明**: Chunk 列表展示 chunkIndex、contentSummary、evidenceLevel、tokenCount
- **类型**: Drawer

### #15 | knowledge-document-detail-drawer-linked-objects.png
- **描述**: 文档详情抽屉 — Linked Objects tab
- **证明**: 显示 DataSource 关联的业务对象（Job/Application 等）
- **类型**: Drawer

### #16 | knowledge-index-job-success.png
- **描述**: 索引任务成功
- **证明**: DataSource 索引成功，KnowledgeDocument 创建，chunks 写入
- **类型**: Index

### #17 | knowledge-index-job-failed.png
- **描述**: 索引任务失败
- **证明**: 未解析的 DataSource 索引失败，显示错误信息
- **类型**: Index

### #18 | knowledge-human-review-accepted.png
- **描述**: 人工审核 — 接受
- **证明**: 审核状态变为"已接受"，按钮状态更新
- **类型**: Review

### #19 | knowledge-human-review-edited.png
- **描述**: 人工审核 — 编辑后接受
- **证明**: 编辑模式下修改回答，保存后状态变为"已编辑后接受"
- **类型**: Review

### #20 | knowledge-human-review-rejected.png
- **描述**: 人工审核 — 忽略
- **证明**: 审核状态变为"已忽略"，按钮状态更新
- **类型**: Review

### #21 | ai-copilot-references-knowledge.png
- **描述**: AI Copilot 引用知识库
- **证明**: AI Copilot 组件在回答中引用了知识库内容作为证据
- **类型**: AI

### #22 | unauthorized-knowledge-not-visible.png
- **描述**: 无权限用户看不到知识库内容
- **证明**: interviewer 看不到 offer_closing collection，不显示越权数据
- **类型**: Permission

---

## Phase 8.8A 新增近景截图 (10 张)

### #23 | knowledge-collection-job-calibration-closeup.png
- **描述**: job_calibration collection 近景 — 显示 chunk 详情
- **证明**: 岗位校准知识集合中包含来自"理然招聘项目分析模型 v3.2"的 chunk，evidenceLevel 为 A/B
- **类型**: Closeup

### #24 | knowledge-search-evidence-chain-closeup.png
- **描述**: 搜索证据链近景 — 显示完整的 chunk → citation → answer 链路
- **证明**: 搜索结果 → AI 回答 → 引用编号 → chunk 来源可完整追溯
- **类型**: Closeup

### #25 | knowledge-answer-disclaimer-closeup.png
- **描述**: AI 回答免责声明近景
- **证明**: "AI 辅助建议，仅供参考" 免责声明在回答底部清晰显示
- **类型**: Closeup

### #26 | knowledge-answer-metadata-closeup.png
- **描述**: AI 回答元信息近景
- **证明**: provider=deepseek, model=deepseek-v4-flash, promptVersion=knowledge-rag-v1 清晰显示
- **类型**: Closeup

### #27 | knowledge-no-evidence-intercept-closeup.png
- **描述**: 无证据拦截详情近景
- **证明**: answerStatus=no_evidence, answer=null, citations=[]，message 完整显示
- **类型**: Closeup

### #28 | knowledge-permission-interviewer-denied-closeup.png
- **描述**: interviewer 被拒绝访问 offer_closing 近景
- **证明**: HTTP 403, error="暂无权限访问该知识库"，无数据泄露
- **类型**: Closeup

### #29 | knowledge-collection-scope-visual-closeup.png
- **描述**: Collection scope 可视化对比 — admin vs interviewer
- **证明**: admin 看到 5 个 collection，interviewer 只看到 4 个（offer_closing 不可见）
- **类型**: Closeup

### #30 | knowledge-index-job-flow-closeup.png
- **描述**: 索引任务流程近景 — DataSource → parse → index → KnowledgeDocument → KnowledgeChunk
- **证明**: 完整索引流程：parseStatus=parsed → indexJob 创建 → knowledgeDocument 创建 → chunks 逐条写入 → indexStatus=indexed
- **类型**: Closeup

### #31 | knowledge-search-scope-filter-closeup.png
- **描述**: 搜索 scope 过滤近景 — interviewer 搜索不返回 offer_closing 内容
- **证明**: collectionScopeWhere() 正确过滤，scope=INTERVIEWER 的搜索结果不包含越权 chunk
- **类型**: Closeup

### #32 | knowledge-activity-log-closeup.png
- **描述**: ActivityLog 知识库事件记录近景
- **证明**: activity_logs 表中记录了 KNOWLEDGE_DOCUMENT_INDEXED、KNOWLEDGE_SEARCH_PERFORMED、KNOWLEDGE_ANSWER_GENERATED 等事件
- **类型**: Closeup

---

## 截图分类统计

| 类别 | 数量 | 编号范围 |
|---|---|---|
| Page | 3 | #1, #5, #6 |
| State | 3 | #2, #3, #4 |
| Search | 3 | #7, #8, #9 |
| Answer | 2 | #10, #11 |
| Citation | 1 | #12 |
| Drawer | 3 | #13, #14, #15 |
| Index | 2 | #16, #17 |
| Review | 3 | #18, #19, #20 |
| AI | 1 | #21 |
| Permission | 1 | #22 |
| Closeup (Phase 8.8A) | 10 | #23-#32 |
| **合计** | **32** | **#1-#32** |
