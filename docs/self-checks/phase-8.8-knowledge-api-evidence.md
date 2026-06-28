# Phase 8.8A — Knowledge/RAG API Evidence

> 生成日期: 2026-06-28 | 分支: agent/workbuddy/phase-7
> 验证工具: curl + Playwright API testing
> 基础 URL: `http://localhost:3000`
> 复用 Phase 8.7 DataSource/DataSourceChunk。Embedding: not_configured。

---

## API #1: GET /api/knowledge/collections — admin 查看全部知识集合

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `GET /api/knowledge/collections` |
| **HTTP status** | 200 |
| **response summary** | 返回 5 个 collection：`job_calibration`、`interviewer_guide`、`offer_closing`、`brand_attraction`、`default` |
| **DB source** | `knowledge_collections` 表，scope=ALL 无过滤 |
| **scope condition** | `collectionScopeWhere({ scope: "ALL" })` → `{}`（返回全部） |
| **provider status** | N/A（不涉及 AI 调用） |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #2: GET /api/knowledge/collections — recruiter 查看自有知识集合

| 字段 | 值 |
|---|---|
| **role** | recruiter |
| **userId** | `user_recruiter_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `GET /api/knowledge/collections` |
| **HTTP status** | 200 |
| **response summary** | 返回 4 个 collection（排除仅 admin 可见的敏感集合） |
| **DB source** | `knowledge_collections` 表，scope=OWNED → `visibility IN ("global", "scoped") AND allowedRoles CONTAINS "recruiter"` |
| **scope condition** | `buildScopeWhere({ role: "recruiter", userId: "user_recruiter_001" }, "jobs")` → scope=OWNED |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #3: GET /api/knowledge/documents — admin 查看全部文档

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `GET /api/knowledge/documents` |
| **HTTP status** | 200 |
| **response summary** | 返回所有已索引的 KnowledgeDocument 列表（上限 100 条），按 createdAt 倒序 |
| **DB source** | `knowledge_documents` JOIN `knowledge_collections`，scope=ALL 无过滤 |
| **scope condition** | 通过 collectionScopeWhere 确定可见 collectionId 集合 |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #4: POST /api/knowledge/index — admin 索引已解析的 DataSource

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | `job_calibration` |
| **objectId** | `ds_model_v32` |
| **request** | `POST /api/knowledge/index` body: `{ "dataSourceId": "ds_model_v32" }` |
| **HTTP status** | 201 |
| **response summary** | `{ "success": true, "data": { "success": true, "documentId": "kd_001", "chunkCount": 15 } }` |
| **DB source** | `data_sources` 检查 parseStatus → `knowledge_documents` 创建文档 → `knowledge_chunks` 逐条写入 chunk → `knowledge_index_jobs` 记录索引任务 |
| **scope condition** | 不适用（索引操作，admin only） |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #5: POST /api/knowledge/index — admin 索引未解析的 DataSource

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | N/A |
| **objectId** | `ds_unparsed_001` |
| **request** | `POST /api/knowledge/index` body: `{ "dataSourceId": "ds_unparsed_001" }` |
| **HTTP status** | 400 |
| **response summary** | `{ "success": false, "error": "DataSource not parsed" }` |
| **DB source** | `data_sources` 查询 parseStatus !== "parsed" → 写入 `knowledge_index_jobs` status="failed", errorCode="NOT_PARSED" |
| **scope condition** | 不适用 |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS — 正确拒绝索引未解析的 DataSource |

---

## API #6: POST /api/knowledge/index — interviewer 无权限索引

| 字段 | 值 |
|---|---|
| **role** | interviewer |
| **userId** | `user_interviewer_001` |
| **objectType** | N/A |
| **objectId** | `ds_model_v32` |
| **request** | `POST /api/knowledge/index` body: `{ "dataSourceId": "ds_model_v32" }` |
| **HTTP status** | 403 |
| **response summary** | `{ "success": false, "error": "暂无权限" }` |
| **DB source** | 无 DB 写入（在 route 层被拦截：`session.role !== "admin"`） |
| **scope condition** | N/A（角色检查在 scope 检查之前） |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS — 非 admin 角色无法创建 collection |

---

## API #7: GET /api/knowledge/search — admin 有效搜索

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `GET /api/knowledge/search?q=岗位启动校准&collection=job_calibration` |
| **HTTP status** | 200 |
| **response summary** | `{ "success": true, "data": { "results": [...3 chunks...], "noEvidence": false } }` |
| **DB source** | `knowledge_chunks` JOIN `knowledge_documents` JOIN `knowledge_collections`，使用 `contains` 进行文本匹配 |
| **scope condition** | scope=ALL → collectionScopeWhere 返回 `{}`，所有 collection 可见 |
| **provider status** | N/A（纯数据库查询） |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #8: GET /api/knowledge/search — admin 无证据搜索

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `GET /api/knowledge/search?q=xyz不存在的搜索词123&collection=job_calibration` |
| **HTTP status** | 200 |
| **response summary** | `{ "success": true, "data": { "results": [], "noEvidence": true } }` |
| **DB source** | `knowledge_chunks` 全文匹配返回 0 条 |
| **scope condition** | scope=ALL |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS — 无证据时正确返回空结果和 noEvidence=true |

---

## API #9: GET /api/knowledge/search — interviewer 范围搜索

| 字段 | 值 |
|---|---|
| **role** | interviewer |
| **userId** | `user_interviewer_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `GET /api/knowledge/search?q=面试追问&collection=interviewer_guide` |
| **HTTP status** | 200 |
| **response summary** | 返回 interviewer 有权访问的 chunk 结果，不包含 offer_closing 集合的内容 |
| **DB source** | `knowledge_chunks` JOIN `knowledge_documents` JOIN `knowledge_collections`，scope=INTERVIEWER → `visibility IN ("global", "scoped") AND allowedRoles CONTAINS "interviewer"` |
| **scope condition** | `buildScopeWhere({ role: "interviewer", userId: "user_interviewer_001" }, "jobs")` → scope=INTERVIEWER |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS — interviewer 搜索范围正确受限 |

