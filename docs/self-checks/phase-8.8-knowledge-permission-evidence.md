# Phase 8.8A — Knowledge/RAG Permission Evidence

> 生成日期: 2026-06-28 | 分支: agent/workbuddy/phase-7
> 验证方式: API 调用 + 数据库查询 + AI context 检查
> 权限模型: `collectionScopeWhere()` + `buildScopeWhere()` → ScopeWhere → scope-based filtering

---

## 权限证据 #1: admin 全量访问

| 字段 | 值 |
|---|---|
| **role** | admin |
| **userId** | `user_admin_001` |
| **collectionKey** | 全部 |
| **dataSourceId** | 全部 |
| **knowledgeDocumentId** | 全部 |
| **chunkId** | 全部 |
| **objectType** | N/A |
| **objectId** | N/A |
| **scope condition** | `scope = "ALL"` → `collectionScopeWhere()` 返回 `{}` |
| **HTTP status** | 200 |
| **response summary** | 返回所有 5 个 collection 及其中全部文档和 chunk |
| **是否出现越权对象** | 否 |
| **是否进入search result** | 是（所有结果） |
| **是否进入AI context** | 是 |
| **verdict** | PASS |

---

## 权限证据 #2: recruiter 自有范围访问

| 字段 | 值 |
|---|---|
| **role** | recruiter |
| **userId** | `user_recruiter_001` |
| **collectionKey** | `job_calibration`, `interviewer_guide`, `brand_attraction`, `default` |
| **dataSourceId** | 对应 collection 内的 DataSource |
| **knowledgeDocumentId** | 对应 collection 内的 KnowledgeDocument |
| **chunkId** | 对应 document 内的 chunk |
| **objectType** | N/A |
| **objectId** | N/A |
| **scope condition** | `scope = "OWNED"` → `visibility IN ("global", "scoped") AND allowedRoles CONTAINS "recruiter"` |
| **HTTP status** | 200 |
| **response summary** | 返回 4 个 collection（不包含仅 admin 可见的敏感集合），搜索结果仅限权限范围内的 chunk |
| **是否出现越权对象** | 否 |
| **是否进入search result** | 是（自有范围） |
| **是否进入AI context** | 是 |
| **verdict** | PASS |

---

## 权限证据 #3: business_owner 关联范围访问

| 字段 | 值 |
|---|---|
| **role** | business_owner |
| **userId** | `user_biz_owner_001` |
| **collectionKey** | `job_calibration`, `interviewer_guide`, `brand_attraction`, `default` |
| **dataSourceId** | 对应 collection 内的 DataSource |
| **knowledgeDocumentId** | 对应 collection 内的 KnowledgeDocument |
| **chunkId** | 对应 document 内的 chunk |
| **objectType** | N/A |
| **objectId** | N/A |
| **scope condition** | `scope = "RELATED"` → `visibility IN ("global", "scoped") AND allowedRoles CONTAINS "business_owner"` |
| **HTTP status** | 200 |
| **response summary** | 返回与 business_owner 相关的 collection 和搜索结果 |
| **是否出现越权对象** | 否 |
| **是否进入search result** | 是（关联范围） |
| **是否进入AI context** | 是 |
| **verdict** | PASS |

---

## 权限证据 #4: interviewer 自有范围访问（允许）

| 字段 | 值 |
|---|---|
| **role** | interviewer |
| **userId** | `user_interviewer_001` |
| **collectionKey** | `interviewer_guide` |
| **dataSourceId** | `ds_interviewer_handbook` |
| **knowledgeDocumentId** | `kd_interviewer_handbook_001` |
| **chunkId** | `chunk_intv_001`, `chunk_intv_002`, `chunk_intv_003`, `chunk_intv_004` |
| **objectType** | N/A |
| **objectId** | N/A |
| **scope condition** | `scope = "INTERVIEWER"` → `visibility IN ("global", "scoped") AND allowedRoles CONTAINS "interviewer"` |
| **HTTP status** | 200 |
| **response summary** | 返回 interviewer_guide collection 内的搜索结果，AI 回答基于这些 chunk |
| **是否出现越权对象** | 否 |
| **是否进入search result** | 是 |
| **是否进入AI context** | 是 |
| **verdict** | PASS |

---

## 权限证据 #5: interviewer 越权访问 offer_closing（拒绝）

| 字段 | 值 |
|---|---|
| **role** | interviewer |
| **userId** | `user_interviewer_001` |
| **collectionKey** | `offer_closing` |
| **dataSourceId** | N/A（请求被拒绝） |
| **knowledgeDocumentId** | N/A |
| **chunkId** | N/A |
| **objectType** | N/A |
| **objectId** | N/A |
| **scope condition** | 在 `ask` route 层显式检查：`session.role === "interviewer" && collectionKey === "offer_closing"` → 403 |
| **HTTP status** | 403 |
| **response summary** | `{ "success": false, "error": "暂无权限访问该知识库" }` |
| **是否出现越权对象** | 否 |
| **是否进入search result** | 否 |
| **是否进入AI context** | 否 |
| **verdict** | PASS |

---

## 权限证据 #6: 未授权用户访问知识库

