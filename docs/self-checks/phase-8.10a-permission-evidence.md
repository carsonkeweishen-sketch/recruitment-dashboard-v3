# Phase 8.10A Speech Intelligence Safety & Evidence Lock — 权限验证证据

> 测试时间：2026-06-28
> 测试方法：对象级权限验证（不同角色 × 不同端点 × 不同资源）
> 阶段：Phase 8.10A 安全加固与证据锁定

---

## 权限矩阵总表

| # | 角色 | userId | 端点 | objectType | objectId | scope 条件 | HTTP | 响应摘要 | 越权对象 | 泄露 PII/secret | 判定 |
|---|------|--------|------|------------|----------|------------|------|----------|----------|-----------------|------|
| 1 | admin | admin-001 | GET /api/speech/media-assets | MediaAsset | — | admin 全量 | 200 | 全部媒体资源 | 否 | 否 | ✅ |
| 2 | admin | admin-001 | GET /api/speech/transcripts/txn-001 | Transcript | txn-001 | admin 全量 | 200 | 完整转写 + segments | 否 | 否 | ✅ |
| 3 | admin | admin-001 | GET /api/speech/transcripts/txn-001/metrics | SpeechMetrics | txn-001 | admin 全量 | 200 | 完整指标 | 否 | 否 | ✅ |
| 4 | admin | admin-001 | POST /api/speech/transcripts/txn-001/analyze | Transcript | txn-001 | admin 全量 | 200 | STAR + ED + IQ + 建议 | 否 | 否 | ✅ |
| 5 | admin | admin-001 | GET /api/speech/stats | — | — | admin 全量 | 200 | 全量统计 | 否 | 否 | ✅ |
| 6 | admin | admin-001 | PATCH /api/speech/analysis/sug-001/review | Suggestion | sug-001 | admin 全量 | 200 | 复核成功 | 否 | 否 | ✅ |
| 7 | recruiter | recruiter-001 | GET /api/speech/media-assets | MediaAsset | — | job.recruiterId = recruiter-001 | 200 | 范围内媒体 | 否 | 否 | ✅ |
| 8 | recruiter | recruiter-001 | GET /api/speech/transcripts/txn-001 | Transcript | txn-001 (own) | job.recruiterId = recruiter-001 | 200 | 范围内转写 | 否 | 否 | ✅ |
| 9 | recruiter | recruiter-001 | GET /api/speech/transcripts/txn-099 | Transcript | txn-099 (other) | job.recruiterId = recruiter-001 | 404 | `{ "error": "Not Found", "safe": true }` | 否 | 否 | ✅ |
| 10 | recruiter | recruiter-001 | POST /api/speech/transcripts/import | Transcript | media-001 (own) | job.recruiterId = recruiter-001 | 201 | 导入成功 | 否 | 否 | ✅ |
| 11 | recruiter | recruiter-001 | GET /api/speech/stats | — | — | job.recruiterId = recruiter-001 | 200 | 范围内统计 | 否 | 否 | ✅ |
| 12 | recruiter | recruiter-001 | PATCH /api/speech/analysis/sug-001/review | Suggestion | sug-001 (own) | job.recruiterId = recruiter-001 | 200 | 复核成功 | 否 | 否 | ✅ |
| 13 | recruiter | recruiter-001 | PATCH /api/speech/analysis/sug-099/review | Suggestion | sug-099 (other) | job.recruiterId = recruiter-001 | 404 | `{ "error": "Not Found", "safe": true }` | 否 | 否 | ✅ |
| 14 | business_owner | bo-001 | GET /api/speech/media-assets | MediaAsset | — | job.businessOwnerId = bo-001 | 200 | 范围内媒体 | 否 | 否 | ✅ |
| 15 | business_owner | bo-001 | GET /api/speech/transcripts/txn-002 | Transcript | txn-002 (own) | job.businessOwnerId = bo-001 | 200 | 范围内转写 | 否 | 否 | ✅ |
| 16 | business_owner | bo-001 | GET /api/speech/transcripts/txn-001 | Transcript | txn-001 (other) | job.businessOwnerId = bo-001 | 404 | `{ "error": "Not Found", "safe": true }` | 否 | 否 | ✅ |
| 17 | business_owner | bo-001 | POST /api/speech/transcription-jobs | TranscriptionJob | media-002 (own) | job.businessOwnerId = bo-001 | 201 | 任务创建成功 | 否 | 否 | ✅ |
| 18 | business_owner | bo-001 | GET /api/speech/stats | — | — | job.businessOwnerId = bo-001 | 200 | 范围内统计 | 否 | 否 | ✅ |
| 19 | interviewer | interviewer-001 | GET /api/speech/media-assets | MediaAsset | — | interview.interviewerId = interviewer-001 | 200 | 仅自己面试的媒体 | 否 | 否 | ✅ |
| 20 | interviewer | interviewer-001 | GET /api/speech/transcripts/txn-003 | Transcript | txn-003 (own interview) | interview.interviewerId = interviewer-001 | 200 | 自己面试的转写 | 否 | 否 | ✅ |
| 21 | interviewer | interviewer-001 | GET /api/speech/transcripts/txn-001 | Transcript | txn-001 (other interview) | interview.interviewerId = interviewer-001 | 404 | `{ "error": "Not Found", "safe": true }` | 否 | 否 | ✅ |
| 22 | interviewer | interviewer-001 | POST /api/speech/transcription-jobs | TranscriptionJob | media-001 | — | 403 | Forbidden | 否 | 否 | ✅ |
| 23 | interviewer | interviewer-001 | POST /api/speech/transcripts/import | Transcript | media-001 | — | 403 | Forbidden | 否 | 否 | ✅ |
| 24 | interviewer | interviewer-001 | PATCH /api/speech/analysis/sug-001/review | Suggestion | sug-001 | — | 403 | Forbidden | 否 | 否 | ✅ |
| 25 | interviewer | interviewer-001 | GET /api/speech/stats | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |
| 26 | interviewer | interviewer-001 | GET /api/speech/activity-log | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |
| 27 | interviewer | interviewer-001 | POST /api/speech/transcripts/:id/analyze | Transcript | txn-001 | — | 403 | Forbidden | 否 | 否 | ✅ |
| 28 | unauthorized | — | GET /api/speech/media-assets | MediaAsset | — | — | 401 | Unauthorized | 否 | 否 | ✅ |
| 29 | unauthorized | — | GET /api/speech/transcripts/txn-001 | Transcript | txn-001 | — | 401 | Unauthorized | 否 | 否 | ✅ |
| 30 | unauthorized | — | POST /api/speech/transcripts/import | Transcript | — | — | 401 | Unauthorized | 否 | 否 | ✅ |

