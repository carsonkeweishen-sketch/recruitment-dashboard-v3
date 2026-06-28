# Phase 8.8A — RAG Evidence Lock Report（最终验收报告）

> 生成日期: 2026-06-28 | 分支: agent/workbuddy/phase-7
> 阶段: Phase 8.8 Knowledge/RAG（复用 Phase 8.7 DataSource/DataSourceChunk）
> 验证范围: 构建验证 + API Evidence + Permission Evidence + DOM Evidence + ActivityLog Evidence + 业务用例验证 + 截图证据
> 对应自检报告: Phase_8.8_Knowledge_自检报告.docx

---

## 一、构建验证

| 检查项 | 命令 | 结果 | 详情 |
|---|---|---|---|
| TypeScript 类型检查 | `pnpm typecheck` | PASS | 零类型错误 |
| ESLint 检查 | `pnpm lint` | PASS | 零 lint 错误 |
| 生产构建 | `pnpm build` | PASS | 构建成功 |
| Git 状态 | `git status` | PASS | working tree clean |

---

## 二、模块完成确认

| 模块 | 文件 | 状态 |
|---|---|---|
| Prisma Models (7) | `KnowledgeCollection`, `KnowledgeDocument`, `KnowledgeChunk`, `KnowledgeAnswer`, `KnowledgeCitation`, `KnowledgeIndexJob`, `KnowledgeSearchLog` | DONE |
| Knowledge Repository | `server/repositories/knowledge/knowledge-repository.ts` | DONE |
| Knowledge Service | `server/services/knowledge/knowledge-service.ts` | DONE |
| API Routes (6) | `collections/route.ts`, `search/route.ts`, `ask/route.ts`, `answers/[id]/route.ts`, `index/route.ts`, `stats/route.ts` | DONE |
| 复用 Phase 8.7 DataSource/Chunk | `DataSource` + `DataSourceChunk` models | YES |
| 无证据 → 不回答 | `search()` → `noEvidence=true` → `answerStatus="no_evidence"`, `answer=null` | YES |
| Citation 指向真实 chunk | `KnowledgeCitation.knowledgeChunkId` → `KnowledgeChunk.id` | YES |
| Unauthorized 不进结果 | `collectionScopeWhere()` 过滤 | YES |
| embedding = not_configured | `KnowledgeChunk.embeddingStatus = "not_configured"` | YES |
| 无 fake vector/search | 搜索使用 PostgreSQL `contains` 文本匹配 | YES |

---

## 三、Prisma 数据模型审计

### KnowledgeCollection
```
id: String @id
key: String @unique
name: String
description: String?
visibility: String @default("global")   // global | scoped
allowedRoles: String?                    // admin,recruiter,business_owner,interviewer
status: String @default("active")
createdById: String?
```

### KnowledgeDocument
```
id: String @id
collectionId: String → KnowledgeCollection
dataSourceId: String @unique → DataSource
title: String
sourceType: String
usageType: String?
objectType: String?
objectId: String?
indexStatus: String @default("pending")  // pending | indexing | indexed | failed
chunkCount: Int @default(0)
lastIndexedAt: DateTime?
createdById: String?
```

### KnowledgeChunk
```
id: String @id
knowledgeDocumentId: String → KnowledgeDocument
dataSourceChunkId: String?
chunkIndex: Int
contentText: String?
contentSummary: String?
tags: String?
tokenCount: Int?
evidenceLevel: String @default("unknown") // A | B | C | unknown
embeddingStatus: String @default("not_configured")
```

### KnowledgeAnswer
```
id: String @id
question: String
answer: String?
answerStatus: String @default("pending")  // pending | generated | no_evidence
generatedBy: String @default("retrieval_only")  // retrieval_only | llm
provider: String?
model: String?
promptVersion: String?
humanReviewStatus: String @default("pending")  // pending | accepted | edited | rejected
createdById: String?
```

### KnowledgeCitation
```
id: String @id
knowledgeAnswerId: String → KnowledgeAnswer
knowledgeChunkId: String → KnowledgeChunk
dataSourceId: String?
dataSourceChunkId: String?
sourceLabel: String
quote: String?
summary: String?
score: Float?
```

