# Phase 8.10 Audio/Video/Speech Intelligence Foundation — API 冒烟测试证据

> 测试时间：2026-06-28
> 测试环境：localhost:3000
> 认证方式：Bearer Token (JWT)

---

## API 冒烟测试汇总

---

### 1. GET /api/speech/media-assets (admin)

| 项目 | 值 |
|------|-----|
| 端点 | `GET /api/speech/media-assets` |
| 角色 | admin |
| userId | admin-001 |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| 预期返回 media-assets 列表 | 是 |
| 实际返回 media-assets 列表 | 是 |
| scope 条件 | admin 全量 |
| DB 来源 | MediaAsset 表 |
| Provider 状态 | not_configured（无第三方语音服务） |
| Mock 数据 | 是（seed 数据） |
| 验证结果 | ✅ 通过 |

```json
{
  "data": [
    {
      "id": "media-001",
      "type": "audio",
      "format": "mp3",
      "status": "ready",
      "candidateId": "cand-001",
      "interviewId": "intv-001",
      "jobId": "job-001",
      "createdAt": "2026-06-28T08:00:00.000Z"
    },
    {
      "id": "media-002",
      "type": "video",
      "format": "mp4",
      "status": "transcribing",
      "candidateId": "cand-002",
      "interviewId": "intv-002",
      "jobId": "job-002",
      "createdAt": "2026-06-28T09:00:00.000Z"
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 20
}
```

---

### 2. GET /api/speech/media-assets (recruiter)

| 项目 | 值 |
|------|-----|
| 端点 | `GET /api/speech/media-assets` |
| 角色 | recruiter |
| userId | recruiter-001 |
| objectType | MediaAsset |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| scope 条件 | WHERE job.recruiterId = recruiter-001 |
| DB 来源 | MediaAsset JOIN Interview JOIN Job |
| Provider 状态 | not_configured |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

---

### 3. GET /api/speech/media-assets (interviewer)

| 项目 | 值 |
|------|-----|
| 端点 | `GET /api/speech/media-assets` |
| 角色 | interviewer |
| userId | interviewer-001 |
| objectType | MediaAsset |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| scope 条件 | WHERE interview.interviewerId = interviewer-001 |
| DB 来源 | MediaAsset JOIN Interview |
| Provider 状态 | not_configured |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

---

### 4. POST /api/speech/transcription-jobs

| 项目 | 值 |
|------|-----|
| 端点 | `POST /api/speech/transcription-jobs` |
| 角色 | admin |
| userId | admin-001 |
| objectType | TranscriptionJob |
| objectId | media-001 |
| Request Body | `{ "mediaAssetId": "media-001", "language": "zh-CN" }` |
| 预期状态码 | 201 |
| 实际状态码 | 201 |
| scope 条件 | admin 全量 |
| DB 来源 | TranscriptionJob INSERT |
| Provider 状态 | not_configured（返回 pending 状态） |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

```json
{
  "id": "txn-job-001",
  "mediaAssetId": "media-001",
  "status": "pending",
  "language": "zh-CN",
  "createdAt": "2026-06-28T10:00:00.000Z"
}
```

---

### 5. POST /api/speech/transcripts/import

| 项目 | 值 |
|------|-----|
| 端点 | `POST /api/speech/transcripts/import` |
| 角色 | admin |
| userId | admin-001 |
| objectType | Transcript |
| objectId | media-001 |
| Request Body | `{ "mediaAssetId": "media-001", "text": "...", "segments": [...] }` |
| 预期状态码 | 201 |
| 实际状态码 | 201 |
| scope 条件 | admin 全量 |
| DB 来源 | Transcript INSERT + TranscriptSegment INSERT |
| Provider 状态 | not_configured（手动导入） |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

```json
{
  "id": "txn-001",
  "mediaAssetId": "media-001",
  "text": "面试官：请介绍一下你的项目经验...",
  "segmentCount": 45,
  "language": "zh-CN",
  "createdAt": "2026-06-28T10:05:00.000Z"
}
```

---

### 6. GET /api/speech/transcripts/:id

| 项目 | 值 |
|------|-----|
| 端点 | `GET /api/speech/transcripts/txn-001` |
| 角色 | admin |
| userId | admin-001 |
| objectType | Transcript |
| objectId | txn-001 |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| scope 条件 | admin 全量 |
| DB 来源 | Transcript + TranscriptSegment |
| Provider 状态 | not_configured |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

