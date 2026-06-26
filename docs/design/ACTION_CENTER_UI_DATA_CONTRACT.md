# Action Center UI Data Contract

> Phase 7.4 UI 实现前必须对齐的数据契约
> Claude UX Spec 到达后以 Claude + 外部 Review 口径为准

---

## 1. ActionListItem（列表行展示字段）

| 字段 | 类型 | 来源 | 说明 |
|------|------|------|------|
| id | string | DB | Action ID |
| title | string | DB | 标题 |
| category | string | DB | 分类枚举 |
| priority | string | DB | 优先级枚举 |
| status | string | DB | 状态枚举 |
| owner.name | string | DB relation | 负责人姓名 |
| owner.id | string | DB relation | 负责人 ID |
| job.title | string? | DB relation | 关联岗位名称 |
| candidate.name | string? | DB relation | 关联候选人姓名 |
| sourceType | string | DB | 来源类型枚举 |
| sourceSummary | string? | DB | 来源摘要 |
| dueAt | ISO string? | DB | 截止时间 |
| isOverdue | boolean | 前端计算 | dueAt < now && status in [open,in_progress,blocked] |
| createdAt | ISO string | DB | 创建时间 |
| updatedAt | ISO string | DB | 更新时间 |

---

## 2. ActionDetail（Drawer 详情字段）

| 字段 | 类型 | 来源 | 说明 |
|------|------|------|------|
| id | string | DB | |
| title | string | DB | |
| description | string? | DB | 详细描述 |
| category | string | DB | |
| priority | string | DB | |
| status | string | DB | |
| owner | {id,name} | DB relation | |
| createdBy | {id,name} | DB relation | |
| job | {id,title,jobCode}? | DB relation | |
| candidate | {id,name}? | DB relation | |
| application | {id,stage,candidate,job}? | DB relation | |
| interview | {id,round,interviewer}? | DB relation | |
| sourceType | string | DB | |
| sourceRefId | string? | DB | |
| sourceSummary | string? | DB | |
| dueAt | ISO string? | DB | |
| resolvedAt | ISO string? | DB | |
| resolvedBy | {id,name}? | DB | 从 resolvedById 推导 |
| resolutionNote | string? | DB | |
| dismissedReason | string? | DB | |
| createdAt | ISO string | DB | |
| updatedAt | ISO string | DB | |

---

## 3. ActionMetrics（KPI 卡片字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| openCount | number | 待处理数（open + in_progress + blocked） |
| overdueCount | number | 逾期数 |
| highPriorityCount | number | 高优先级数（high + urgent） |
| dueTodayCount | number | 今日到期数 |
| avgResolutionHours | number | 平均关闭时长（小时） |
| onTimeResolutionRate | number | 按时关闭率（%） |

---

## 4. ActionLinkedContext（Drawer 关联上下文 Tab）

| 字段 | 类型 | 说明 |
|------|------|------|
| job | {id,title,jobCode}? | 关联岗位 |
| candidate | {id,name}? | 关联候选人 |
| application | {id,stage,candidate,job}? | 关联投递 |
| interview | {id,round,interviewer}? | 关联面试 |
| sourceType | string | 来源类型 |
| sourceSummary | string? | 来源摘要 |

---

## 5. ActionActivity（Drawer 活动 Tab）

| 字段 | 类型 | 说明 |
|------|------|------|
| action | string | ACTION_CREATED / ACTION_RESOLVED / ACTION_DISMISSED |
| actorId | string | 操作人 |
| createdAt | ISO string | 操作时间 |
| detail | object | 包含 category/priority/ownerId/jobId 等 |

---

## 6. CreateActionForm（创建 Action Modal）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | |
| description | string | 否 | |
| category | enum | 是 | 9 种分类 |
| priority | enum | 是 | low/medium/high/urgent |
| ownerId | string | 否 | 负责人 user ID |
| jobId | string | 否 | 关联岗位 |
| candidateId | string | 否 | 关联候选人 |
| applicationId | string | 否 | 关联投递 |
| interviewId | string | 否 | 关联面试 |
| sourceType | enum | 是 | 默认 "manual" |
| dueAt | datetime | 否 | 截止时间 |

---

## 7. ResolveActionForm（关闭 Action Modal）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| resolutionNote | string | 是 | 关闭说明 |

---

## 8. DismissActionForm（忽略 Action Modal）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dismissedReason | string | 是 | 忽略原因 |

---

## 9. DashboardActionSummary（Dashboard 集成）

| 字段 | 类型 | 说明 |
|------|------|------|
| openCount | number | 待处理 |
| overdueCount | number | 逾期 |
| highPriorityCount | number | 高优先级 |

---

## 10. JobActionsTab（岗位详情集成）

| 字段 | 类型 | 说明 |
|------|------|------|
| actions[] | ActionListItem[] | 该岗位未关闭 Action（最多 20 条） |
| 排序 | | 优先级 desc → dueAt asc → createdAt desc |

---

## 11. CandidateActionsTab（候选人详情集成）

| 字段 | 类型 | 说明 |
|------|------|------|
| actions[] | ActionListItem[] | 该候选人相关 Action（最多 20 条） |