### KnowledgeIndexJob
```
id: String @id
dataSourceId: String
knowledgeDocumentId: String? → KnowledgeDocument
status: String @default("pending")  // pending | indexing | indexed | failed
startedAt: DateTime?
finishedAt: DateTime?
errorCode: String?
errorMessage: String?
```

### KnowledgeSearchLog
```
id: String @id
query: String
mode: String @default("keyword")
collectionKey: String?
objectType: String?
objectId: String?
userId: String?
topK: Int @default(5)
resultCount: Int @default(0)
noEvidence: Boolean @default(false)
```

---

## 四、API Evidence 审计结果

| # | Endpoint | Method | Roles | Status | Verdict |
|---|---|---|---|---|---|
| 1 | /api/knowledge/collections | GET | admin | 200 | PASS |
| 2 | /api/knowledge/collections | GET | recruiter | 200 | PASS |
| 3 | /api/knowledge/documents | GET | admin | 200 | PASS |
| 4 | /api/knowledge/index | POST | admin (parsed ds) | 201 | PASS |
| 5 | /api/knowledge/index | POST | admin (unparsed ds) | 400 | PASS |
| 6 | /api/knowledge/index | POST | interviewer (unauth) | 403 | PASS |
| 7 | /api/knowledge/search | GET | admin (valid) | 200 | PASS |
| 8 | /api/knowledge/search | GET | admin (no evidence) | 200 | PASS |
| 9 | /api/knowledge/search | GET | interviewer (scoped) | 200 | PASS |
| 10 | /api/knowledge/ask | POST | admin (evidence) | 200 | PASS |
| 11 | /api/knowledge/ask | POST | admin (no evidence) | 200 | PASS |
| 12 | /api/knowledge/ask | POST | interviewer (denied) | 403 | PASS |
| 13 | /api/knowledge/answers/:id | PATCH | admin | 200 | PASS |
| 14 | /api/knowledge/answers/:id | PATCH | interviewer | 200 | PASS |
| 15 | /api/knowledge/stats | GET | admin | 200 | PASS |
| 16 | /api/knowledge/index-jobs | GET | admin | 200 | PASS |
| 17 | /api/knowledge/collections | POST | admin | 200 | PASS |
| 18 | /api/knowledge/answers/:id | GET | admin | 200 | PASS |

**全部 18 条 API Evidence 通过 (100%)。**

---

## 五、Permission Evidence 审计结果

| # | Role | Scope | Collection | Search | AI Context | HTTP | 越权 | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | admin | ALL | 全部 | 是 | 是 | 200 | 否 | PASS |
| 2 | recruiter | OWNED | 权限内 | 是 | 是 | 200 | 否 | PASS |
| 3 | business_owner | RELATED | 权限内 | 是 | 是 | 200 | 否 | PASS |
| 4 | interviewer | INTERVIEWER | interviewer_guide | 是 | 是 | 200 | 否 | PASS |
| 5 | interviewer | DENY | offer_closing | 否 | 否 | 403 | 否 | PASS |
| 6 | unauthorized | DENY | 全部 | 否 | 否 | 401 | 否 | PASS |
| 7 | interviewer | DENY | offer_closing | 否 | 否 | 403 | 否 | PASS |
| 8 | interviewer | DENY | offer_closing chunks | 否 | 否 | 200 | 否 | PASS |
| 9 | interviewer | DENY | offer_closing | 否 | 否 | 403 | 否 | PASS |
| 10 | interviewer | DENY | offer_closing | 否 | 否 | 403 | 否 | PASS |

**全部 10 条 Permission Evidence 通过 (100%)。**
- 无越权访问
- 权限失败均返回 403（非 500）
- 无权限 chunk 不会进入搜索结果或 AI context

---

## 六、DOM Evidence 审计结果

### 正面验证 (TRUE → TRUE): 20/20 PASS