---

## 角色权限详细说明

### Admin（管理员）

| 端点 | 权限 | 状态码 | 备注 |
|------|------|--------|------|
| `GET /api/speech/media-assets` | ✅ 完全访问 | 200 | 全部媒体资源 |
| `GET /api/speech/media-assets/:id` | ✅ 完全访问 | 200 | 媒体详情 |
| `POST /api/speech/media-assets/upload` | ✅ 完全访问 | 201 | 上传媒体 |
| `POST /api/speech/transcription-jobs` | ✅ 完全访问 | 201 | 创建转写任务 |
| `GET /api/speech/transcription-jobs/:id` | ✅ 完全访问 | 200 | 任务状态 |
| `POST /api/speech/transcripts/import` | ✅ 完全访问 | 201 | 手动导入 |
| `GET /api/speech/transcripts/:id` | ✅ 完全访问 | 200 | 转写结果 |
| `GET /api/speech/transcripts/:id/segments` | ✅ 完全访问 | 200 | 转写片段 |
| `GET /api/speech/transcripts/:id/metrics` | ✅ 完全访问 | 200 | 语音指标 |
| `POST /api/speech/transcripts/:id/analyze` | ✅ 完全访问 | 200 | 触发分析 |
| `GET /api/speech/analysis/:id/star` | ✅ 完全访问 | 200 | STAR 分析 |
| `GET /api/speech/analysis/:id/evidence-density` | ✅ 完全访问 | 200 | 证据密度 |
| `GET /api/speech/analysis/:id/interview-quality` | ✅ 完全访问 | 200 | 追问质量 |
| `GET /api/speech/analysis/:id/suggestions` | ✅ 完全访问 | 200 | AI 建议 |
| `PATCH /api/speech/analysis/:id/review` | ✅ 完全访问 | 200 | 人工复核 |
| `GET /api/speech/stats` | ✅ 完全访问 | 200 | 全量统计 |
| `GET /api/speech/activity-log` | ✅ 完全访问 | 200 | 活动日志 |

### Recruiter（招聘专员）

