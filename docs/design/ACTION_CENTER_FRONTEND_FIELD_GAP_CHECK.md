# Action Center Frontend Field Gap Check

> Phase 7.4A UI 实现前的字段缺口检查
> 对照 API 当前返回 vs UI Data Contract 要求

---

## Gap Summary

| 区域 | 状态 | 缺口数 |
|------|------|--------|
| KPI Cards | ⚠️ P1 | 2 (urgentCount, generatedByRuleCount/manualCount) |
| Filters | ✅ | 0 |
| Action List | ✅ | 0 |
| Action Detail Drawer | ⚠️ P1 | 3 (activity, resolution.detail, linkedContext richness) |
| Create Action Modal | ✅ | 0 |
| Resolve Action Modal | ✅ | 0 |
| Dismiss Action Modal | ✅ | 0 |
| Job Detail Actions Tab | ✅ | 0 |
| Candidate Detail Actions Tab | ✅ | 0 |
| Dashboard Action Summary | ⚠️ P1 | 2 (topOverdueActions, resolvedTodayCount) |
| Empty State | ✅ | 0 |
| Error State | ✅ | 0 |
| Loading State | ✅ | 0 |
| Permission State | ✅ | 0 |

---

## Detailed Gap Analysis

### 1. KPI Cards

| 需要字段 | API 是否返回 | 缺失 | 阻塞级别 | 处理建议 |
|---------|-------------|------|---------|---------|
| openCount | ✅ getActionMetrics | — | — | — |
| overdueCount | ✅ getActionMetrics | — | — | — |
| highPriorityCount | ✅ getActionMetrics | — | — | — |
| urgentCount | ❌ | urgentCount | P1 | 从 metrics 中拆出 urgent priority count，或前端从 actions 列表中 filter |
| dueTodayCount | ✅ getActionMetrics | — | — | — |
| avgResolutionHours | ✅ getActionMetrics | — | — | — |
| onTimeResolutionRate | ✅ getActionMetrics | — | — | — |
| generatedByRuleCount | ❌ | generatedByRuleCount | P2 | 前端可从 actions 列表 filter sourceType != "manual"，或后端补 |
| manualCount | ❌ | manualCount | P2 | 同上 |

**建议**：P1 的 urgentCount 前端可直接从 action list 中 filter priority=urgent 计数（列表已含所有 open actions）。P2 项不影响 7.4A。

### 2. Action List

| 需要字段 | API 是否返回 | 缺失 | 阻塞级别 | 处理建议 |
|---------|-------------|------|---------|---------|
| id | ✅ | — | — | — |
| title | ✅ | — | — | — |
| category | ✅ | — | — | — |
| priority | ✅ | — | — | — |
| status | ✅ | — | — | — |
| owner.name | ✅ (include) | — | — | — |
| job.title | ✅ (include) | — | — | — |
| candidate.name | ✅ (include) | — | — | — |
| sourceType | ✅ | — | — | — |
| dueAt | ✅ | — | — | — |
| isOverdue | ❌ | isOverdue | P2 | 前端计算：dueAt < now && status in [open,in_progress,blocked] |
| createdAt | ✅ | — | — | — |
| display labels | ❌ | categoryLabel/priorityLabel/statusLabel | P2 | 前端 enum map 即可 |

**结论**：核心字段齐全。display labels 前端 map 即可。**不阻塞 7.4A**。

### 3. Action Detail Drawer

| 需要字段 | API 是否返回 | 缺失 | 阻塞级别 | 处理建议 |
|---------|-------------|------|---------|---------|
| id/title/description | ✅ | — | — | — |
| category/priority/status | ✅ | — | — | — |
| owner/createdBy | ✅ (include) | — | — | — |
| linkedContext (job/candidate/application/interview) | ✅ (include) | — | — | — |
| source (type/refId/summary) | ✅ | — | — | — |
| dueAt/isOverdue | ✅ | — | — | — |
| resolution/dismissal | ✅ | — | — | — |
| activity[] | ❌ | activity | P1 | Action 的 ActivityLog 在独立表中，detail API 未 include。7.4A 可先展示 createdAt/updatedAt/resolvedAt 作为简化时间线，activity tab 放 7.4B |
| linkedContext richness (dept/owner names) | ⚠️ 部分 | job.departmentName, job.ownerName | P2 | 当前 include 只含 job.title/jobCode。可扩展 select |

**结论**：核心字段齐全。activity tab 和 linkedContext 扩展不阻塞 7.4A。

### 4. Create/Resolve/Dismiss Modal

| 需要字段 | API 是否返回 | 缺失 | 阻塞级别 |
|---------|-------------|------|---------|
| CreateActionForm 所有字段 | ✅ API POST body | — | — |
| ResolveActionForm | ✅ POST body | — | — |
| DismissActionForm | ✅ POST body | — | — |

**结论**：✅ 无缺口。

### 5. Job/Candidate Detail Actions Tab

| 需要字段 | API 是否返回 | 缺失 | 阻塞级别 |
|---------|-------------|------|---------|
| actions[] (scoped) | ✅ GET /api/jobs/:id/actions | — | — |
| actions[] (scoped) | ✅ GET /api/candidates/:id/actions | — | — |

**结论**：✅ 无缺口。

### 6. Dashboard Action Summary

| 需要字段 | API 是否返回 | 缺失 | 阻塞级别 | 处理建议 |
|---------|-------------|------|---------|---------|
| metrics | ✅ getActionMetrics | — | — | — |
| topOverdueActions | ❌ | topOverdueActions | P1 | 7.4A 可先展示 metrics KPI，topOverdue 放 7.5 |
| highPriorityActions | ❌ | highPriorityActions | P2 | 前端从 /api/actions?priority=high&overdueOnly=true 获取 |
| resolvedTodayCount | ❌ | resolvedTodayCount | P2 | 前端从 metrics 中无法获取，需后端补 |

**结论**：Dashboard summary 基础 KPI 可用。topOverdue/highPriority/resolvedToday 不阻塞 7.4A。

---

## Blocking Summary

| 阻塞级别 | 数量 | 影响 |
|---------|------|------|
| P0 (阻塞 7.4A) | 0 | — |
| P1 (7.4B 前补) | 4 | urgentCount, activity, topOverdueActions, resolvedTodayCount |
| P2 (后续优化) | 5 | generatedByRuleCount, manualCount, isOverdue, display labels, linkedContext richness |

**结论：Phase 7.4A 不阻塞。所有 P0 缺口为 0。**