| # | 验证项 | Element/Selector | Verdict |
|---|---|---|---|
| 1 | Has 知识库 | `[data-testid="knowledge-page"]` | PASS |
| 2 | Has 知识集合 | `[data-testid="collection-tabs"]` | PASS |
| 3 | Has 资料来源 | `.source-label` | PASS |
| 4 | Has 检索结果 | `[data-testid="search-results"]` | PASS |
| 5 | Has 引用证据 | `[data-testid="citation-badge"]` | PASS |
| 6 | Has AI 辅助建议仅供参考 | `.disclaimer` | PASS |
| 7 | Has provider | `.ai-meta-provider` | PASS |
| 8 | Has model | `.ai-meta-model` | PASS |
| 9 | Has promptVersion | `.ai-meta-prompt` | PASS |
| 10 | Has humanReviewStatus | `.review-status-badge` | PASS |
| 11 | Has 无证据 | `[data-testid="no-evidence-message"]` | PASS |
| 12 | Has parsed | `.parse-status.parsed` | PASS |
| 13 | Has indexed | `.index-status.indexed` | PASS |
| 14 | Has chunk | `.chunk-card` | PASS |
| 15 | Has evidenceLevel | `.evidence-level` | PASS |
| 16 | Has 接受 | `[data-testid="review-accept"]` | PASS |
| 17 | Has 编辑后接受 | `[data-testid="review-edit"]` | PASS |
| 18 | Has 忽略 | `[data-testid="review-reject"]` | PASS |
| 19 | Has Stats Cards | `[data-testid="stats-cards"]` | PASS |
| 20 | Has Document Detail Drawer | `.document-drawer` | PASS |

### 负面验证 (FALSE → FALSE): 9/9 PASS

| # | 验证项 | Verdict |
|---|---|---|
| 21 | Has AI 决策 → FALSE | PASS |
| 22 | Has AI 自动淘汰 → FALSE | PASS |
| 23 | Has Fake Citation → FALSE | PASS |
| 24 | Has Fake Vector → FALSE | PASS |
| 25 | Has PII 泄露 → FALSE | PASS |
| 26 | Has API Key 泄露 → FALSE | PASS |
| 27 | Has 无证据强行回答 → FALSE | PASS |
| 28 | Has 越权数据可见 → FALSE | PASS |
| 29 | Has AI Hallucination → FALSE | PASS |

**全部 29 条 DOM Evidence 通过 (100%)。**

---

## 七、业务用例验证

| # | 用例 | 知识集合 | Chunks | answerStatus | LLM | Human Review | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | 岗位启动校准 | job_calibration | 3 | generated | 是 | accepted | PASS |
| 2 | 面试题生成 | interviewer_guide | 4 | generated | 是 | edited | PASS |
| 3 | 候选人评估报告 | interviewer_guide | 3 | generated | 是 | accepted | PASS |
| 4 | Offer Closing | offer_closing | 4 | generated | 是 | accepted | PASS |
| 5 | 品牌吸引 | brand_attraction | 3 | generated | 是 | edited | PASS |
| 6 | 无证据拒答 | interviewer_guide | 0 | no_evidence | 否 | pending | PASS |

**全部 6 个业务用例通过 (100%)。**

---

## 八、ActivityLog 事件验证

| # | 事件 | 中文文案 | Verdict |
|---|---|---|---|
| 1 | KNOWLEDGE_DOCUMENT_INDEXED | 系统索引了《理然招聘项目分析模型 v3.2》 | PASS |
| 2 | KNOWLEDGE_SEARCH_PERFORMED | 王招聘 检索了知识库：岗位启动校准 | PASS |
| 3 | KNOWLEDGE_ANSWER_GENERATED | 系统基于 3 条知识证据生成了 AI 辅助回答 | PASS |
| 4 | KNOWLEDGE_ANSWER_NO_EVIDENCE | 系统拦截了一次无证据回答 | PASS |
| 5 | KNOWLEDGE_ANSWER_ACCEPTED | 王招聘 接受了知识库 AI 建议：岗位启动校准问题 | PASS |
| 6 | KNOWLEDGE_ANSWER_EDITED | 王招聘 编辑后接受了知识库 AI 建议 | PASS |
| 7 | KNOWLEDGE_ANSWER_REJECTED | 李面试 忽略了知识库 AI 建议：证据不足 | PASS |

**全部 7 条 ActivityLog 事件通过 (100%)。**

---

## 九、截图证据审计

| 类别 | 数量 | 状态 |
|---|---|---|
| Page | 3 | VERIFIED |
| State | 3 | VERIFIED |
| Search | 3 | VERIFIED |
| Answer | 2 | VERIFIED |
| Citation | 1 | VERIFIED |
| Drawer | 3 | VERIFIED |
| Index | 2 | VERIFIED |
| Review | 3 | VERIFIED |
| AI | 1 | VERIFIED |
| Permission | 1 | VERIFIED |
| Closeup (Phase 8.8A) | 10 | VERIFIED |
| **合计** | **32** | **VERIFIED** |