| 端点 | 权限 | 状态码 | 备注 |
|------|------|--------|------|
| `GET /api/speech/media-assets` | ✅ 范围可见 | 200 | 归属自己候选人的媒体 |
| `GET /api/speech/media-assets/:id` | ✅ 范围可见 | 200 | 范围内媒体详情 |
| `POST /api/speech/media-assets/upload` | ✅ 范围可见 | 201 | 为自己候选人上传 |
| `POST /api/speech/transcription-jobs` | ✅ 范围可见 | 201 | 为自己候选人的媒体创建任务 |
| `GET /api/speech/transcription-jobs/:id` | ✅ 范围可见 | 200 | 范围内任务 |
| `POST /api/speech/transcripts/import` | ✅ 范围可见 | 201 | 为范围内媒体导入 |
| `GET /api/speech/transcripts/:id` | ✅ 范围可见 | 200 | 范围内转写 |
| `GET /api/speech/transcripts/:id/segments` | ✅ 范围可见 | 200 | 范围内片段 |
| `GET /api/speech/transcripts/:id/metrics` | ✅ 范围可见 | 200 | 范围内指标 |
| `POST /api/speech/transcripts/:id/analyze` | ✅ 范围可见 | 200 | 范围内分析 |
| `GET /api/speech/analysis/:id/*` | ✅ 范围可见 | 200 | 范围内分析结果 |
| `PATCH /api/speech/analysis/:id/review` | ✅ 范围可见 | 200 | 范围内复核 |
| `GET /api/speech/stats` | ✅ 范围可见 | 200 | 范围内统计 |
| `GET /api/speech/activity-log` | ✅ 范围可见 | 200 | 范围内日志 |

### Business Owner（业务负责人）

| 端点 | 权限 | 状态码 | 备注 |
|------|------|--------|------|
| `GET /api/speech/media-assets` | ✅ 范围可见 | 200 | 归属自己职位的媒体 |
| `GET /api/speech/media-assets/:id` | ✅ 范围可见 | 200 | 范围内媒体详情 |
| `POST /api/speech/media-assets/upload` | ✅ 范围可见 | 201 | 为自己职位的候选人上传 |
| `POST /api/speech/transcription-jobs` | ✅ 范围可见 | 201 | 为自己职位创建任务 |
| `POST /api/speech/transcripts/import` | ✅ 范围可见 | 201 | 为范围内媒体导入 |
| `GET /api/speech/transcripts/:id` | ✅ 范围可见 | 200 | 范围内转写 |
| `GET /api/speech/transcripts/:id/segments` | ✅ 范围可见 | 200 | 范围内片段 |
| `GET /api/speech/transcripts/:id/metrics` | ✅ 范围可见 | 200 | 范围内指标 |
| `POST /api/speech/transcripts/:id/analyze` | ✅ 范围可见 | 200 | 范围内分析 |
| `GET /api/speech/analysis/:id/*` | ✅ 范围可见 | 200 | 范围内分析结果 |
| `PATCH /api/speech/analysis/:id/review` | ✅ 范围可见 | 200 | 范围内复核 |
| `GET /api/speech/stats` | ✅ 范围可见 | 200 | 范围内统计 |

### Interviewer（面试官）

| 端点 | 权限 | 状态码 | 备注 |
|------|------|--------|------|
| `GET /api/speech/media-assets` | ✅ 仅自己面试 | 200 | 仅自己参与的面试媒体 |
| `GET /api/speech/media-assets/:id` | ✅ 仅自己面试 | 200 | 仅自己参与的媒体 |
| `GET /api/speech/transcripts/:id` | ✅ 仅自己面试 | 200 | 仅自己面试的转写 |
| `GET /api/speech/transcripts/:id/segments` | ✅ 仅自己面试 | 200 | 仅自己面试的片段 |
| `GET /api/speech/transcripts/:id/metrics` | ✅ 仅自己面试 | 200 | 仅自己面试的指标 |
| `POST /api/speech/transcripts/:id/analyze` | ❌ 禁止 | 403 | 无权触发分析 |
| `GET /api/speech/analysis/:id/*` | ❌ 禁止 | 403 | 无权查看分析 |
| `PATCH /api/speech/analysis/:id/review` | ❌ 禁止 | 403 | 无权复核 |
| `POST /api/speech/media-assets/upload` | ❌ 禁止 | 403 | 无权上传 |
| `POST /api/speech/transcription-jobs` | ❌ 禁止 | 403 | 无权创建任务 |
| `POST /api/speech/transcripts/import` | ❌ 禁止 | 403 | 无权导入 |
| `GET /api/speech/stats` | ❌ 禁止 | 403 | 无权查看统计 |
| `GET /api/speech/activity-log` | ❌ 禁止 | 403 | 无权查看日志 |

---

## Scope Guardrail 验证

### 5 角色 × 5 端点交叉矩阵

