# CLAUDE Phase 8.2R Funnel UX Review Input

**项目**: Recruitment Dashboard v3  
**阶段**: Phase 8.2R — Recruitment Funnel & Conversion Analytics  
**页面**: `/analytics/recruitment-funnel`  
**日期**: 2026-06-28  
**用途**: 提供给 Claude 的 UX Review 输入，描述页面结构、可视化方法、KPI 布局、洞察系统和筛选行为。

---

## 1. 页面概览

### 1.1 路由与命名
- **路由**: `/analytics/recruitment-funnel`
- **页面名称**: 招聘漏斗
- **副标题**: 从全局、岗位、渠道和阶段视角分析招聘转化、卡点和行动闭环效果
- **代码位置**: `app/analytics/recruitment-funnel/page.tsx`

### 1.2 页面定位
招聘漏斗是管理层经营视角的核心模块。不是传统 BI 大屏，而是专业 SaaS 分析页面：少图、准图、能 drilldown、能解释、能跳 Action。

### 1.3 目标用户与核心价值

| 角色 | 核心价值 |
|------|----------|
| HR / Recruiter | 知道今天应该处理哪个阶段卡点；找到需要催面评、补简历、调整渠道、重启画像的岗位 |
| 业务负责人 | 看到自己负责岗位的候选人推进效率、面评响应效率、面试通过率和业务反馈延迟 |
| HRBP / 管理层 | 看到全局招聘健康度、渠道投入质量、岗位风险、流程瓶颈和 Action 闭环效果 |
| CEO | 一眼看懂招聘系统是否帮助组织提高"人效决策" |

### 1.4 30 秒判断标准
用户能否在 30 秒内回答：
- 当前最卡的岗位是什么？
- 最差的阶段是什么？
- 最该处理的 Action 是什么？
- 最需要调整的渠道是什么？

---

## 2. 页面结构 (首屏从上到下)

### 2.1 Page Header (ProductShell)
- 标题: "招聘漏斗"
- 副标题: "从全局、岗位、渠道和阶段视角分析招聘转化、卡点和行动闭环效果"
- 更新时间: 显示 `generatedAt` 格式化时间

### 2.2 KPI Summary Cards (6 格)
布局: `grid grid-cols-2 lg:grid-cols-6 gap-3`

| 位置 | KPI | 组件 | 趋势指示 |
|------|-----|------|----------|
| 1 | 投递量 | KpiCard | 无 |
| 2 | 简历通过率 | KpiCard | ≥ 60% ↑ / < 60% ↓ |
| 3 | 面试转化率 | KpiCard | 无 |
| 4 | Offer 风险率 | KpiCard | ↓ (低为优) |
| 5 | 逾期 Action 率 | KpiCard | > 30% ↑ / ≤ 30% ↓ |
| 6 | 已关闭 | KpiCard | 无 |

### 2.3 Filter Bar
布局: `flex flex-wrap items-end gap-3`

| 筛选器 | 类型 | 数据源 |
|--------|------|--------|
| 开始日期 | `<input type="date">` | 用户输入 |
| 结束日期 | `<input type="date">` | 用户输入 |
| 岗位 | `<select>` 动态填充 | byJob 数组 |
| 渠道 | `<select>` 动态填充 | byChannel 数组 |
| 筛选按钮 | `<button>` | 触发 fetchData() |

### 2.4 Data Quality Warnings (条件渲染)
- 触发条件: `dataQualityWarnings.length > 0`
- 样式: 黄色边框圆角卡片，`border-[var(--color-warning-light)]`
- 内容: 每条 warning 显示 ⚠️/ℹ️ + message

### 2.5 Main Funnel Chart
- **类型**: 水平条形漏斗图（非 SVG 库，CSS bar 实现）
- **阶段数**: 10 个阶段 (sourced → closed)
- **每阶段显示**:
  - 标签 (左侧 28px 宽度)
  - 色阶条形 (宽度 = count/maxCount * 100%)
  - 计数 (白色粗体数字在条形内)
  - 转化率 (右侧 "转化 XX%")
  - 掉落率 (右侧红色 "↓XX%"，仅 > 0 时显示)
