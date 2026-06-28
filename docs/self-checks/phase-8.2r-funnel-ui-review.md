# Phase 8.2R Recruitment Funnel — UI 自检

**项目**: Recruitment Dashboard v3  
**阶段**: Phase 8.2R  
**日期**: 2026-06-28  
**页面**: `/analytics/recruitment-funnel`  
**自检目标**: 证明图表不是装饰性图表，所有数据来自真实 DB 聚合  

---

## 1. 漏斗图 — 真实计数与转化率

### 证据

| 检查项 | 状态 | 证据 |
|--------|------|------|
| 显示 10 个阶段 | ✅ | `FUNNEL_STAGES` 定义 10 个阶段 (sourced → closed) |
| 每阶段显示 count | ✅ | `computeStageCounts()` 累积计数，如 sourced: 156, applied: 128 |
| 每阶段显示转化率 | ✅ | `safeRate(count, prevCount)` → fmtRate 显示 "75%" |
| 每阶段显示掉落率 | ✅ | `safeRate(prevCount - count, prevCount)` → 红色 "↓25%" |
| 掉落人数显示 | ✅ | 阶段间虚线 + "掉落 N 人" |
| 色阶区分 | ✅ | 前 4 阶段蓝色(primary)，中 3 阶段橙色(warning)，后 3 阶段红色(danger) |
| 不是装饰图 | ✅ | 数据源: `application` 表 `stage` 字段 + 累积计数逻辑 |

**代码**: `app/analytics/recruitment-funnel/page.tsx:300-356`  
**截图**: `funnel-main-chart-closeup.png`

---

## 2. KPI 卡片 — 真实数据

### 证据

| KPI | 数据源 | 格式化 | 趋势指示 |
|-----|--------|--------|----------|
| 投递量 | `summary.applications` | 直接显示数字 | 无趋势 |
| 简历通过率 | `summary.resumePassRate` | fmtRate → "XX%" | ≥ 60% ↑ / < 60% ↓ |
| 面试转化率 | `stages[].conversionRate` (interview_completed) | fmtRate → "XX%" | 无趋势 |
| Offer 风险率 | `summary.offerRiskRate` | fmtRate → "XX%" | ↓ (低为优) |
| 逾期 Action 率 | `summary.overdueActionRate` | fmtRate → "XX%" | > 30% ↑ / ≤ 30% ↓ |
| 已关闭 | `summary.closedCount` | 直接显示数字 | 无趋势 |

**代码**: `page.tsx:234-243`  
**截图**: `funnel-kpi-summary.png`

---

## 3. 岗位对比表 — 真实数字与格式

### 证据

| 列 | 数据源 | 格式化 | 条件高亮 |
|----|--------|--------|----------|
| 岗位 | `job.jobTitle` | 文本，截断(max-w-120px) | 无 |
| 投递 | `entry.applications` | 数字 | 无 |
| 简历通过 | `entry.screenPassRate` | fmtRate → "XX%" | 无 |
| 面试通过 | `entry.interviewPassRate` | fmtRate → "XX%" | 无 |
| Offer 风险 | `entry.offerRiskRate` | fmtRate → "XX%" | > 30% 红色 |
| 已关闭 | `entry.closed` | 数字 | 无 |

**代码**: `page.tsx:423-437`  
**截图**: `funnel-job-comparison-table.png`

---

## 4. 渠道质量表 — 真实数字与质量分级

### 证据

| 列 | 数据源 | 格式化 | 条件分级 |
|----|--------|--------|----------|
| 渠道 | `entry.channel` | 文本 | 无 |
| 投递 | `entry.applications` | 数字 | 无 |
| 简历通过 | `entry.screenPassRate` | fmtRate → "XX%" | 无 |
| 面试通过 | `entry.interviewPassRate` | fmtRate → "XX%" | 无 |
| 质量 | 基于 interviewPassRate | StatusBadge | ≥ 50% "高"(success) / ≥ 25% "中"(warning) / < 25% "低"(default) / null "---" |

**代码**: `page.tsx:466-477`  
**截图**: `funnel-channel-quality-table.png`

---

## 5. Action 影响分析 — 真实统计

### 证据

| 统计项 | 数据源 | 显示 |
|--------|--------|------|
| 待处理 | `actionImpact.open` | 蓝色数字 |
| 已逾期 | `actionImpact.overdue` | 红色数字 + 红色背景 |
| 已关闭 | `actionImpact.resolved` | 绿色数字 + 绿色背景 |
| 关闭率 | `actionImpact.closureRate` | fmtRate → "XX%" |
| 逾期列表 | `actionImpact.overdueList` (top 10) | 每条显示 title、dueAt、jobTitle、priority badge |

**代码**: `page.tsx:489-528`  
**截图**: `funnel-action-impact-card.png`

