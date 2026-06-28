# Phase 8.8A — Knowledge/RAG ActivityLog Evidence

> 生成日期: 2026-06-28 | 分支: agent/workbuddy/phase-7
> ActivityLog 模型: `ActivityLog { id, actorId, actor, action, resourceType, resourceId, detail, createdAt }`
> 表名: `activity_logs`

---

## 事件 1: KNOWLEDGE_DOCUMENT_INDEXED

| 字段 | 值 |
|---|---|
| **id** | `actlog_001` |
| **actorId** | `user_admin_001` |
| **actor** | 张系统（admin） |
| **action** | `KNOWLEDGE_DOCUMENT_INDEXED` |
| **resourceType** | `knowledge_document` |
| **resourceId** | `kd_001` |
| **detail** | `{ "dataSourceId": "ds_model_v32", "title": "理然招聘项目分析模型 v3.2", "chunkCount": 15, "collectionKey": "job_calibration" }` |
| **createdAt** | 2026-06-28T09:15:00.000Z |
| **中文文案** | 系统索引了《理然招聘项目分析模型 v3.2》 |

---

## 事件 2: KNOWLEDGE_SEARCH_PERFORMED

| 字段 | 值 |
|---|---|
| **id** | `actlog_002` |
| **actorId** | `user_recruiter_001` |
| **actor** | 王招聘（recruiter） |
| **action** | `KNOWLEDGE_SEARCH_PERFORMED` |
| **resourceType** | `knowledge_search` |
| **resourceId** | `kslog_001` |
| **detail** | `{ "query": "岗位启动校准", "collectionKey": "job_calibration", "mode": "keyword", "resultCount": 3, "noEvidence": false }` |
| **createdAt** | 2026-06-28T09:20:00.000Z |
| **中文文案** | 王招聘 检索了知识库：岗位启动校准 |

---

## 事件 3: KNOWLEDGE_ANSWER_GENERATED

| 字段 | 值 |
|---|---|
| **id** | `actlog_003` |
| **actorId** | `system` |
| **actor** | 系统 |
| **action** | `KNOWLEDGE_ANSWER_GENERATED` |
| **resourceType** | `knowledge_answer` |
| **resourceId** | `ka_001` |
| **detail** | `{ "question": "这个岗位启动时应该问业务哪些问题？", "collectionKey": "job_calibration", "generatedBy": "llm", "provider": "deepseek", "model": "deepseek-v4-flash", "promptVersion": "knowledge-rag-v1", "citationCount": 3, "topChunks": [{ "chunkId": "chunk_calib_001", "sourceLabel": "理然招聘项目分析模型 v3.2" }, { "chunkId": "chunk_calib_002", "sourceLabel": "理然招聘项目分析模型 v3.2" }, { "chunkId": "chunk_calib_003", "sourceLabel": "理然招聘项目分析模型 v3.2" }] }` |
| **createdAt** | 2026-06-28T09:25:00.000Z |
| **中文文案** | 系统基于 3 条知识证据生成了 AI 辅助回答 |

---

## 事件 4: KNOWLEDGE_ANSWER_NO_EVIDENCE

| 字段 | 值 |
|---|---|
| **id** | `actlog_004` |
| **actorId** | `system` |
| **actor** | 系统 |
| **action** | `KNOWLEDGE_ANSWER_NO_EVIDENCE` |
| **resourceType** | `knowledge_answer` |
| **resourceId** | `ka_002` |
| **detail** | `{ "question": "这个候选人一定适合录用吗？", "collectionKey": "interviewer_guide", "answerStatus": "no_evidence", "reason": "搜索返回 0 条结果，无足够证据支持回答" }` |
| **createdAt** | 2026-06-28T09:30:00.000Z |
| **中文文案** | 系统拦截了一次无证据回答 |

---

## 事件 5: KNOWLEDGE_ANSWER_ACCEPTED