| 端点 | admin | recruiter | business_owner | interviewer | unauthorized |
|------|-------|-----------|----------------|-------------|--------------|
| `GET /api/speech/media-assets` | 200 (全量) | 200 (范围) | 200 (范围) | 200 (自己) | 401 |
| `GET /api/speech/transcripts/:id` | 200 (全量) | 200/404 (范围) | 200/404 (范围) | 200/404 (自己) | 401 |
| `POST /api/speech/transcription-jobs` | 201 | 201 (范围) | 201 (范围) | 403 | 401 |
| `PATCH /api/speech/analysis/:id/review` | 200 | 200/404 (范围) | 200/404 (范围) | 403 | 401 |
| `GET /api/speech/stats` | 200 (全量) | 200 (范围) | 200 (范围) | 403 | 401 |

---

## 越权测试详细记录

### 测试 1: Recruiter 访问其他 Recruiter 的 Transcript

| 项目 | 值 |
|------|-----|
| 角色 | recruiter (recruiter-001) |
| 端点 | `GET /api/speech/transcripts/txn-099` |
| objectType | Transcript |
| objectId | txn-099（归属 recruiter-002） |
| 预期 | 404 或 403，不泄露对象存在性 |
| 实际状态码 | 404 |
| 响应体 | `{ "error": "Not Found", "safe": true }` |
| 是否泄露对象存在 | 否（safe: true 确保与不存在无法区分） |
| 判定 | ✅ 通过 |

### 测试 2: Interviewer 访问非自己面试的 Transcript

| 项目 | 值 |
|------|-----|
| 角色 | interviewer (interviewer-001) |
| 端点 | `GET /api/speech/transcripts/txn-001` |
| objectType | Transcript |
| objectId | txn-001（面试官为 interviewer-002） |
| 预期 | 404，不泄露对象存在性 |
| 实际状态码 | 404 |
| 响应体 | `{ "error": "Not Found", "safe": true }` |
| 是否泄露对象存在 | 否 |
| 判定 | ✅ 通过 |

### 测试 3: Interviewer 尝试访问 Offer 阶段转写

| 项目 | 值 |
|------|-----|
| 角色 | interviewer (interviewer-001) |
| 端点 | `GET /api/speech/transcripts/txn-offer-001` |
| objectType | Transcript |
| objectId | txn-offer-001（Offer 阶段，interviewer 非参与者） |
| 预期 | 404 或 403 |
| 实际状态码 | 404 |
| 响应体 | `{ "error": "Not Found", "safe": true }` |
| 判定 | ✅ 通过 |

### 测试 4: Interviewer 403 批量验证

| 端点 | 方法 | 预期 | 实际 | 判定 |
|------|------|------|------|------|
| `POST /api/speech/transcription-jobs` | POST | 403 | 403 | ✅ |
| `POST /api/speech/transcripts/import` | POST | 403 | 403 | ✅ |
| `POST /api/speech/transcripts/txn-001/analyze` | POST | 403 | 403 | ✅ |
| `PATCH /api/speech/analysis/sug-001/review` | PATCH | 403 | 403 | ✅ |
| `GET /api/speech/stats` | GET | 403 | 403 | ✅ |
| `GET /api/speech/activity-log` | GET | 403 | 403 | ✅ |
| `POST /api/speech/media-assets/upload` | POST | 403 | 403 | ✅ |

### 测试 5: 未认证用户访问所有端点

| 端点 | 预期 | 实际 | 判定 |
|------|------|------|------|
| `GET /api/speech/media-assets` | 401 | 401 | ✅ |
| `GET /api/speech/transcripts/txn-001` | 401 | 401 | ✅ |
| `POST /api/speech/transcripts/import` | 401 | 401 | ✅ |
| `POST /api/speech/transcription-jobs` | 401 | 401 | ✅ |
| `GET /api/speech/stats` | 401 | 401 | ✅ |

---

## 结论

所有 30 项权限测试通过。对象级权限控制覆盖 5 种角色：
- **admin**: 完全访问，无限制
- **recruiter**: 范围访问（job.recruiterId 过滤），越权返回 404 + safe:true
- **business_owner**: 范围访问（job.businessOwnerId 过滤），越权返回 404 + safe:true
- **interviewer**: 仅访问自己参与的面试，无权创建/修改/分析，越权返回 403 或 404 + safe:true
- **unauthorized**: 所有端点 401

关键安全特性：
- 所有越权访问返回 404 + `safe: true`，不泄露对象存在性
- Interviewer 7 项操作全部 403，无越权风险
- Interviewer 无法访问 Offer/closing 阶段转写
- 无 PII 泄露
- 无 secret/API Key 泄露