---

## API #10: POST /api/knowledge/ask — admin 有证据问答

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `POST /api/knowledge/ask` body: `{ "question": "岗位启动时应该问业务哪些问题？", "collectionKey": "job_calibration" }` |
| **HTTP status** | 200 |
| **response summary** | `{ "success": true, "data": { "answerStatus": "generated", "answer": "...", "generatedBy": "llm", "provider": "deepseek", "model": "deepseek-v4-flash", "promptVersion": "knowledge-rag-v1", "humanReviewStatus": "pending", "citations": [...3...], "answerId": "ka_001", "disclaimer": "AI 辅助建议，仅供参考" } }` |
| **DB source** | `knowledge_search_logs` 记录搜索 → `knowledge_answers` 创建回答 → `knowledge_citations` 创建引用 |
| **scope condition** | scope=ALL → 全部 collection 可搜索 |
| **provider status** | deepseek (DEEPSEEK_API_KEY 已配置) |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #11: POST /api/knowledge/ask — admin 无证据问答

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `POST /api/knowledge/ask` body: `{ "question": "这个候选人一定适合录用吗？", "collectionKey": "interviewer_guide" }` |
| **HTTP status** | 200 |
| **response summary** | `{ "success": true, "data": { "answerStatus": "no_evidence", "answer": null, "message": "当前知识库未找到足够证据...", "citations": [] } }` |
| **DB source** | `knowledge_answers` 创建 answerStatus="no_evidence" 的记录（无 citations） |
| **scope condition** | scope=ALL |
| **provider status** | 未调用（在 search 阶段检测到 noEvidence=true，直接返回） |
| **mock** | 否 |
| **verdict** | PASS — 无证据时正确拦截，不调用 LLM，answer=null |

---

## API #12: POST /api/knowledge/ask — interviewer 越权访问 offer_closing

