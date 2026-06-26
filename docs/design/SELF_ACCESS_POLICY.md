# Self Access Policy — reviewerId / createdBy 自访问策略

> 版本：v1.0
> 生效日期：2025-06-26
> 适用范围：BusinessFeedback、ProfileCalibration
> 关联 Phase：Phase 5.2.3 (Final Hotfix)

---

## 1. 概述

BusinessFeedback 的 `reviewerId` 和 ProfileCalibration 的 `createdBy` 提供**自访问路径**：用户可以通过自己提交/创建的身份访问相关资源，即使该资源不属于其 scope 范围内的岗位。

这是有意的设计决策，不是安全漏洞。本策略定义了自访问的边界和限制。

---

## 2. BusinessFeedback — reviewerId 自访问

### 2.1 适用资源

| 资源 | 是否适用 |
|------|---------|
| GET /api/business-feedback/:id | ✅ 适用 |
| GET /api/business-feedback (list) | ✅ 适用 |
| 岗位反馈 summary (GET /api/jobs/:id/feedback-summary) | ❌ 不适用 |

### 2.2 自访问条件

用户通过 `reviewerId` 自访问需满足：
- `scope.scope === "OWNED"` 或 `scope.scope === "RELATED"`
- `scope.userId` 匹配 `businessFeedback.reviewerId`

### 2.3 自访问返回范围

| 返回内容 | 是否返回 |
|---------|---------|
| feedback 自身（decision/reasonCode/reasonText/evidence） | ✅ 完整返回 |
| job 摘要（id/title/jobCode/department） | ✅ 最小摘要 |
| reviewer 信息（id/name） | ✅ |
| 其他 feedback（同岗位其他人的反馈） | ❌ 不返回 |
| 岗位反馈 summary 聚合数据 | ❌ 不返回 |
| candidate 详情 | ❌ 不返回 |
| application 详情 | ❌ 不返回 |

### 2.4 自访问不能扩展到

- 其他岗位的 business owner 权限
- 其他 feedback 的查看权限
- 岗位级别的反馈统计/聚合权限
- 候选人/投递详情的访问权限

### 2.5 历史 reviewerId 处理

如果用户不再具备该岗位的 scope（例如已调岗），仍然可以通过 `reviewerId` 访问自己历史提交的 feedback。但：
- 只返回 feedback 自身 + 最小 job 摘要
- 不返回岗位的完整信息
- 不返回其他 feedback

---

## 3. ProfileCalibration — createdBy 自访问

### 3.1 适用资源

| 资源 | 是否适用 |
|------|---------|
| GET /api/profile-calibrations/:id | ✅ 适用 |
| GET /api/jobs/:id/profile-calibrations (list) | ✅ 适用 |
| PATCH /api/profile-calibrations/:id (confirm) | ⚠️ 需额外 job scope |

### 3.2 自访问条件

用户通过 `createdBy` 自访问需满足：
- `scope.scope === "OWNED"` 或 `scope.scope === "RELATED"`
- `scope.userId` 匹配 `profileCalibration.createdBy`

### 3.3 自访问返回范围

| 返回内容 | 是否返回 |
|---------|---------|
| calibration 基础记录（id/jobId/status/calibrationReason/createdAt） | ✅ |
| job 摘要（id/title） | ✅ |
| sourceFeedbackIds | ⚠️ 仅当用户具备 job scope 时返回 |
| beforeSnapshot | ⚠️ 仅当用户具备 job scope 时返回 |
| afterSnapshot | ⚠️ 仅当用户具备 job scope 时返回 |
| confirmedBy/confirmedAt | ✅ |

### 3.4 自访问不能扩展到

- 其他岗位的 business owner 权限
- confirm 操作权限（confirm 必须同时具备 job scope）
- 候选人/投递详情的访问权限

### 3.5 confirm 操作的额外要求

即使 `createdBy` 匹配，confirm 操作（PATCH /api/profile-calibrations/:id）**必须同时满足**：
- `requireCalibrationOwnership` 检查通过
- `scope.scope` 允许 update 操作
- 不能仅凭 `createdBy` 执行 confirm

### 3.6 历史 createdBy 处理

如果用户不再具备该岗位的 scope（例如已调岗），仍然可以通过 `createdBy` 访问自己历史创建的 calibration 基础记录。但：
- `beforeSnapshot` / `afterSnapshot` / `sourceFeedbackIds` 需要脱敏或不返回
- confirm 操作必须拒绝（403/404）

---

## 4. 与 businessOwnerId / ownerId 的关系

### 4.1 reviewerId / createdBy 不是 scope 扩展

`reviewerId` 和 `createdBy` 是**独立的获权路径**，不修改、不扩展、不替代 `businessOwnerId` 或 `ownerId` 的 scope。

### 4.2 证明

- business_owner 通过 `businessOwnerId` 获权看到候选人 A 的 1 条 application（KA大客户销售）
- business_owner 通过 `reviewerId` 可以看到自己在"媒介投放"岗位提交的 feedback
- 但 business_owner **不能**通过 `reviewerId` 看到"媒介投放"岗位的其他候选人或投递记录

`reviewerId` / `createdBy` 只影响 BusinessFeedback 和 ProfileCalibration 两个资源，不影响 Candidate/Application/Job 的 scope。

### 4.3 代码位置

| 资源 | 文件 | 行号 | OR 模式 |
|------|------|------|---------|
| BusinessFeedback list | business-feedback-repository.ts | 39,48 | `{ reviewerId: scope.userId }` |
| BusinessFeedback detail | business-feedback-repository.ts | 80,83 | `{ reviewerId: scope.userId }` |
| ProfileCalibration list | profile-calibration-repository.ts | 27,29 | `{ createdBy: scope.userId }` |
| ProfileCalibration detail | profile-calibration-repository.ts | 52,54 | `{ createdBy: scope.userId }` |
| ProfileCalibration confirm | profile-calibration-repository.ts | 99,102 | `{ createdBy: scope.userId }` |

---

## 5. 未来改进

- 当前 `sourceFeedbackIds`/`beforeSnapshot`/`afterSnapshot` 在 `createdBy` 自访问时未脱敏。建议在 Phase 12 中增加条件返回逻辑。
- 当前 `reviewerId`/`createdBy` 自访问在 repository 层通过 OR 模式实现。如果后续复杂度增加，建议提取为独立的 `buildSelfAccessWhere` 函数。
