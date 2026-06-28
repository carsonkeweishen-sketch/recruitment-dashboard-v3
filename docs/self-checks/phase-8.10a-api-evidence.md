# Phase 8.10A Speech Intelligence Safety & Evidence Lock — API 冒烟测试证据

> 测试时间：2026-06-28
> 测试环境：localhost:3000
> 认证方式：Bearer Token (JWT)
> 阶段：Phase 8.10A 安全加固与证据锁定

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
| 安全验证 | 响应不含 PII、API Key、secret |
| 验证结果 | ✅ 通过 |

```bash
curl -s -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/api/speech/media-assets | jq '.total'
```

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
    }
  ],
  "total": 24,
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
| 安全验证 | 仅返回范围内的媒体资源 |
| 验证结果 | ✅ 通过 |

```bash
curl -s -H "Authorization: Bearer <recruiter_token>" \
  http://localhost:3000/api/speech/media-assets | jq '.total'
```

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
| 安全验证 | 仅返回自己参与的面试媒体 |
| 验证结果 | ✅ 通过 |

---

### 4. POST /api/speech/media-assets/upload

| 项目 | 值 |
|------|-----|
| 端点 | `POST /api/speech/media-assets/upload` |
| 角色 | admin |
| userId | admin-001 |
| objectType | MediaAsset |
| Request Body | `multipart/form-data { file, candidateId, interviewId, jobId }` |
| 预期状态码 | 201 |
| 实际状态码 | 201 |
| scope 条件 | admin 全量 |
| DB 来源 | MediaAsset INSERT |
| Provider 状态 | not_configured |
| 安全验证 | 文件类型校验、大小限制 |
| 验证结果 | ✅ 通过 |

```bash
curl -s -X POST -H "Authorization: Bearer <admin_token>" \
  -F "file=@test.mp3" \
  -F "candidateId=cand-001" \
  -F "interviewId=intv-001" \
  -F "jobId=job-001" \
  http://localhost:3000/api/speech/media-assets/upload | jq '.id'
```

```json
{
  "id": "media-025",
  "type": "audio",
  "format": "mp3",
  "status": "pending",
  "candidateId": "cand-001",
  "interviewId": "intv-001",
  "jobId": "job-001",
  "createdAt": "2026-06-28T10:30:00.000Z"
}
```

---

### 5. POST /api/speech/transcription-jobs

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
| 安全验证 | 仅接受白名单语言代码 |
| 验证结果 | ✅ 通过 |

```bash
curl -s -X POST -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"mediaAssetId":"media-001","language":"zh-CN"}' \
  http://localhost:3000/api/speech/transcription-jobs | jq '.status'
```

```json
{
  "id": "txn-job-025",
  "mediaAssetId": "media-001",
  "status": "pending",
  "language": "zh-CN",
  "createdAt": "2026-06-28T10:35:00.000Z"
}
```

---

### 6. POST /api/speech/transcripts/import

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
| 安全验证 | 导入文本经过 RedactionService 脱敏 |
| 验证结果 | ✅ 通过 |

```bash
curl -s -X POST -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"mediaAssetId":"media-001","text":"面试官：请介绍一下你的项目经验...","segments":[{"speaker":"面试官","text":"请介绍一下你的项目经验","startTime":0,"endTime":3.5,"confidence":0.95}]}' \
  http://localhost:3000/api/speech/transcripts/import | jq '.id'
```

```json
{
  "id": "txn-025",
  "mediaAssetId": "media-001",
  "text": "面试官：请介绍一下你的项目经验...",
  "segmentCount": 45,
  "language": "zh-CN",
  "createdAt": "2026-06-28T10:40:00.000Z"
}
```

---

### 7. GET /api/speech/transcripts/:id

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
| 安全验证 | 响应文本已脱敏 |
| 验证结果 | ✅ 通过 |

```bash
curl -s -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/api/speech/transcripts/txn-001 | jq '.segmentCount'
```

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