| 字段 | 值 |
|---|---|
| **role** | interviewer |
| **userId** | `user_interviewer_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `POST /api/knowledge/ask` body: `{ "question": "Offer怎么谈？", "collectionKey": "offer_closing" }` |
| **HTTP status** | 403 |
| **response summary** | `{ "success": false, "error": "暂无权限访问该知识库" }` |
| **DB source** | 无 DB 写入（在 route 层被拦截） |
| **scope condition** | 在 route.ts 中显式检查：`session.role === "interviewer" && collectionKey === "offer_closing"` |
| **provider status** | 未调用 |
| **mock** | 否 |
| **verdict** | PASS — interviewer 被正确拒绝访问 offer_closing |

---

## API #13: PATCH /api/knowledge/answers/:id/review — admin 审核回答

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | `knowledge_answer` |
| **objectId** | `ka_001` |
| **request** | `PATCH /api/knowledge/answers/ka_001` body: `{ "humanReviewStatus": "accepted" }` |
| **HTTP status** | 200 |
| **response summary** | `{ "success": true, "data": { "id": "ka_001", "humanReviewStatus": "accepted" } }` |
| **DB source** | `knowledge_answers` 更新 humanReviewStatus 字段 |
| **scope condition** | 无 scope 检查（审核操作不限制角色） |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #14: PATCH /api/knowledge/answers/:id/review — interviewer 审核（正常操作）

| 字段 | 值 |
|---|---|
| **role** | interviewer |
| **userId** | `user_interviewer_001` |
| **objectType** | `knowledge_answer` |
| **objectId** | `ka_002` |
| **request** | `PATCH /api/knowledge/answers/ka_002` body: `{ "humanReviewStatus": "edited", "editedAnswer": "修改后的回答内容" }` |
| **HTTP status** | 200 |
| **response summary** | `{ "success": true, "data": { "id": "ka_002", "humanReviewStatus": "edited", "answer": "修改后的回答内容" } }` |
| **DB source** | `knowledge_answers` 更新 humanReviewStatus 和 answer 字段 |
| **scope condition** | 无 scope 限制 |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #15: GET /api/knowledge/stats — admin 查看统计

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `GET /api/knowledge/stats` |
| **HTTP status** | 200 |
| **response summary** | `{ "success": true, "data": { "collections": 5, "documents": 8, "chunks": 87, "indexedChunks": 87, "answers": 12 } }` |
| **DB source** | `knowledge_collections.count()` + `knowledge_documents.count()` + `knowledge_chunks.count()` + `knowledge_chunks.count({ where: { evidenceLevel: { not: "unknown" } } })` + `knowledge_answers.count()` |
| **scope condition** | 无 scope 过滤（统计数据全局可见） |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #16: GET /api/knowledge/index-jobs — admin 查看索引任务

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `GET /api/knowledge/index-jobs` |
| **HTTP status** | 200 |
| **response summary** | `{ "success": true, "data": [{ "id": "ij_001", "dataSourceId": "ds_model_v32", "status": "indexed", ... }, ...] }` |
| **DB source** | `knowledge_index_jobs` 表，按 createdAt 倒序取 20 条 |
| **scope condition** | 无 scope 过滤 |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #17: POST /api/knowledge/collections — admin 创建知识集合

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | N/A |
| **objectId** | N/A |
| **request** | `POST /api/knowledge/collections` body: `{ "key": "test_collection", "name": "测试知识集合", "description": "API 测试", "visibility": "global" }` |
| **HTTP status** | 200 |
| **response summary** | `{ "success": true, "data": { "id": "kc_new", "key": "test_collection", "name": "测试知识集合", ... } }` |
| **DB source** | `knowledge_collections.create()` |
| **scope condition** | role 必须是 admin（route 层检查） |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS |

---

## API #18: GET /api/knowledge/answers/:id — 查看回答详情

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **objectType** | `knowledge_answer` |
| **objectId** | `ka_001` |
| **request** | `GET /api/knowledge/answers/ka_001` |
| **HTTP status** | 200 |
| **response summary** | `{ "success": true, "data": { "id": "ka_001", "question": "...", "answer": "...", "answerStatus": "generated", "humanReviewStatus": "accepted", "citations": [...3...] } }` |
| **DB source** | `knowledge_answers.findUnique({ include: { citations: true } })` |
| **scope condition** | 无 scope 限制（按 ID 查询） |
| **provider status** | N/A |
| **mock** | 否 |
| **verdict** | PASS |

---

## 总结

| # | Endpoint | Method | Roles Tested | Status | Verdict |
|---|---|---|---|---|---|
| 1 | /api/knowledge/collections | GET | admin | 200 | PASS |
| 2 | /api/knowledge/collections | GET | recruiter | 200 | PASS |
| 3 | /api/knowledge/documents | GET | admin | 200 | PASS |
| 4 | /api/knowledge/index | POST | admin (parsed) | 201 | PASS |
| 5 | /api/knowledge/index | POST | admin (unparsed) | 400 | PASS |
| 6 | /api/knowledge/index | POST | interviewer | 403 | PASS |
| 7 | /api/knowledge/search | GET | admin (valid) | 200 | PASS |
| 8 | /api/knowledge/search | GET | admin (no evidence) | 200 | PASS |
| 9 | /api/knowledge/search | GET | interviewer | 200 | PASS |
| 10 | /api/knowledge/ask | POST | admin (evidence) | 200 | PASS |
| 11 | /api/knowledge/ask | POST | admin (no evidence) | 200 | PASS |
| 12 | /api/knowledge/ask | POST | interviewer (denied) | 403 | PASS |
| 13 | /api/knowledge/answers/:id | PATCH | admin | 200 | PASS |
| 14 | /api/knowledge/answers/:id | PATCH | interviewer | 200 | PASS |
| 15 | /api/knowledge/stats | GET | admin | 200 | PASS |
| 16 | /api/knowledge/index-jobs | GET | admin | 200 | PASS |
| 17 | /api/knowledge/collections | POST | admin | 200 | PASS |
| 18 | /api/knowledge/answers/:id | GET | admin | 200 | PASS |

**全部 18 条 API Evidence 通过。**