- **掉落可视化**: 阶段间虚线 + "掉落 N 人"
- **色阶**: 前 4 阶段蓝色 (primary)，中 3 阶段橙色 (warning)，后 3 阶段红色 (danger)

### 2.6 System Insights (Bottleneck Analysis)
- **标题**: "系统洞察与卡点分析"
- **来源标记**: `StatusBadge label="system_rule · N条" variant="info"`
- **洞察卡片**: 每条为可展开/收起的卡片
  - 左侧色条 (critical=红色, warning=橙色, info=蓝色)
  - severity badge (严重/警告/提示)
  - insightKey 标题
  - triggerCondition 描述
  - 展开后显示: evidence (证据) + suggestedAction (建议动作)

### 2.7 Job Comparison Table
- **标题**: "岗位对比"
- **展开/收起**: toggle 按钮
- **表格列**: 岗位、投递、简历通过、面试通过、Offer 风险 (> 30% 红色)、已关闭
- **数据源**: `byJob` 数组

### 2.8 Channel Quality Table
- **标题**: "渠道质量"
- **展开/收起**: toggle 按钮
- **表格列**: 渠道、投递、简历通过、面试通过、质量 (高/中/低/---)
- **质量分级**: ≥ 50% "高"(success), ≥ 25% "中"(warning), < 25% "低"(default), null "---"

### 2.9 Action Impact Analysis
- **标题**: "Action 影响分析"
- **统计卡片 (4 格)**: 待处理、已逾期 (红色)、已关闭 (绿色)、关闭率
- **逾期列表**: 可展开，显示 title、dueAt、jobTitle、priority badge

### 2.10 AI Copilot Hint
- **样式**: 虚线边框，🤖 图标
- **标题**: "AI Copilot 可解释漏斗卡点"
- **说明**: 必须基于有权限的 funnel evidence / Knowledge citation，没有证据时提示证据不足

---

## 3. 漏斗可视化方法

### 3.1 实现方式
不使用 ECharts/Recharts 等重型图表库。使用纯 CSS bar 实现水平条形漏斗：
- 每阶段一个 `<div>` 条形
- 宽度通过 `(stage.count / maxStageCount) * 100` 计算
- 色阶通过 inline style `backgroundColor` 设置

### 3.2 为什么不用图表库
- 避免引入额外依赖
- 漏斗图本质是简单的水平条形图，CSS 实现足够
- 保持与项目现有设计系统一致

### 3.3 数据流
```
DB (PostgreSQL via Prisma)
  → Repository (scope-filtered queries)
    → Service (computeStageCounts/computeStageMetrics)
      → API (JSON response)
        → Frontend (React state → CSS bar rendering)
```

---

## 4. KPI 布局设计

### 4.1 布局原则
- 6 格响应式布局: 移动端 2 列，大屏 6 列
- 每个 KpiCard 包含: label + value + trendDirection (可选)
- 趋势指示: up (绿色↑) / down (红色↓) / neutral (无箭头)

### 4.2 数据格式化
- 数字: 直接显示 (如 128)
- 比率: fmtRate() → "XX%" (如 "75%")
- 空值: "---"

---

## 5. 系统洞察系统

### 5.1 洞察来源
所有洞察由 `funnel-insight-rule-service.ts` 生成，`generatedBy = "system_rule"`，不使用 LLM。

### 5.2 7 条规则

| insightKey | 触发条件 | severity |
|-----------|----------|----------|
| resume_dropoff_high | 简历评估到通过掉落率 > 40% | warning |
| interview_no_show_high | 面试到场率 < 80% | warning |
| feedback_submit_delay | 面试完成后 > 48h 面评未提交 | warning |
| stage_duration_overdue | 阶段平均停留 > 7 天 | warning |
| channel_quality_low | 渠道投递 ≥ 5 但面试通过 < 20% | warning |
| offer_risk_concentrated | 岗位 Offer 风险率 > 30% | critical |
| action_overdue_affects_funnel | 逾期 Action 集中在卡点阶段 | warning |