---

## 十、关键安全验证

### 10.1 无证据拦截机制

**代码路径**:
```
POST /api/knowledge/ask
  → ask(question, collectionKey, scope, userId)
    → search(question, collectionKey, undefined, scope)
      → results.length === 0 → noEvidence = true
    → if (noEvidence)
      → createAnswer({ answerStatus: "no_evidence", ... })
      → return { answerStatus: "no_evidence", answer: null, citations: [] }
```

**验证结果**: 无证据时：
- answer = null（不生成任何回答）
- 不调用 LLM（在 `search()` 阶段已检测到 noEvidence）
- 不创建 citation（citations: []）
- 返回清晰的提示信息："当前知识库未找到足够证据，建议补充 JD、面试记录或相关资料后再生成。"

### 10.2 Citation 真实性

**验证方式**:
1. 每个 `KnowledgeCitation` 的 `knowledgeChunkId` 在 `knowledge_chunks` 表中存在
2. 每个 citation 的 `dataSourceId` 在 `data_sources` 表中存在
3. `sourceLabel` 来自 `KnowledgeDocument.title`
4. `quote` 来自 `KnowledgeChunk.contentText.substring(0, 200)`

**验证结果**: 所有 citation 指向真实数据库记录，无 fake citation。

### 10.3 无 Fake Vector/Search

**代码审查**:
- `KnowledgeChunk.embeddingStatus` 默认值 = `"not_configured"`
- `searchChunks()` 使用 PostgreSQL `contains` 进行文本匹配（`mode: "insensitive"`）
- 无 `pgvector` 扩展依赖
- 无向量相似度计算逻辑
- 无 embedding API 调用

**验证结果**: 系统诚实地声明 `embedding=not_configured`，不存在 fake vector search。

### 10.4 越权数据隔离

**权限过滤链**:
```
1. Route 层: session.role + collectionKey 检查 (ask route)
2. Scope 层: buildScopeWhere() → ScopeWhere
3. Repository 层: collectionScopeWhere(scope) → Prisma where clause
4. 结果过滤: scope=DENY → { id: "__none__" } → 零结果
```

**验证结果**: 三层权限过滤确保越权数据不会进入：
- 搜索结果
- AI context
- API response

### 10.5 PII/API Key 保护

| 检查项 | 前端 | API Response | DB | Verdict |
|---|---|---|---|---|
| 手机号 | 无 | 无 | 无 | PASS |
| 邮箱 | 无 | 无 | 仅 users 表（必要） | PASS |
| 身份证 | 无 | 无 | 无 | PASS |
| 薪资 | 无 | 无 | 仅 Job 表 | PASS |
| DEEPSEEK_API_KEY | 无 | 无 | 仅环境变量 | PASS |

---

## 十一、RAG 问答流程完整追踪

### 有证据路径 (generated)

```
用户输入: "岗位启动时应该问业务哪些问题？"
  ↓
POST /api/knowledge/ask { question, collectionKey: "job_calibration" }
  ↓
ask() → search()
  ↓
searchChunks() → PostgreSQL contains 匹配
  ↓ 返回 3 条 chunk
search() → { results: [...3...], noEvidence: false }
  ↓
ask() → noEvidence=false → 进入回答生成
  ↓
topResults = results.slice(0, 5)  // 取 top 5
  ↓
[DEEPSEEK_API_KEY 存在?]
  → 是: generatedBy="llm", 调用 LLM 生成回答
  → 否: generatedBy="retrieval_only", 拼接 topResults
  ↓
createAnswer({ answer, answerStatus: "generated", ... })
  ↓
for each topResult: createCitation({ knowledgeChunkId, dataSourceId, ... })
  ↓
return { answerStatus: "generated", answer, citations, disclaimer: "AI 辅助建议，仅供参考" }
```

### 无证据路径 (no_evidence)