| 字段 | 值 |
|---|---|
| **id** | `actlog_005` |
| **actorId** | `user_recruiter_001` |
| **actor** | 王招聘（recruiter） |
| **action** | `KNOWLEDGE_ANSWER_ACCEPTED` |
| **resourceType** | `knowledge_answer` |
| **resourceId** | `ka_001` |
| **detail** | `{ "humanReviewStatus": "accepted", "question": "这个岗位启动时应该问业务哪些问题？", "collectionKey": "job_calibration", "answerPreview": "根据理然招聘项目分析模型 v3.2，岗位启动时招聘负责人应向业务负责人确认以下问题..." }` |
| **createdAt** | 2026-06-28T09:35:00.000Z |
| **中文文案** | 王招聘 接受了知识库 AI 建议：岗位启动校准问题 |

---

## 事件 6: KNOWLEDGE_ANSWER_EDITED

| 字段 | 值 |
|---|---|
| **id** | `actlog_006` |
| **actorId** | `user_recruiter_001` |
| **actor** | 王招聘（recruiter） |
| **action** | `KNOWLEDGE_ANSWER_EDITED` |
| **resourceType** | `knowledge_answer` |
| **resourceId** | `ka_003` |
| **detail** | `{ "humanReviewStatus": "edited", "question": "如何向候选人介绍理然的品牌与业务机会？", "collectionKey": "brand_attraction", "originalAnswerPreview": "根据理然品牌介绍 2026...", "editedAnswerPreview": "根据理然品牌介绍 2026，建议如下介绍框架（已根据实际沟通场景调整措辞）..." }` |
| **createdAt** | 2026-06-28T09:40:00.000Z |
| **中文文案** | 王招聘 编辑后接受了知识库 AI 建议 |

---

## 事件 7: KNOWLEDGE_ANSWER_REJECTED

| 字段 | 值 |
|---|---|
| **id** | `actlog_007` |
| **actorId** | `user_interviewer_001` |
| **actor** | 李面试（interviewer） |
| **action** | `KNOWLEDGE_ANSWER_REJECTED` |
| **resourceType** | `knowledge_answer` |
| **resourceId** | `ka_004` |
| **detail** | `{ "humanReviewStatus": "rejected", "question": "候选人回答很泛，下一轮应该怎么追问？", "collectionKey": "interviewer_guide", "rejectionReason": "回答中部分追问句式与当前面试场景不匹配，建议手动编写追问", "answerPreview": "根据面试官手册第二章追问题库..." }` |
| **createdAt** | 2026-06-28T09:45:00.000Z |
| **中文文案** | 李面试 忽略了知识库 AI 建议：证据不足 |

---

## 事件时间线

| 时间 | 事件 | 操作人 |
|---|---|---|
| 09:15 | 系统索引了《理然招聘项目分析模型 v3.2》 | 张系统（admin） |
| 09:20 | 王招聘 检索了知识库：岗位启动校准 | 王招聘（recruiter） |
| 09:25 | 系统基于 3 条知识证据生成了 AI 辅助回答 | 系统 |
| 09:30 | 系统拦截了一次无证据回答 | 系统 |
| 09:35 | 王招聘 接受了知识库 AI 建议：岗位启动校准问题 | 王招聘（recruiter） |
| 09:40 | 王招聘 编辑后接受了知识库 AI 建议 | 王招聘（recruiter） |
| 09:45 | 李面试 忽略了知识库 AI 建议：证据不足 | 李面试（interviewer） |

---

## 验证要点

| 验证项 | 状态 |
|---|---|
| 所有事件均写入 `activity_logs` 表 | PASS |
| actorId 正确关联 `users` 表 | PASS |
| action 字段使用标准枚举值 | PASS |
| detail 字段包含完整 JSON 上下文 | PASS |
| createdAt 时间戳递增有序 | PASS |
| 中文文案可读性强、信息完整 | PASS |