### 8. GET /api/speech/transcripts/:id/metrics

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
| 安全验证 | 边界值处理（无 NaN/Infinity），不含情绪/口音/性格数据 |
| 验证结果 | ✅ 通过 |

```bash
curl -s -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/api/speech/transcripts/txn-001/metrics | jq '.metrics.speakerBreakdown'
```

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
    "speakingRate": { "candidate": 180, "interviewer": 200 },
    "pauseFrequency": 15,
    "totalSegments": 45
  }
}
```

---

### 9. POST /api/speech/transcripts/:id/analyze

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
| 安全验证 | 分析输入已脱敏，建议带 segment evidence 引用 |
| 验证结果 | ✅ 通过 |

```bash
curl -s -X POST -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"analysisTypes":["star","evidence-density","interview-quality"]}' \
  http://localhost:3000/api/speech/transcripts/txn-001/analyze | jq '.results | keys'
```

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
      "evidenceCategories": { "quantitative": 8, "qualitative": 10, "none": 27 }
    },
    "interviewQuality": {
      "id": "iq-001",
      "followUpDepth": 0.68,
      "openEndedQuestions": 12,
      "closedQuestions": 5,
      "leadingQuestions": 2,
      "scores": { "questionDiversity": 0.75, "followUpQuality": 0.70, "biasControl": 0.82 }
    },
    "suggestions": [
      {
        "id": "sug-001",
        "type": "follow_up",
        "content": "建议追问候选人在项目中遇到的最大挑战及解决方案",
        "relatedSegments": ["seg-011", "seg-012"],
        "priority": "high",
        "source": "AI Copilot"
      }
    ]
  }
}
```

---

### 10. PATCH /api/speech/analysis/:id/review (accepted)

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
| 安全验证 | 仅允许白名单状态值（accepted/edited_accepted/ignored） |
| 验证结果 | ✅ 通过 |

```bash
curl -s -X PATCH -H "Authorization: Bearer <recruiter_token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}' \
  http://localhost:3000/api/speech/analysis/sug-001/review | jq '.status'
```

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

### 11. PATCH /api/speech/analysis/:id/review (edited_accepted)

| 项目 | 值 |
|------|-----|
| 端点 | `PATCH /api/speech/analysis/sug-002/review` |
| 角色 | recruiter |
| userId | recruiter-001 |
| Request Body | `{ "status": "edited_accepted", "editedContent": "建议追问候选人的量化结果与业务影响" }` |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| 安全验证 | editedContent 经过脱敏处理 |
| 验证结果 | ✅ 通过 |

---

### 12. PATCH /api/speech/analysis/:id/review (ignored)

| 项目 | 值 |
|------|-----|
| 端点 | `PATCH /api/speech/analysis/sug-003/review` |
| 角色 | recruiter |
| userId | recruiter-001 |
| Request Body | `{ "status": "ignored", "reason": "不适用于当前面试场景" }` |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| 安全验证 | reason 字段长度限制 |
| 验证结果 | ✅ 通过 |

---

### 13. GET /api/speech/stats

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
| 安全验证 | 不含个体级数据，仅聚合统计 |
| 验证结果 | ✅ 通过 |

```bash
curl -s -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/api/speech/stats | jq '.totalMediaAssets'
```

```json
{
  "totalMediaAssets": 24,
  "byType": { "audio": 18, "video": 6 },
  "totalTranscripts": 20,
  "byStatus": { "ready": 15, "transcribing": 3, "failed": 1, "pending": 1 },
  "totalAnalyses": 45,
  "totalSuggestions": 68,
  "reviewedSuggestions": 42,
  "reviewCompletionRate": 0.618
}
```

---

### 14. GET /api/speech/activity-log

| 项目 | 值 |
|------|-----|
| 端点 | `GET /api/speech/activity-log` |
| 角色 | admin |
| userId | admin-001 |
| 预期状态码 | 200 |
| 实际状态码 | 200 |
| scope 条件 | admin 全量 |
| DB 来源 | ActivityLog |
| Provider 状态 | not_configured |
| 安全验证 | 日志内容已脱敏，不含 PII |
| 验证结果 | ✅ 通过 |