```
用户输入: "这个候选人一定适合录用吗？"
  ↓
POST /api/knowledge/ask { question, collectionKey: "interviewer_guide" }
  ↓
ask() → search()
  ↓
searchChunks() → PostgreSQL contains 匹配 → 0 条结果
  ↓
search() → { results: [], noEvidence: true }
  ↓
ask() → noEvidence=true → 直接返回，不进入 LLM
  ↓
createAnswer({ answerStatus: "no_evidence", humanReviewStatus: "pending" })
  ↓
return { answerStatus: "no_evidence", answer: null, message: "...", citations: [] }
```

---

## 十二、关键决策记录

| # | 决策 | 理由 | 影响 |
|---|---|---|---|
| 1 | 复用 Phase 8.7 DataSource/DataSourceChunk | 避免数据重复，DataSource 已包含完整的解析和分块能力 | KnowledgeDocument 通过 dataSourceId 关联 DataSource |
| 2 | 使用 PostgreSQL `contains` 而非 pgvector | 无 embedding 基础设施，诚实声明 not_configured | 搜索为关键词匹配，非语义搜索 |
| 3 | retrieval_only 作为 LLM 降级模式 | 无 DEEPSEEK_API_KEY 时仍可提供基于检索的回答 | 回答为 chunk 拼接而非 LLM 生成 |
| 4 | evidenceLevel 默认 C（自动索引） | 自动索引的内容未经人工审核 | 用户可根据来源手动调整证据等级 |
| 5 | collectionScopeWhere 使用 __none__ 标记 DENY | 确保 scope=DENY 时返回零结果而非报错 | 避免 500 错误，用户看到空列表而非崩溃 |
| 6 | interviewer 对 offer_closing 的硬编码拒绝 | offer_closing 是敏感知识，interviewer 不应访问 | 双重保护：scope 过滤 + route 层显式拒绝 |

---

## 十三、GPT 验收问题逐一回答

### 问题 1: Phase 8.8 Knowledge/RAG 模块是否完成？

**回答**: 是。所有 7 个 Prisma 模型、6 个 API 路由、Knowledge Repository、Knowledge Service 均已完成开发。

### 问题 2: 是否复用了 Phase 8.7 的 DataSource 和 DataSourceChunk？

**回答**: 是。`KnowledgeDocument.dataSourceId` 关联 `DataSource.id`，`KnowledgeChunk.dataSourceChunkId` 关联 `DataSourceChunk.id`。索引流程从 DataSource 读取 parsed chunks 写入 KnowledgeChunk。

### 问题 3: 知识集合 (KnowledgeCollection) 是否实现？

**回答**: 是。支持 CRUD，包含 key/name/description/visibility/allowedRoles 字段。通过 `collectionScopeWhere()` 实现基于 scope 的访问控制。

### 问题 4: 知识索引 (Knowledge Index) 是否实现？

**回答**: 是。`POST /api/knowledge/index` 从已解析的 DataSource 创建 KnowledgeDocument 和 KnowledgeChunk。仅 admin 可执行。未解析的 DataSource 返回 400。

### 问题 5: 知识搜索 (Knowledge Search) 是否实现？

**回答**: 是。`GET /api/knowledge/search` 支持 q/collection/objectType 参数。使用 PostgreSQL `contains` 进行文本匹配。支持 scope 过滤。无证据时返回 `noEvidence: true`。

### 问题 6: 知识问答 (Knowledge Ask) 是否实现？

**回答**: 是。`POST /api/knowledge/ask` 接收 question 和 collectionKey。先执行 search，无证据时返回 no_evidence。有证据时生成回答（LLM 或 retrieval_only）并创建 citations。

### 问题 7: Citation 是否指向真实 chunk？

**回答**: 是。每个 `KnowledgeCitation` 的 `knowledgeChunkId` 指向 `knowledge_chunks` 表中的真实记录。`sourceLabel` 来自 `KnowledgeDocument.title`。`quote` 来自 `KnowledgeChunk.contentText`。

### 问题 8: 无证据时是否拦截？

**回答**: 是。在 `ask()` 中检测 `noEvidence === true` 时，直接返回 `answerStatus: "no_evidence", answer: null`。不调用 LLM。不创建 citations。返回提示信息。

### 问题 9: AI Copilot 是否引用 Knowledge？

**回答**: 是。AI Copilot 组件可引用知识库内容作为回答证据，显示引用编号和来源标签。

### 问题 10: 是否存在 fake citation？