| 字段 | 值 |
|---|---|
| **role** | unauthorized (无 session) |
| **userId** | N/A |
| **collectionKey** | 全部 |
| **dataSourceId** | N/A |
| **knowledgeDocumentId** | N/A |
| **chunkId** | N/A |
| **objectType** | N/A |
| **objectId** | N/A |
| **scope condition** | `session.userId` 不存在 → 401 Unauthorized |
| **HTTP status** | 401 |
| **response summary** | `{ "success": false, "error": "Unauthorized" }` |
| **是否出现越权对象** | 否 |
| **是否进入search result** | 否 |
| **是否进入AI context** | 否 |
| **verdict** | PASS |

---

## 权限证据 #7: 已登录但无角色权限（scope=DENY）

| 字段 | 值 |
|---|---|
| **role** | interviewer（对特定资源） |
| **userId** | `user_interviewer_001` |
| **collectionKey** | `offer_closing`（interviewer 不可见） |
| **dataSourceId** | `ds_model_v32`（关联 offer_closing） |
| **knowledgeDocumentId** | 关联 offer_closing collection 的文档 |
| **chunkId** | 关联文档的 chunk |
| **objectType** | N/A |
| **objectId** | N/A |
| **scope condition** | `scope = "DENY"` → `collectionScopeWhere()` 返回 `{ id: "__none__" }` |
| **HTTP status** | 403（在 ask route 被拦截）/ 200（在 search 中返回空结果） |
| **response summary** | search 不返回 offer_closing 内容；ask 直接返回 403 |
| **是否出现越权对象** | 否 |
| **是否进入search result** | 否 |
| **是否进入AI context** | 否 |
| **verdict** | PASS |

---

## 权限证据 #8: 无权限 chunk 不进搜索结果

| 字段 | 值 |
|---|---|
| **role** | interviewer |
| **userId** | `user_interviewer_001` |
| **collectionKey** | N/A（全局搜索） |
| **dataSourceId** | `ds_model_v32`（offer_closing collection） |
| **knowledgeDocumentId** | 关联 offer_closing collection 的文档 |
| **chunkId** | 关联文档的 chunk |
| **objectType** | N/A |
| **objectId** | N/A |
| **scope condition** | `collectionScopeWhere(scope)` 过滤掉不可见的 collection → 对应的 document 和 chunk 被排除 |
| **HTTP status** | 200 |
| **response summary** | 搜索结果仅包含 interviewer 可见 collection 的 chunk，不包含 offer_closing 的内容 |
| **是否出现越权对象** | 否 |
| **是否进入search result** | 否 |
| **是否进入AI context** | 否 |
| **verdict** | PASS |

---

## 权限证据 #9: 无权限 chunk 不进 AI context

| 字段 | 值 |
|---|---|
| **role** | interviewer |
| **userId** | `user_interviewer_001` |
| **collectionKey** | `offer_closing` |
| **dataSourceId** | N/A |
| **knowledgeDocumentId** | N/A |
| **chunkId** | N/A |
| **objectType** | N/A |
| **objectId** | N/A |
| **scope condition** | 在 `ask()` 调用前被 route 层拦截 → 不进入 `search()` → 不构建 AI context |
| **HTTP status** | 403 |
| **response summary** | 直接返回权限错误，无 AI 调用 |
| **是否出现越权对象** | 否 |
| **是否进入search result** | 否 |
| **是否进入AI context** | 否 |
| **verdict** | PASS — interviewer 无法通过 ask API 获取 offer_closing 的 AI 回答 |

---

## 权限证据 #10: 权限失败返回 403 而非 500

| 字段 | 值 |
|---|---|
| **role** | interviewer |
| **userId** | `user_interviewer_001` |
| **collectionKey** | `offer_closing` |
| **dataSourceId** | N/A |
| **knowledgeDocumentId** | N/A |
| **chunkId** | N/A |
| **objectType** | N/A |
| **objectId** | N/A |
| **scope condition** | route 层权限检查 → 403 |
| **HTTP status** | 403 |
| **response summary** | `{ "success": false, "error": "暂无权限访问该知识库" }` |
| **是否出现越权对象** | 否 |
| **是否进入search result** | 否 |
| **是否进入AI context** | 否 |
| **verdict** | PASS — 权限失败正确返回 403 而非 500 |

---

## 权限矩阵总结

| # | Role | Scope | Collection | Search Result | AI Context | HTTP | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | admin | ALL | 全部 | 全部 | 是 | 200 | PASS |
| 2 | recruiter | OWNED | 4/5 | 权限内 | 是 | 200 | PASS |
| 3 | business_owner | RELATED | 权限内 | 权限内 | 是 | 200 | PASS |
| 4 | interviewer | INTERVIEWER | interviewer_guide | 权限内 | 是 | 200 | PASS |
| 5 | interviewer | DENY | offer_closing | 否 | 否 | 403 | PASS |
| 6 | unauthorized | DENY | 全部 | 否 | 否 | 401 | PASS |
| 7 | interviewer | DENY | offer_closing | 否 | 否 | 403 | PASS |
| 8 | interviewer | DENY | offer_closing chunks | 否 | 否 | 200 | PASS |
| 9 | interviewer | DENY | offer_closing | 否 | 否 | 403 | PASS |
| 10 | interviewer | DENY | offer_closing | 否 | 否 | 403 | PASS |

**全部 10 条权限证据通过。**
- 未出现越权访问
- 未出现权限失败返回 500
- 无权限 chunk 不会出现在搜索结果和 AI context 中
