# Phase 8.11 AI Copilot — Context Builder v2 证据

> 验证范围：10 个 context source 适配器 + scope 权限 + no-evidence 短路
> 日期：2026-06-28

---

## Context Builder v2 架构

```
Request (scope + scopeId)
    │
    ▼
┌─────────────────────────────────────┐
│       Context Builder v2            │
│                                     │
│  ┌───────────────────────────────┐  │
│  │    Scope Permission Check     │  │
│  │  (RBAC + Scope-based filter)  │  │
│  └─────────────┬─────────────────┘  │
│                │                     │
│                ▼                     │
│  ┌───────────────────────────────┐  │
│  │   Source Adapter Resolution   │  │
│  │   (10 pluggable adapters)     │  │
│  └─────────────┬─────────────────┘  │
│                │                     │
│                ▼                     │
│  ┌───────────────────────────────┐  │
│  │   Context Aggregation +       │  │
│  │   Citation Generation         │  │
│  └─────────────┬─────────────────┘  │
│                │                     │
│                ▼                     │
│  ┌───────────────────────────────┐  │
│  │   Redaction (PII removal)     │  │
│  └─────────────┬─────────────────┘  │
│                │                     │
│                ▼                     │
│  Response (context + citations)      │
└─────────────────────────────────────┘
```

---

## 10 个 Context Source 适配器验证

### 1. dashboard — 看板聚合数据

| 项目 | 值 |
|---|---|
| Source ID | `dashboard` |
| 输入 | `scope=dashboard` |
| 返回数据 | 招聘概览指标、关键 KPI、趋势数据 |
| Citations | 含看板数据引用 |
| 权限 | admin/leader/hrbp/recruiter 可见 |
| 截图 | 01 |
| Verdict | PASS |

### 2. job — 职位详情

| 项目 | 值 |
|---|---|
| Source ID | `job` |
| 输入 | `scope=job&scopeId=job-001` |
| 返回数据 | 职位标题、部门、要求、状态、候选人数量 |
| Citations | 含职位记录引用 |
| 权限 | admin/leader/hrbp (本部门)/recruiter (OWNED) |
| 截图 | 02 |
| Verdict | PASS |

### 3. candidate — 候选人信息

| 项目 | 值 |
|---|---|
| Source ID | `candidate` |
| 输入 | `scope=candidate&scopeId=cand-001` |
| 返回数据 | 候选人脱敏信息（姓名脱敏）、面试阶段、评分 |
| Citations | 含候选人记录引用 |
| 权限 | admin/leader/hrbp (本部门)/recruiter (OWNED) |
| 截图 | 03 |
| Verdict | PASS |

### 4. interview-feedback — 面试反馈

| 项目 | 值 |
|---|---|
| Source ID | `interview-feedback` |
| 输入 | `scope=interview-feedback&scopeId=iview-001` |
| 返回数据 | 面试评价、评分维度、面试官备注 |
| Citations | 含面试记录引用 |
| 权限 | admin/leader/hrbp (本部门)/recruiter (OWNED) |
| 截图 | 04 |
| Verdict | PASS |

### 5. offer-risk — Offer 风险评估

| 项目 | 值 |
|---|---|
| Source ID | `offer-risk` |
| 输入 | `scope=offer-risk&scopeId=offer-001` |
| 返回数据 | 风险等级、风险因子、建议措施 |
| Citations | 含 Offer 记录引用 |
| 权限 | admin/leader/hrbp |
| 截图 | 05 |
| Verdict | PASS |

### 6. action — 动作中心

| 项目 | 值 |
|---|---|
| Source ID | `action` |
| 输入 | `scope=action&scopeId=act-001` |
| 返回数据 | 待办动作、截止日期、关联对象 |
| Citations | 含动作记录引用 |
| 权限 | admin/leader/hrbp (本部门)/recruiter (OWNED) |
| 截图 | 06 |
| Verdict | PASS |

### 7. funnel — 招聘漏斗

| 项目 | 值 |
|---|---|
| Source ID | `funnel` |
| 输入 | `scope=funnel&scopeId=job-001` |
| 返回数据 | 阶段转化率、各阶段人数、漏斗趋势 |
| Citations | 含漏斗数据引用 |
| 权限 | admin/leader/hrbp (本部门) |
| 截图 | 07 |
| Verdict | PASS |

### 8. knowledge — 知识库

| 项目 | 值 |
|---|---|
| Source ID | `knowledge` |
| 输入 | `scope=knowledge` |
| 返回数据 | 知识库条目、FAQ、面试指南 |
| Citations | 含知识库条目引用 |
| 权限 | admin/leader/hrbp/recruiter |
| 截图 | 08 |
| Verdict | PASS |

### 9. data-source — 外部数据源

| 项目 | 值 |
|---|---|
| Source ID | `data-source` |
| 输入 | `scope=data-source&scopeId=ds-001` |
| 返回数据 | 外部招聘市场数据、薪酬基准 |
| Citations | 含数据源记录引用 |
| 权限 | admin/leader |
| 截图 | 11 |
| Verdict | PASS |

### 10. transcript — 语音转写

| 项目 | 值 |
|---|---|
| Source ID | `transcript` |
| 输入 | `scope=transcript&scopeId=tr-001` |
| 返回数据 | 面试录音转写文本片段（脱敏后） |
| Citations | 含转写记录引用 |
| 权限 | admin/leader/hrbp (本部门)/recruiter (OWNED) |
| 截图 | 09 |
| Verdict | PASS |

---

## Scope 权限验证

| 角色 | dashboard | job | candidate | interview-feedback | offer-risk | action | funnel | knowledge | data-source | transcript |
|---|---|---|---|---|---|---|---|---|---|---|
| admin | ALL | ALL | ALL | ALL | ALL | ALL | ALL | ALL | ALL | ALL |
| leader | ALL | ALL | ALL | ALL | ALL | ALL | ALL | ALL | ALL | ALL |
| hrbp | ALL | DEPT | DEPT | DEPT | DEPT | DEPT | DEPT | ALL | DENY | DEPT |
| recruiter | ALL | OWN | OWN | OWN | DENY | OWN | DENY | ALL | DENY | OWN |
| business_owner | DENY | DENY | DENY | DENY | DENY | DENY | DENY | DENY | DENY | DENY |
| interviewer | DENY | DENY | DENY | DENY | DENY | DENY | DENY | DENY | DENY | DENY |

---

## no-evidence 短路验证

| 场景 | 输入 | 预期 | 实际 | Verdict |
|---|---|---|---|---|
| 无匹配知识库条目 | `scope=knowledge`, query 无匹配 | `evidenceStatus: "no_evidence"`, citations=[] | AI 返回 "暂无相关数据"，不编造 | PASS |
| 无权限 scope | `scope=offer-risk`, role=recruiter | 403 | 403，context 为空 | PASS |
| 空 scopeId | `scope=job`, scopeId 为空 | 400 Bad Request | 400，提示 scopeId required | PASS |
| 无效 scope | `scope=unknown` | 400 Bad Request | 400，提示 unsupported scope | PASS |
| 无数据源 | `scope=data-source`, scopeId 不存在 | `evidenceStatus: "no_evidence"` | AI 明确回复无数据 | PASS |

---

## 结论

| 检查项 | 结果 |
|---|---|
| 10 个适配器注册 | 10/10 PASS |
| 适配器数据返回 | 10/10 PASS |
| Citations 可溯源 | 10/10 PASS |
| Scope 权限矩阵 | 60/60 格 PASS |
| no-evidence 短路 | 5/5 PASS |
| 脱敏集成 | PASS |

**Context Builder v2 全部验证通过。**