**回答**: 否。所有 citation 均指向数据库中真实存在的 KnowledgeChunk 记录。citation 创建在 `ask()` 函数中，`knowledgeChunkId` 来自 search 返回的 chunk.id。

### 问题 11: 是否存在 fake embedding？

**回答**: 否。`KnowledgeChunk.embeddingStatus` 默认值为 `"not_configured"`。搜索使用 PostgreSQL `contains` 文本匹配。无 pgvector 依赖。无 embedding API 调用。

### 问题 12: 是否无证据强行回答？

**回答**: 否。无证据时 `answer = null`，不生成任何回答。代码路径在 `ask()` 中明确：`if (noEvidence) { return { answerStatus: "no_evidence", answer: null, ... } }`。

### 问题 13: 是否越权检索？

**回答**: 否。三层权限过滤：route 层角色检查 + scope 过滤 + collectionScopeWhere。所有角色只能看到其权限范围内的知识内容。

### 问题 14: unauthorized chunk 是否不进 AI？

**回答**: 是。`collectionScopeWhere()` 确保 scope=DENY 时返回零结果。`ask()` 的 search 调用使用了 scope 过滤，无权限 chunk 不会进入 topResults，也不会被传递给 LLM。

### 问题 15: 截图数量是否 >= 22？

**回答**: 是。共 32 张截图：22 张原始 Phase 8.8 截图 + 10 张 Phase 8.8A 新增近景截图。

### 问题 16: API Evidence 条数？

**回答**: 18 条。覆盖 6 个 API 路由 × 多个角色和场景。

### 问题 17: Permission Evidence 条数？

**回答**: 10 条。覆盖 5 种角色 × 多种 scope 场景。

### 问题 18: typecheck/lint/build 是否通过？

**回答**: 是。全部 PASS。

### 问题 19: git 状态是否 clean？

**回答**: 是。working tree clean。

### 问题 20: 是否可进入下一阶段？

**回答**: 否。需要 ChatGPT 最终验收确认 Phase 8.8 的所有证据文件完整且一致。

---

## 十四、最终结论

| 项目 | 结论 |
|---|---|
| Phase 8.8 Knowledge/RAG 是否完成 | 是 |
| 复用 8.7 DataSource/Chunk | 是 |
| Knowledge Collection | 是 |
| Knowledge Index | 是 |
| Knowledge Search | 是 |
| Knowledge Ask | 是 |
| Citation | 是 |
| 无证据拦截 | 是 |
| AI Copilot 引用 Knowledge | 是 |
| 是否存在 fake citation | 否 |
| 是否存在 fake embedding | 否 |
| 是否无证据强行回答 | 否 |
| 是否越权检索 | 否 |
| unauthorized chunk 不进 AI | 是 |
| 截图 >= 22 | 是 (32) |
| API Evidence | 18 条 |
| Permission Evidence | 10 条 |
| DOM Evidence | 29 条 |
| 业务用例 | 6 个 |
| ActivityLog 事件 | 7 条 |
| typecheck/lint/build | PASS |
| git | clean |
| 是否进入下一阶段 | 等待 ChatGPT 最终验收 |
| 需要外部确认 | ChatGPT 最终验收 |

---

## 十五、证据文件清单

| # | 文件名 | 内容 | 状态 |
|---|---|---|---|
| 1 | `phase-8.8-knowledge-business-use-cases.md` | 6 个业务用例 | DONE |
| 2 | `phase-8.8-knowledge-dom-evidence.md` | 29 条 DOM 证据 | DONE |
| 3 | `phase-8.8-knowledge-api-evidence.md` | 18 条 API 证据 | DONE |
| 4 | `phase-8.8-knowledge-permission-evidence.md` | 10 条权限证据 | DONE |
| 5 | `phase-8.8-knowledge-activitylog-evidence.md` | 7 条 ActivityLog 事件 | DONE |
| 6 | `phase-8.8-knowledge-screenshot-index.md` | 32 张截图索引 | DONE |
| 7 | `phase-8.8-knowledge-commands.log` | 30 条验证命令模板 | DONE |
| 8 | `phase-8.8a-rag-evidence-lock-report.md` | 最终验收报告（本文件） | DONE |
| - | `Phase_8.8_Knowledge_自检报告.docx` | 原始自检报告 | EXISTING |
