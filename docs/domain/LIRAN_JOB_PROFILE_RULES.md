# 理然岗位画像规则

> 基于理然 JD 库 + 招聘项目分析模型 v3.2 + 岗位 SOP 提取。
> 用于 Phase 3 岗位管理与 JD/画像体系。

## 岗位画像核心字段

| 字段 | 说明 | 来源 |
|------|------|------|
| 岗位名称 | 理然标准岗位名称 | JD库 |
| 一级部门 | 归属部门 | JD库 |
| 职级 | A/S/G/M/P 体系 | JD库 |
| 岗位职责 | 7-8 条结构化职责 | JD库【岗位职责】 |
| 任职要求 | 学历/经验/技能硬性要求 | JD库【任职要求】 |
| 加分项 | 差异化竞争优势 | JD库【加分项】 |
| 薪资区间 | 预算范围 | 业务规则 |
| 招聘负责人 | Owner | 岗位 SOP |
| 业务负责人 | Business Owner | 岗位 SOP |
| 画像摘要 | profileSummary | 从 JD 提取 |
| mustHave | 硬性筛选条件（Json） | JD 任职要求 |
| niceToHave | 加分条件（Json） | JD 加分项 |
| 招聘优先级 | high/normal/low | 岗位 SOP |

## Phase 3 建议扩展字段

| 字段 | 类型 | 说明 |
|------|------|------|
| jobCode | String | 岗位编码（如 HR-001） |
| brandLine | String? | 品牌线（理然/其他） |
| targetCompanies | String[]? | 目标公司 |
| interviewFocus | String[]? | 面试考察重点 |

> 扩展字段是否加入 Schema 需外部审查决定。当前 Job 模型已覆盖核心字段。

## 招聘流程节点（来自岗位 SOP）

```
岗位需求确认 → JD/画像校准 → 简历筛选 → HR初筛 →
业务筛选 → 初试 → 复试 → 终面 → Offer风险 → 入职前承接 → 复盘归档
```

SOP 中的招聘子流程：

- 招聘年度计划与月度计划制定
- 招聘需求沟通（新增/补充/汰换岗位画像确认）
- 招聘渠道管理（猎头/内推/招聘平台）
- 招聘过程管理（筛选→面试→Offer→入职）
- 特殊挖猎管理
- 校招执行
- 招聘数据维护
- 招聘系统维护

## 画像校准规则（来自 v3.2 模型）

- 岗位画像不是一次性文档，需要在招聘过程中持续校准
- 校准触发条件：连续 3 个候选人因同一原因被淘汰
- 校准维度：mustHave 调整、niceToHave 调整、薪资区间修正
- 记录 beforeSnapshot → afterSnapshot 变化
- 校准由 business_owner 主导，HRBP 复核

## 当前 Schema 状态

Job 模型已覆盖核心字段。建议 Phase 2.2 补充：
- `jobCode` (String?, @unique)
- `brandLine` (String?)
- `targetCompanies` (String[])
- `interviewFocus` (String[])

> 不在此 Phase 修改 Schema，等待外部审查决定。