---

## 6. 系统洞察 — 真实触发条件与证据

### 证据

| 检查项 | 状态 | 说明 |
|--------|------|------|
| generatedBy = "system_rule" | ✅ | StatusBadge 显示 "system_rule · N条" |
| 有 triggerCondition | ✅ | 如 "简历评估到通过掉落率 60% > 40%" |
| 有 evidence | ✅ | 如 "50 份简历已评估，仅 20 份通过，掉落率 60%" |
| 有 suggestedAction | ✅ | 如 "建议检查简历筛选标准是否过严" |
| 可展开/收起 | ✅ | 点击 insight 卡片切换 expandedInsight 状态 |
| severity 色阶 | ✅ | critical=红色 border, warning=橙色, info=蓝色 |

**代码**: `page.tsx:359-397`  
**截图**: `funnel-bottleneck-insights.png`

---

## 7. 数据质量警告 — 可见且准确

### 证据

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 条件渲染 | ✅ | 仅当 `dataQualityWarnings.length > 0` 时显示 |
| 警告分类 | ✅ | severity=warning → ⚠️, severity=info → ℹ️ |
| 内容来自后端 | ✅ | `funnel-data-quality-service.ts` 生成 |
| 不误导 | ✅ | 仅描述数据缺失，不推断 |

**代码**: `page.tsx:286-297`  
**截图**: `funnel-data-quality-warning.png`

---

## 8. Null 值显示 "---" 

### 证据

| 格式化函数 | null 输入 | undefined 输入 | 输出 |
|-----------|-----------|----------------|------|
| fmtRate | null | undefined | "---" |
| fmtNum | null | undefined | "---" |
| fmtDays | null | undefined | "---" |
| fmtDays | 0 | — | "<1天" |

**代码**: `page.tsx:102-116`

---

## 9. 无 NaN / Infinity / undefined 暴露

### 证据

| 检查项 | 方法 | 结果 |
|--------|------|------|
| 后端 NaN 防护 | `safeRate` / `safeAvg` → null on invalid | ✅ |
| 前端 null 处理 | fmtRate / fmtNum / fmtDays → "---" | ✅ |
| commands.log grep | `grep -R "NaN\|Infinity\|Invalid Date\|undefined" app components` | 仅 TS 类型注解 |
| 运行时 textContent | 页面渲染无 NaN/Infinity/undefined/Invalid Date | ✅ |

---

## 10. 页面状态完整

### 证据

| 状态 | 触发条件 | UI 组件 | 截图 |
|------|----------|---------|------|
| Loading | `loading && !data` | LoadingSkeleton | — |
| Empty | `!data \|\| data.stages.length === 0` | EmptyState + "暂无漏斗数据" | `funnel-page-empty.png` |
| Error | `error && !data` | ErrorState + "加载失败" + 重试按钮 | `funnel-page-error.png` |
| Permission Denied | HTTP 403 | EmptyState + "暂无权限" | `funnel-page-permission-denied.png` |
| Success | data 存在 | 完整漏斗页面 | `funnel-page-success.png` |
| Partial | dataQualityWarnings 非空 | 数据质量提示区域 | `funnel-no-data-partial-state.png` |

**代码**: `page.tsx:183-222`

---

## 11. 筛选功能

### 证据

| 筛选器 | 类型 | 参数 | 行为 |
|--------|------|------|------|
| 开始日期 | `<input type="date">` | dateFrom | fetchData() 重新请求 |
| 结束日期 | `<input type="date">` | dateTo | fetchData() 重新请求 |
| 岗位 | `<select>` (动态填充) | jobId | 按岗位过滤 |
| 渠道 | `<select>` (动态填充) | channel | 按渠道过滤 |
| 筛选按钮 | `<button>` | — | 触发 fetchData() |

**代码**: `page.tsx:245-281`

---

## UI 自检总结

| # | 检查项 | 判决 |
|---|--------|------|
| 1 | 漏斗图显示真实 counts、转化率、掉落率 | PASS |
| 2 | KPI 卡片显示真实数据 | PASS |
| 3 | 岗位对比表显示真实数字与格式 | PASS |
| 4 | 渠道质量表显示真实数字与分级 | PASS |
| 5 | Action 影响分析显示真实统计 | PASS |
| 6 | 系统洞察有 triggerCondition/evidence/suggestedAction | PASS |
| 7 | 数据质量警告可见 | PASS |
| 8 | 所有 null 值显示 "---" | PASS |
| 9 | 无 NaN / Infinity / undefined 暴露 | PASS |
| 10 | 页面状态完整 (Loading/Empty/Error/Permission/Success/Partial) | PASS |
| 11 | 筛选功能正常 | PASS |

**全部 UI 自检 PASS。图表不是装饰性图表，所有数据来自真实 DB 聚合。**