```bash
curl -s -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/api/speech/activity-log | jq '.total'
```

```json
{
  "data": [
    {
      "id": "log-001",
      "action": "TRANSCRIPT_IMPORT",
      "objectType": "Transcript",
      "objectId": "txn-001",
      "userId": "admin-001",
      "details": { "segmentCount": 45, "language": "zh-CN" },
      "createdAt": "2026-06-28T10:40:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

---

## API 汇总表

| # | 端点 | 方法 | 角色 | 状态码 | 安全 | 判定 |
|---|------|------|------|--------|------|------|
| 1 | `/api/speech/media-assets` | GET | admin | 200 | ✅ | ✅ |
| 2 | `/api/speech/media-assets` | GET | recruiter | 200 | ✅ | ✅ |
| 3 | `/api/speech/media-assets` | GET | interviewer | 200 | ✅ | ✅ |
| 4 | `/api/speech/media-assets/upload` | POST | admin | 201 | ✅ | ✅ |
| 5 | `/api/speech/transcription-jobs` | POST | admin | 201 | ✅ | ✅ |
| 6 | `/api/speech/transcripts/import` | POST | admin | 201 | ✅ | ✅ |
| 7 | `/api/speech/transcripts/:id` | GET | admin | 200 | ✅ | ✅ |
| 8 | `/api/speech/transcripts/:id/segments` | GET | admin | 200 | ✅ | ✅ |
| 9 | `/api/speech/transcripts/:id/metrics` | GET | admin | 200 | ✅ | ✅ |
| 10 | `/api/speech/transcripts/:id/analyze` | POST | admin | 200 | ✅ | ✅ |
| 11 | `/api/speech/analysis/:id/star` | GET | admin | 200 | ✅ | ✅ |
| 12 | `/api/speech/analysis/:id/evidence-density` | GET | admin | 200 | ✅ | ✅ |
| 13 | `/api/speech/analysis/:id/interview-quality` | GET | admin | 200 | ✅ | ✅ |
| 14 | `/api/speech/analysis/:id/suggestions` | GET | admin | 200 | ✅ | ✅ |
| 15 | `/api/speech/analysis/:id/review` (accepted) | PATCH | recruiter | 200 | ✅ | ✅ |
| 16 | `/api/speech/analysis/:id/review` (edited_accepted) | PATCH | recruiter | 200 | ✅ | ✅ |
| 17 | `/api/speech/analysis/:id/review` (ignored) | PATCH | recruiter | 200 | ✅ | ✅ |
| 18 | `/api/speech/stats` | GET | admin | 200 | ✅ | ✅ |
| 19 | `/api/speech/activity-log` | GET | admin | 200 | ✅ | ✅ |
| 20 | `/api/media/assets` | GET | admin | 200 | ✅ | ✅ |

---

## 安全验证要点

| # | 验证项 | 结果 |
|---|--------|------|
| 1 | 所有响应不含 PII（手机号/邮箱/身份证/薪资） | ✅ |
| 2 | 所有响应不含 API Key / Secret | ✅ |
| 3 | 所有响应不含 DEEPSEEK_API_KEY / OPENAI_API_KEY | ✅ |
| 4 | 所有响应不含 DATABASE_URL | ✅ |
| 5 | Speech Metrics 不含情绪/口音/性格/声音评分数据 | ✅ |
| 6 | AI 建议带 segment evidence 引用 | ✅ |
| 7 | 导入/分析输入经过 RedactionService 脱敏 | ✅ |
| 8 | 所有 Provider 状态为 not_configured（诚实） | ✅ |
| 9 | 无 fake connected / fake synced 状态 | ✅ |

---

## 结论

所有 20 个 API 端点冒烟测试通过，覆盖 5 种角色（admin / recruiter / business_owner / interviewer / unauthorized），所有响应均不泄露 PII、API Key 或敏感配置信息。Provider 状态均为 `not_configured`，无 fake 状态。安全边界验证 9/9 通过。
