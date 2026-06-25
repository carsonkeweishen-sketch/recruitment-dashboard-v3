# Phase 3.0 — Schema Gap Check

> 对比理然真实资料 vs 当前 Prisma Job 模型。

## 当前 Job 模型字段

| 字段 | 类型 | 状态 |
|------|------|------|
| id | String @id | ✅ |
| title | String | ✅ |
| departmentId | String | ✅ |
| level | String? | ✅ |
| status | String @default("open") | ✅ |
| priority | String @default("normal") | ✅ |
| ownerId | String | ✅ |
| businessOwnerId | String? | ✅ |
| location | String? | ✅ |
| headcount | Int @default(1) | ✅ |
| jdText | String? | ✅ |
| profileSummary | String? | ✅ |
| mustHave | Json? | ✅ |
| niceToHave | Json? | ✅ |
| salaryMin | Int? | ✅ |
| salaryMax | Int? | ✅ |

## 理然资料要求 vs 当前覆盖

| 需求 | 覆盖 | 说明 |
|------|------|------|
| 岗位名称 | ✅ title | 理然 51 个岗位类型 |
| 部门 | ✅ departmentId | 14 个部门 |
| 职级 | ✅ level | A/S/G/M/P 体系 |
| 岗位职责 | ✅ jdText | 结构化 JD |
| 任职要求 | ✅ mustHave (Json) | 从 JD 提取 |
| 加分项 | ✅ niceToHave (Json) | 从 JD 提取 |
| 画像摘要 | ✅ profileSummary | JD 摘要 |
| 薪资区间 | ✅ salaryMin/Max | 区间，不存个人薪资 |
| 招聘负责人 | ✅ ownerId | User relation |
| 业务负责人 | ✅ businessOwnerId | User relation |
| 招聘优先级 | ✅ priority | high/normal/low |

## 建议补充字段（Phase 2.2 候选）

| 字段 | 类型 | 用途 |
|------|------|------|
| jobCode | String? @unique | 岗位编码（如 MK-001） |
| brandLine | String? | 品牌线 |
| targetCompanies | String[]? | 目标公司列表 |
| interviewFocus | String[]? | 面试考察重点 |

## 结论

- ✅ 当前 Job Schema **足够**支撑 Phase 3 开发
- ⚠️ 4 个扩展字段建议在 Phase 2.2 补充
- ⚠️ 是否修改 Schema 由外部审查决定
- ❌ 本 Phase 不修改 Schema