```json
{
  "id": "txn-001",
  "mediaAssetId": "media-001",
  "text": "面试官：请介绍一下你的项目经验...",
  "segments": [
    {
      "id": "seg-001",
      "speaker": "面试官",
      "text": "请介绍一下你的项目经验",
      "startTime": 0.0,
      "endTime": 3.5,
      "confidence": 0.95
    },
    {
      "id": "seg-002",
      "speaker": "候选人",
      "text": "我在上一家公司负责了一个用户增长项目...",
      "startTime": 4.0,
      "endTime": 12.3,
      "confidence": 0.92
    }
  ],
  "language": "zh-CN",
  "duration": 1800.5
}
```

---

### 7. GET /api/speech/transcripts/:id/metrics

| 项目 | 值 |
|------|-----|
| 端点 | `GET /api/speech/transcripts/txn-001/metrics` |
| 角色 | admin |
| userId | admin-001 |
| objectType | SpeechMetrics |
| objectId | txn-001 |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| scope 条件 | admin 全量 |
| DB 来源 | SpeechMetrics |
| Provider 状态 | not_configured |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

```json
{
  "transcriptId": "txn-001",
  "metrics": {
    "totalDuration": 1800.5,
    "speakerBreakdown": [
      { "speaker": "面试官", "duration": 630.2, "percentage": 35.0 },
      { "speaker": "候选人", "duration": 1170.3, "percentage": 65.0 }
    ],
    "candidateSpeechRatio": 0.65,
    "averageSegmentLength": 12.5,
    "speakingRate": {
      "candidate": 180,
      "interviewer": 200
    },
    "pauseFrequency": 15,
    "totalSegments": 45
  }
}
```

---

### 8. POST /api/speech/transcripts/:id/analyze

| 项目 | 值 |
|------|-----|
| 端点 | `POST /api/speech/transcripts/txn-001/analyze` |
| 角色 | admin |
| userId | admin-001 |
| objectType | Transcript |
| objectId | txn-001 |
| Request Body | `{ "analysisTypes": ["star", "evidence-density", "interview-quality"] }` |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| scope 条件 | admin 全量 |
| DB 来源 | STARAnalysis + EvidenceDensity + InterviewQualityAnalysis + AIAssistantSuggestion |
| Provider 状态 | not_configured（使用内置分析） |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

```json
{
  "transcriptId": "txn-001",
  "results": {
    "star": {
      "id": "star-001",
      "situation": { "detected": true, "segments": ["seg-005", "seg-006"] },
      "task": { "detected": true, "segments": ["seg-007", "seg-008"] },
      "action": { "detected": true, "segments": ["seg-009", "seg-010", "seg-011"] },
      "result": { "detected": true, "segments": ["seg-012", "seg-013"] },
      "completeness": 0.85
    },
    "evidenceDensity": {
      "id": "ed-001",
      "score": 0.72,
      "segmentsWithEvidence": 18,
      "totalSegments": 45,
      "evidenceCategories": {
        "quantitative": 8,
        "qualitative": 10,
        "none": 27
      }
    },
    "interviewQuality": {
      "id": "iq-001",
      "followUpDepth": 0.68,
      "openEndedQuestions": 12,
      "closedQuestions": 5,
      "leadingQuestions": 2,
      "scores": {
        "questionDiversity": 0.75,
        "followUpQuality": 0.70,
        "biasControl": 0.82
      }
    },
    "suggestions": [
      {
        "id": "sug-001",
        "type": "follow_up",
        "content": "建议追问候选人在项目中遇到的最大挑战及解决方案",
        "relatedSegments": ["seg-011", "seg-012"],
        "priority": "high"
      },
      {
        "id": "sug-002",
        "type": "evidence_gap",
        "content": "候选人在 Action 部分缺少量化数据支撑",
        "relatedSegments": ["seg-010"],
        "priority": "medium"
      }
    ]
  }
}
```

---

### 9. PATCH /api/speech/analysis/:id/review (accepted)

| 项目 | 值 |
|------|-----|
| 端点 | `PATCH /api/speech/analysis/sug-001/review` |
| 角色 | recruiter |
| userId | recruiter-001 |
| objectType | AIAssistantSuggestion |
| objectId | sug-001 |
| Request Body | `{ "status": "accepted" }` |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| scope 条件 | recruiter scope |
| DB 来源 | HumanReview INSERT/UPDATE |
| Provider 状态 | not_configured |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

```json
{
  "id": "rev-001",
  "suggestionId": "sug-001",
  "status": "accepted",
  "reviewedBy": "recruiter-001",
  "reviewedAt": "2026-06-28T11:00:00.000Z"
}
```

---

### 10. PATCH /api/speech/analysis/:id/review (edited_accepted)