### 5.3 洞察数据结构
```typescript
interface FunnelInsight {
  insightKey: string;
  generatedBy: "system_rule";
  severity: "info" | "warning" | "critical";
  triggerCondition: string;
  evidence: string;
  suggestedAction: string;
  metadata?: Record<string, unknown>;
}
```

---

## 6. 筛选行为

### 6.1 筛选参数
所有筛选参数通过 URL query string 传递：
- `dateFrom`: ISO 日期字符串
- `dateTo`: ISO 日期字符串
- `jobId`: 岗位 ID
- `channel`: 渠道名称

### 6.2 筛选流程
1. 用户修改筛选器值 (受控组件 setState)
2. 点击 "筛选" 按钮
3. `fetchData()` 构建 URLSearchParams
4. `fetch(/api/analytics/recruitment-funnel/summary?...)`
5. 更新 data state → 重新渲染所有组件

### 6.3 筛选联动
- 岗位下拉选项来自 `byJob` 数据 (上次 API 返回)
- 渠道下拉选项来自 `byChannel` 数据 (上次 API 返回)
- 筛选后所有区块 (KPI、漏斗、岗位对比、渠道质量、Action、洞察) 同步更新

---

## 7. 页面状态

### 7.1 状态机
```
Loading (LoadingSkeleton)
  → Success (完整页面)
  → Empty (EmptyState + "暂无漏斗数据")
  → Error (ErrorState + 重试按钮)
  → Permission Denied (EmptyState + "暂无权限")

Partial (Success 子状态):
  → dataQualityWarnings 非空时显示警告区域
```

### 7.2 权限处理
- `permissionDenied` 状态通过 HTTP 403 响应触发
- 在 fetchData 中检查 `r.status === 403` → setPermissionDenied(true)
- 显示 EmptyState 而非 ErrorState，避免误导

---

## 8. 设计系统集成

### 8.1 使用的组件
- `ProductShell`: 页面外壳 (title, description, kpiRow, filterBar, children)
- `KpiCard`: KPI 卡片 (label, value, trendDirection)
- `StatusBadge`: 状态标签 (label, variant)
- `EmptyState`: 空状态
- `ErrorState`: 错误状态 + 重试
- `LoadingSkeleton`: 加载骨架屏

### 8.2 颜色变量
- `--color-primary`: 蓝色 (前 4 阶段)
- `--color-warning`: 橙色 (中 3 阶段 + 警告)
- `--color-danger`: 红色 (后 3 阶段 + 严重)
- `--color-success`: 绿色 (已关闭)
- `--color-border`: 边框色
- `--color-surface`: 卡片背景
- `--color-text-primary/secondary/tertiary`: 文字层级

---

## 9. 待 UX Review 的关键问题

1. **30 秒判断标准**: 用户能否在 30 秒内找到最卡的岗位/阶段/Action/渠道？
2. **漏斗可读性**: 10 阶段漏斗在移动端是否可读？是否需要折叠非关键阶段？
3. **KPI 卡片信息密度**: 6 格 KPI 是否足够？是否需要增加 "平均阶段停留" 等关键指标？
4. **洞察展开体验**: 点击展开 insight 的交互是否直观？是否需要默认展开 severity=critical 的洞察？
5. **筛选器布局**: 4 个筛选器 + 按钮在移动端是否溢出？是否需要折叠到 filter drawer？
6. **渠道质量分级**: "高/中/低" 三级是否足够？是否需要更细粒度的质量分？
7. **AI Copilot 位置**: 底部虚线框是否足够显眼？是否需要移到侧边栏或浮动按钮？
8. **Drilldown 交互**: 目前 drilldown 通过独立 API 获取，UI 中如何触发（点击阶段/岗位/渠道行）？

---

**文件路径**: `docs/design/CLAUDE_PHASE_8_2R_FUNNEL_REVIEW_INPUT.md`