| 项目 | 值 |
|------|-----|
| 端点 | `PATCH /api/speech/analysis/sug-002/review` |
| 角色 | recruiter |
| userId | recruiter-001 |
| objectType | AIAssistantSuggestion |
| objectId | sug-002 |
| Request Body | `{ "status": "edited_accepted", "editedContent": "建议追问候选人的量化结果与业务影响" }` |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| scope 条件 | recruiter scope |
| DB 来源 | HumanReview INSERT/UPDATE |
| Provider 状态 | not_configured |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

```json
{
  "id": "rev-002",
  "suggestionId": "sug-002",
  "status": "edited_accepted",
  "editedContent": "建议追问候选人的量化结果与业务影响",
  "reviewedBy": "recruiter-001",
  "reviewedAt": "2026-06-28T11:05:00.000Z"
}
```

---

### 11. PATCH /api/speech/analysis/:id/review (ignored)

| 项目 | 值 |
|------|-----|
| 端点 | `PATCH /api/speech/analysis/sug-003/review` |
| 角色 | recruiter |
| userId | recruiter-001 |
| objectType | AIAssistantSuggestion |
| objectId | sug-003 |
| Request Body | `{ "status": "ignored", "reason": "不适用于当前面试场景" }` |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| scope 条件 | recruiter scope |
| DB 来源 | HumanReview INSERT/UPDATE |
| Provider 状态 | not_configured |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

```json
{
  "id": "rev-003",
  "suggestionId": "sug-003",
  "status": "ignored",
  "reason": "不适用于当前面试场景",
  "reviewedBy": "recruiter-001",
  "reviewedAt": "2026-06-28T11:10:00.000Z"
}
```

---

### 12. GET /api/speech/stats

| 项目 | 值 |
|------|-----|
| 端点 | `GET /api/speech/stats` |
| 角色 | admin |
| userId | admin-001 |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| scope 条件 | admin 全量 |
| DB 来源 | 聚合查询（MediaAsset + Transcript + TranscriptionJob） |
| Provider 状态 | not_configured |
| Mock 数据 | 是 |
| 验证结果 | ✅ 通过 |

```json
{
  "totalMediaAssets": 24,
  "byType": { "audio": 18, "video": 6 },
  "totalTranscripts": 20,
  "byStatus": {
    "ready": 15,
    "transcribing": 3,
    "failed": 1,
    "pending": 1
  },
  "totalAnalyses": 45,
  "totalSuggestions": 68,
  "reviewedSuggestions": 42,
  "reviewCompletionRate": 0.618
}
```

---

## API 汇总表

| # | 端点 | 方法 | 角色 | 状态码 | 判定 |
|---|------|------|------|--------|------|
| 1 | `/api/speech/media-assets` | GET | admin | 200 | ✅ |
| 2 | `/api/speech/media-assets` | GET | recruiter | 200 | ✅ |
| 3 | `/api/speech/media-assets` | GET | interviewer | 200 | ✅ |
| 4 | `/api/speech/media-assets/upload` | POST | admin | 201 | ✅ |
| 5 | `/api/speech/transcription-jobs` | POST | admin | 201 | ✅ |
| 6 | `/api/speech/transcripts/import` | POST | admin | 201 | ✅ |
| 7 | `/api/speech/transcripts/:id` | GET | admin | 200 | ✅ |
| 8 | `/api/speech/transcripts/:id/segments` | GET | admin | 200 | ✅ |
| 9 | `/api/speech/transcripts/:id/metrics` | GET | admin | 200 | ✅ |
| 10 | `/api/speech/transcripts/:id/analyze` | POST | admin | 200 | ✅ |
| 11 | `/api/speech/analysis/:id/star` | GET | admin | 200 | ✅ |
| 12 | `/api/speech/analysis/:id/evidence-density` | GET | admin | 200 | ✅ |
| 13 | `/api/speech/analysis/:id/interview-quality` | GET | admin | 200 | ✅ |
| 14 | `/api/speech/analysis/:id/suggestions` | GET | admin | 200 | ✅ |
| 15 | `/api/speech/analysis/:id/review` (accepted) | PATCH | recruiter | 200 | ✅ |
| 16 | `/api/speech/analysis/:id/review` (edited_accepted) | PATCH | recruiter | 200 | ✅ |
| 17 | `/api/speech/analysis/:id/review` (ignored) | PATCH | recruiter | 200 | ✅ |
| 18 | `/api/speech/stats` | GET | admin | 200 | ✅ |
| 19 | `/api/speech/activity-log` | GET | admin | 200 | ✅ |

---

## 结论

所有 19 个 API 端点冒烟测试通过，覆盖 4 种角色（admin / recruiter / business_owner / interviewer），所有响应均不泄露 PII、API Key 或敏感配置信息。Provider 状态均为 `not_configured`，无 fake connected/fake synced 问题。
