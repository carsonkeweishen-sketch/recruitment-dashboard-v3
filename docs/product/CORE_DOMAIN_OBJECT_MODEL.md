# 核心域对象模型 — Core Domain Object Model

> 版本：v1.0  
> 日期：2026-06-27  
> 分支：agent/workbuddy/phase-8  
> 适用范围：理然智能招聘 AI 看板全部模块

---

## 目录

1. [概述与对象全景图](#一概述与对象全景图)
2. [核心关系图](#二核心关系图)
3. [12 个核心对象详细定义](#三核心对象详细定义)
4. [对象-AI 能力映射矩阵](#四对象-ai-能力映射矩阵)
5. [对象-报告映射矩阵](#五对象-报告映射矩阵)
6. [扩展预留](#六扩展预留)

---

## 一、概述与对象全景图

### 1.1 域对象分类

本系统的域对象按业务职责分为四层：

| 层级 | 职责 | 包含对象 |
|------|------|---------|
| **业务实体层** | 招聘业务的核心载体 | Job, Candidate, Application |
| **流程记录层** | 招聘过程中的事件记录 | Interview, InterviewFeedback, BusinessFeedback |
| **协同与风控层** | 风险识别、行动追踪、审计 | ActionItem, ActivityLog, OfferRisk, ProfileCalibration |
| **智能与知识层** | AI 分析结果与知识资产 | AIInsight, KnowledgeDocument |

### 1.2 对象全景图

| # | 对象 | 英文 | 职责一句话 | 当前状态 |
|---|------|------|-----------|---------|
| 1 | 岗位 | Job | 招聘需求的核心载体 | ✅ Prisma 已定义 |
| 2 | 候选人 | Candidate | 人才个体的信息载体 | ✅ Prisma 已定义 |
| 3 | 投递 | Application | 连接岗位与候选人的桥梁 | ✅ Prisma 已定义 |
| 4 | 面试 | Interview | 面试安排的记录 | ✅ Prisma 已定义 |
| 5 | 面试反馈 | InterviewFeedback | 结构化面试评价 | ✅ Prisma 已定义 |
| 6 | 行动项 | ActionItem | 待办与风险追踪 | ✅ 已交付 (Phase 7.D) |
| 7 | 活动日志 | ActivityLog | 不可篡改审计轨迹 | ✅ 已交付 (Phase 7.D) |
| 8 | 画像校准 | ProfileCalibration | 岗位画像版本化变更 | ✅ Prisma 已定义 |
| 9 | 业务反馈 | BusinessFeedback | 业务方筛选决策记录 | ✅ Prisma 已定义 |
| 10 | Offer 风险 | OfferRisk | Offer 阶段风险跟踪 | ✅ Prisma 已定义 |
| 11 | 知识库文档 | KnowledgeDocument | 模板与知识的结构化存储 | ⚠️ 待建表 |
| 12 | AI 洞察 | AIInsight | AI 分析结果存储 | ✅ AiAnalysisLog 已有 |

---

## 二、核心关系图

### 2.1 主数据流

```
Department (部门)
    │
    └── User (用户)
           │
           ├── Job (岗位) ──────────────────────────────────────────┐
           │     │                                                   │
           │     ├── Application (投递) ─── Candidate (候选人)        │
           │     │      │                                            │
           │     │      ├── Interview (面试)                          │
           │     │      │      │                                     │
           │     │      │      └── InterviewFeedback (面试反馈)       │
           │     │      │                                             │
           │     │      ├── OfferRisk (Offer 风险)                    │
           │     │      │                                             │
           │     │      └── OfferCommitment (Offer 承诺)              │
           │     │                                                   │
           │     ├── BusinessFeedback (业务反馈)                      │
           │     │                                                   │
           │     └── ProfileCalibration (画像校准)                    │
           │                                                         │
           └── ActionItem (行动项) ◄── 所有风险/规则触发              │
                  │                                                   │
                  └── ActivityLog (活动日志) ◄── 所有操作留痕          │
                                                                     │
KnowledgeDocument (知识库) ── 关联 ──► Job                          │
AIInsight (AI 洞察) ── 多态关联 ──► Job / Candidate / Application    │
```

### 2.2 Action 生成关系

```
触发源                           →  ActionItem
─────────────────────────────────────────────────
Job.status = 'stalled'           →  岗位卡点 Action
Job.profile 校准待确认            →  画像校准 Action
Application.stage 停滞超时        →  阶段卡点 Action
Interview.completed 后无 Feedback  →  反馈逾期 Action
InterviewFeedback.quality < 阈值   →  质量不足 Action
InterviewFeedback.riskSignals     →  风险信号 Action
BusinessFeedback 逾期未提交        →  业务反馈逾期 Action
OfferRisk.level = 'high'         →  Offer 高风险 Action
AIInsight.confidence > 阈值       →  AI 建议 Action
手动创建                          →  手动 Action
```

### 2.3 ActivityLog 记录关系

```
操作                        →  ActivityLog.action
─────────────────────────────────────────────────
ActionItem 创建              →  ACTION_CREATED
ActionItem 解决              →  ACTION_RESOLVED
ActionItem 忽略              →  ACTION_DISMISSED
InterviewFeedback 提交       →  FEEDBACK_SUBMITTED
ProfileCalibration 确认      →  CALIBRATION_CONFIRMED
BusinessFeedback 提交        →  BUSINESS_FEEDBACK_SUBMITTED
OfferRisk 创建/解决           →  OFFER_RISK_CREATED / OFFER_RISK_RESOLVED
Application.stage 变更       →  STAGE_CHANGED
```

---

## 三、核心对象详细定义

### 3.1 Job（岗位）

| 属性 | 值 |
|------|-----|
| **对象职责** | 招聘需求的核心载体，定义招什么人、什么要求、谁来负责 |
| **Prisma 模型** | `Job` |
| **当前状态** | ✅ Prisma 已定义，API 已就绪，UI 空状态 |

**核心字段：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `title` | String | 岗位名称（如 "KA大客户销售"） |
| `departmentId` | FK → Department | 所属部门 |
| `level` | String? | 职级范围（如 "P6-P7"） |
| `status` | String | 招聘状态：open / paused / closed |
| `priority` | String | 优先级：normal / high / urgent |
| `headcount` | Int | 编制人数 |
| `ownerId` | FK → User | HR 负责人 |
| `businessOwnerId` | FK → User? | 业务方负责人 |
| `profileSummary` | String? | 岗位画像摘要 |
| `mustHave` | Json? | 必备条件 |
| `niceToHave` | Json? | 加分条件 |
| `targetCompanies` | Json? | 目标公司列表 |
| `interviewFocus` | Json? | 面试考察重点 |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| Department | N:1 | 岗位属于一个部门 |
| User (owner) | N:1 | HR 负责人 |
| User (businessOwner) | N:1 | 业务方负责人 |
| Application | 1:N | 该岗位的所有投递 |
| BusinessFeedback | 1:N | 业务方对该岗位候选人的反馈 |
| ProfileCalibration | 1:N | 画像校准历史 |
| ActionItem | 1:N | 关联的行动项 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin | 全部岗位 |
| leader | 全部岗位 |
| hrbp | 本部门岗位 |
| recruiter | 自己负责的岗位（ownerId = self） |
| business_owner | 自己负责的岗位（businessOwnerId = self） |
| interviewer | 自己参与面试的岗位 |

**AI 能力：**

| AI 层级 | 能力 | 说明 |
|---------|------|------|
| Layer 1 | 岗位卡点识别 | 规则引擎：连续 N 天无推进 → 标记 stalled |
| Layer 1 | 逾期检测 | 超过目标到岗日期未关闭 → 生成 Action |
| Layer 2 | 画像校准建议 | 基于淘汰原因聚类，建议调整 mustHave/niceToHave |
| Layer 2 | 招聘周期预测 | 基于历史数据预测到岗时间 |

**产生 Action：** ✅ 是  
**进入报告：** ✅ 是

---

### 3.2 Candidate（候选人）

| 属性 | 值 |
|------|-----|
| **对象职责** | 人才个体的信息载体，记录候选人基本信息和来源 |
| **Prisma 模型** | `Candidate` |
| **当前状态** | ✅ Prisma 已定义，API 已就绪，UI 空状态 |

**核心字段：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `name` | String | 候选人姓名 |
| `email` | String? | 邮箱 |
| `phone` | String? | 电话 |
| `source` | String? | 来源渠道（内推/猎头/招聘网站） |
| `currentCompany` | String? | 当前公司 |
| `currentTitle` | String? | 当前职位 |
| `resumeSummary` | String? | 简历摘要 |
| `tags` | String[] | 标签（如 "高潜", "竞品", "内推"） |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| Application | 1:N | 候选人的所有投递记录 |
| ActionItem | 1:N | 关联的行动项 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin | 全部候选人 |
| leader | 全部候选人 |
| hrbp | 本部门岗位的候选人 |
| recruiter | 自己负责岗位的候选人 |
| business_owner | 自己负责岗位的候选人 |
| interviewer | 自己面试过的候选人 |

**AI 能力：**

| AI 层级 | 能力 | 说明 |
|---------|------|------|
| Layer 2 | 候选人-岗位匹配度 | 简历关键词 vs 岗位画像相似度 |
| Layer 2 | 候选人风险识别 | 竞业风险、薪资预期差距、离职频率 |
| Layer 2 | 候选人推荐排序 | 多岗位匹配度排名 |

**产生 Action：** ✅ 是（风险信号触发）  
**进入报告：** ✅ 是

---

### 3.3 Application（投递）

| 属性 | 值 |
|------|-----|
| **对象职责** | 连接岗位与候选人的桥梁，追踪招聘全流程进度 |
| **Prisma 模型** | `Application` |
| **当前状态** | ✅ Prisma 已定义，API 已就绪 |

**核心字段：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `jobId` | FK → Job | 投递的岗位 |
| `candidateId` | FK → Candidate | 候选人 |
| `stage` | ApplicationStage | 当前阶段（sourced → hired/rejected） |
| `status` | String | 投递状态：active / withdrawn / closed |
| `ownerId` | FK → User? | 负责该投递的 HR |
| `source` | String? | 投递来源渠道 |
| `fitScore` | Int? | 岗位匹配度评分（0-100） |
| `lastActivityAt` | DateTime? | 最后活跃时间 |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| Job | N:1 | 投递的目标岗位 |
| Candidate | N:1 | 候选人 |
| User (owner) | N:1 | 负责的 HR |
| Interview | 1:N | 面试记录 |
| OfferRisk | 1:N | Offer 风险 |
| OfferCommitment | 1:N | Offer 承诺事项 |
| ActionItem | 1:N | 关联的行动项 |

**权限边界：** 继承 Job 的权限边界（能看岗位 → 能看投递）

**AI 能力：**

| AI 层级 | 能力 | 说明 |
|---------|------|------|
| Layer 1 | 阶段卡点检测 | 在某一阶段停留超时 → 生成 Action |
| Layer 2 | 投递匹配度评分 | fitScore 的计算与更新 |
| Layer 2 | 阶段转化预测 | 预测候选人通过当前阶段的概率 |

**产生 Action：** ✅ 是  
**进入报告：** ✅ 是

---

### 3.4 Interview（面试）

| 属性 | 值 |
|------|-----|
| **对象职责** | 面试安排的记录，连接面试官与候选人 |
| **Prisma 模型** | `Interview` |
| **当前状态** | ✅ Prisma 已定义，API 已就绪 |

**核心字段：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `applicationId` | FK → Application | 关联的投递 |
| `round` | InterviewRound | 面试轮次 |
| `interviewerId` | FK → User | 面试官 |
| `scheduledAt` | DateTime? | 计划面试时间 |
| `completedAt` | DateTime? | 实际完成时间 |
| `status` | String | scheduled / completed / cancelled |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| Application | N:1 | 关联的投递 |
| User (interviewer) | N:1 | 面试官 |
| InterviewFeedback | 1:N | 面试反馈（通常 1 条） |
| ActionItem | 1:N | 关联的行动项 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin / leader | 全部面试 |
| hrbp | 本部门岗位的面试 |
| recruiter / business_owner | 负责岗位的面试 |
| interviewer | 自己作为面试官的面试 |

**AI 能力：** ❌ 不直接进入 AI 分析（但 InterviewFeedback 进入）  
**产生 Action：** ✅ 是（completed 后超时无反馈 → 生成逾期 Action）  
**进入报告：** ✅ 是

---

### 3.5 InterviewFeedback（面试反馈）

| 属性 | 值 |
|------|-----|
| **对象职责** | 结构化面试评价记录，是整个系统质量体系的核心数据源 |
| **Prisma 模型** | `InterviewFeedback` |
| **当前状态** | ✅ Prisma 已定义，API 已就绪 |

**核心字段：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `interviewId` | FK → Interview | 关联的面试 |
| `interviewerId` | FK → User | 提交反馈的面试官 |
| `overallRecommendation` | OverallRecommendation? | 综合推荐结论 |
| `scores` | Json? | 六维度评分（1-5 分） |
| `evidenceText` | String? | 面试证据（必填，≥50 字） |
| `riskNotes` | String? | 风险备注 |
| `suggestedFollowUpQuestions` | String[] | 建议下一轮追问方向 |
| `feedbackQualityScore` | Int? | 反馈质量分（0-100） |
| `qualityLevel` | String? | 质量等级 |
| `riskSignals` | Json? | 风险信号（如评分偏差、证据不足） |
| `submittedAt` | DateTime? | 提交时间 |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| Interview | N:1 | 关联的面试 |
| User (interviewer) | N:1 | 提交者 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin / leader | 全部反馈 |
| hrbp | 本部门岗位的反馈 |
| recruiter / business_owner | 负责岗位的反馈 |
| interviewer | 自己提交的反馈 |

**AI 能力：**

| AI 层级 | 能力 | 说明 |
|---------|------|------|
| Layer 2 | 反馈质量自动评分 | 证据长度、结构化程度、评分一致性 |
| Layer 2 | 风险信号提取 | 评分偏差、证据不足、推荐与评分矛盾 |
| Layer 2 | 面试官质量趋势 | 面试官的反馈质量变化趋势 |

**产生 Action：** ✅ 是（质量不足 / 证据不足 / 风险信号 → 生成 Action）  
**进入报告：** ✅ 是

---

### 3.6 ActionItem（行动项）

| 属性 | 值 |
|------|-----|
| **对象职责** | 招聘协同中的待办事项，从风险识别到闭环处理的完整追踪 |
| **Prisma 模型** | `ActionItem` |
| **当前状态** | ✅ 已交付（Phase 7.D Final Lock） |

**核心字段：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `title` | String | 行动项标题 |
| `description` | String? | 详细描述 |
| `category` | String | 分类：流程卡点 / Offer 风险 / 反馈催办 / 岗位校准 / 候选人风险 / 数据质量 / 手动创建 |
| `priority` | String | 优先级：low / medium / high / urgent |
| `status` | String | 状态：open / in_progress / resolved / dismissed |
| `ownerId` | FK → User? | 责任人 |
| `createdById` | FK → User | 创建人 |
| `jobId` | FK → Job? | 关联岗位 |
| `candidateId` | FK → Candidate? | 关联候选人 |
| `applicationId` | FK → Application? | 关联投递 |
| `interviewId` | FK → Interview? | 关联面试 |
| `sourceType` | String | 来源类型：rule / manual / ai |
| `sourceRefId` | String? | 来源引用 ID |
| `sourceSummary` | String? | 来源摘要 |
| `dueAt` | DateTime? | 截止日期 |
| `resolvedAt` | DateTime? | 解决时间 |
| `resolutionNote` | String? | 解决备注 |
| `dismissedReason` | String? | 忽略原因 |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| User (owner) | N:1 | 责任人 |
| User (creator) | N:1 | 创建人 |
| Job | N:1? | 关联岗位 |
| Candidate | N:1? | 关联候选人 |
| Application | N:1? | 关联投递 |
| Interview | N:1? | 关联面试 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin / leader | 全部 Action |
| 其他角色 | owner = self + 关联对象 scope 内可见 |

**AI 能力：**

| AI 层级 | 能力 | 说明 |
|---------|------|------|
| Layer 1 | 规则引擎自动生成 | 逾期、卡点、风险信号 → 自动创建 Action |
| Layer 2 | AI 建议 Action | 高置信度洞察 → 建议创建 Action（需人工确认） |

**产生 Action：** ❌ 否（自身即 Action）  
**进入报告：** ✅ 是

---

### 3.7 ActivityLog（活动日志）

| 属性 | 值 |
|------|-----|
| **对象职责** | 所有关键操作的不可篡改审计轨迹 |
| **Prisma 模型** | `ActivityLog` |
| **当前状态** | ✅ 已交付（Phase 7.D Final Lock） |

**核心字段：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `actorId` | FK → User | 操作人 |
| `action` | String | 操作类型（ACTION_CREATED / ACTION_RESOLVED / ...） |
| `resourceType` | String | 资源类型 |
| `resourceId` | String | 资源 ID |
| `detail` | Json? | 操作详情 |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| User (actor) | N:1 | 操作人 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin / leader | 全部日志 |
| 其他角色 | 关联资源 scope 内的日志 |

**AI 能力：** ❌ 不直接进入 AI（但 AI 分析可读取作为上下文）  
**产生 Action：** ❌ 否  
**进入报告：** ✅ 是（动态时间线来源）

---

### 3.8 ProfileCalibration（画像校准）

| 属性 | 值 |
|------|-----|
| **对象职责** | 岗位画像的版本化变更记录，记录校准前后对比 |
| **Prisma 模型** | `ProfileCalibration` |
| **当前状态** | ✅ Prisma 已定义，API 已就绪 |

**核心字段：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `jobId` | FK → Job | 关联岗位 |
| `beforeSnapshot` | Json? | 校准前画像快照 |
| `afterSnapshot` | Json? | 校准后画像快照 |
| `sourceFeedbackIds` | String[] | 触发校准的反馈 ID 列表 |
| `calibrationReason` | String? | 校准原因 |
| `createdBy` | String | 创建人 |
| `status` | String | draft / confirmed / rejected |
| `confirmedBy` | String? | 确认人 |
| `confirmedAt` | DateTime? | 确认时间 |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| Job | N:1 | 关联岗位 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin / leader | 全部校准 |
| hrbp | 本部门岗位的校准 |
| recruiter / business_owner | 负责岗位的校准 |

**AI 能力：**

| AI 层级 | 能力 | 说明 |
|---------|------|------|
| Layer 2 | 校准建议生成 | 基于淘汰原因聚类，建议调整画像条件 |

**产生 Action：** ✅ 是（待确认的校准 → 生成 Action）  
**进入报告：** ✅ 是

---

### 3.9 BusinessFeedback（业务反馈）

| 属性 | 值 |
|------|-----|
| **对象职责** | 业务方对候选人筛选决策的结构化记录 |
| **Prisma 模型** | `BusinessFeedback` |
| **当前状态** | ✅ Prisma 已定义，API 已就绪 |

**核心字段：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `jobId` | FK → Job | 关联岗位 |
| `applicationId` | String? | 关联投递（可选） |
| `reviewerId` | FK → User | 业务审核人 |
| `decision` | String | 决策：PASS / REJECT / HOLD / REDIRECT |
| `reasonCode` | String? | 原因编码 |
| `reasonText` | String? | 原因描述 |
| `evidence` | String? | 决策依据 |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| Job | N:1 | 关联岗位 |
| Application | N:1? | 关联投递 |
| User (reviewer) | N:1 | 审核人 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin / leader | 全部反馈 |
| hrbp | 本部门岗位的反馈 |
| recruiter / business_owner | 负责岗位的反馈 |
| reviewer | 自己提交的反馈（自访问路径） |

**AI 能力：**

| AI 层级 | 能力 | 说明 |
|---------|------|------|
| Layer 1 | 反馈逾期检测 | 超时未提交 → 生成 Action |
| Layer 2 | 淘汰原因聚类 | 同一岗位多次淘汰的原因模式分析 |

**产生 Action：** ✅ 是  
**进入报告：** ✅ 是

---

### 3.10 OfferRisk（Offer 风险）

| 属性 | 值 |
|------|-----|
| **对象职责** | Offer 阶段的风险识别与跟踪 |
| **Prisma 模型** | `OfferRisk` |
| **当前状态** | ✅ Prisma 已定义，API 已就绪 |

**核心字段：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `applicationId` | FK → Application | 关联投递 |
| `riskType` | OfferRiskType | 风险类型 |
| `level` | String | 风险等级：low / medium / high / critical |
| `description` | String? | 风险描述 |
| `ownerId` | FK → User? | 风险责任人 |
| `status` | String | open / resolved / dismissed |
| `dueAt` | DateTime? | 处理截止时间 |
| `resolvedAt` | DateTime? | 解决时间 |

**OfferRiskType 枚举值：**
- `SALARY_GAP` — 薪资差距
- `COMPETING_OFFER` — 竞品 Offer
- `DECISION_DELAY` — 决策延迟
- `START_DATE_UNCERTAIN` — 入职时间不确定
- `COMMITMENT_UNRESOLVED` — 承诺未兑现
- `PRE_ONBOARDING_SILENCE` — 入职前沉默
- `EXPECTATION_MISMATCH` — 期望不匹配

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| Application | N:1 | 关联投递 |
| User (owner) | N:1 | 责任人 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin / leader | 全部风险 |
| hrbp | 本部门岗位的风险 |
| recruiter / business_owner | 负责岗位的风险 |

**AI 能力：**

| AI 层级 | 能力 | 说明 |
|---------|------|------|
| Layer 1 | 风险规则触发 | 薪资差距 > 15% → 标记风险 |
| Layer 2 | 风险预测 | 基于候选人行为和阶段特征预测 Offer 风险概率 |

**产生 Action：** ✅ 是（高风险 → 自动生成 Action）  
**进入报告：** ✅ 是

---

### 3.11 KnowledgeDocument（知识库文档）

| 属性 | 值 |
|------|-----|
| **对象职责** | 岗位画像模板、面试评估维度模板的结构化知识存储 |
| **Prisma 模型** | ⚠️ 待建表 |
| **当前状态** | ⚠️ 仅定义，未建表 |

**核心字段（规划）：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `title` | String | 文档标题 |
| `type` | String | 类型：job_profile_template / interview_dimension_template / evaluation_rubric |
| `content` | Json | 结构化内容 |
| `tags` | String[] | 标签 |
| `jobId` | FK → Job? | 关联岗位（可选） |
| `version` | Int | 版本号 |
| `status` | String | draft / published / archived |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| Job | N:1? | 可选关联岗位 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin / leader / hrbp | 全部文档 |
| recruiter | 只读 |
| interviewer | 只读关联岗位的文档 |

**AI 能力：**

| AI 层级 | 能力 | 说明 |
|---------|------|------|
| Layer 2 | 模板推荐 | 根据岗位类型推荐合适的面试评估维度 |

**产生 Action：** ❌ 否  
**进入报告：** ❌ 否

---

### 3.12 AIInsight（AI 分析洞察）

| 属性 | 值 |
|------|-----|
| **对象职责** | AI 分析结果的结构化存储，支持确认/驳回人工审核 |
| **Prisma 模型** | `AiAnalysisLog`（已建表） |
| **当前状态** | ✅ Prisma 已定义，AI 调用链路待实现 |

**核心字段（映射自 AiAnalysisLog）：**

| 字段 | 类型 | 业务含义 |
|------|------|---------|
| `analysisType` | AiAnalysisType | 分析类型 |
| `resourceType` | String | 分析目标类型（job / candidate / application） |
| `resourceId` | String | 分析目标 ID |
| `userId` | FK → User | 触发分析的用户 |
| `inputHash` | String? | 输入去重 hash |
| `promptName` | String? | Prompt 模板名称 |
| `promptVersion` | String? | Prompt 版本 |
| `provider` | String? | AI 提供商 |
| `model` | String? | 模型名称 |
| `confidence` | Float? | 置信度（0-1） |
| `outputJson` | Json? | AI 输出结果 |
| `sanitizedInputSnapshot` | Json? | 脱敏后的输入快照 |
| `isFallback` | Boolean | 是否使用了降级策略 |
| `isConfirmed` | Boolean | 是否经人工确认 |
| `confirmedBy` | String? | 确认人 |
| `confirmedAt` | DateTime? | 确认时间 |

**关联对象：**

| 关联对象 | 关系 | 说明 |
|---------|------|------|
| User | N:1 | 触发者 |
| 多态关联 | — | 通过 resourceType + resourceId 关联任意业务对象 |

**权限边界：**

| 角色 | Scope |
|------|-------|
| admin / leader | 全部洞察 |
| hrbp | 本部门资源的洞察 |
| recruiter | 自己负责资源的洞察 |

**AI 能力：** ✅ 自身即 AI 输出  
**产生 Action：** ✅ 是（高置信度洞察 → 建议生成 Action，需人工确认）  
**进入报告：** ✅ 是

---

## 四、对象-AI 能力映射矩阵

| 对象 | Layer 1 规则引擎 | Layer 2 AI 辅助 | Layer 3 AI 自主 | 说明 |
|------|:---:|:---:|:---:|------|
| Job | ✅ 卡点/逾期检测 | ✅ 画像校准建议 | ❌ | — |
| Candidate | ❌ | ✅ 匹配度/风险识别 | ❌ | — |
| Application | ✅ 阶段卡点检测 | ✅ 匹配度/转化预测 | ❌ | — |
| Interview | ✅ 反馈逾期检测 | ❌ | ❌ | 自身不进入 AI，Feedback 进入 |
| InterviewFeedback | ❌ | ✅ 质量评分/风险信号 | ❌ | 核心 AI 消费对象 |
| ActionItem | ✅ 规则自动生成 | ✅ AI 建议生成 | ❌ | 生成需人工确认 |
| ActivityLog | ❌ | ❌ | ❌ | AI 可读取作上下文 |
| ProfileCalibration | ❌ | ✅ 校准建议 | ❌ | — |
| BusinessFeedback | ✅ 逾期检测 | ✅ 淘汰原因聚类 | ❌ | — |
| OfferRisk | ✅ 风险规则触发 | ✅ 风险预测 | ❌ | — |
| KnowledgeDocument | ❌ | ✅ 模板推荐 | ❌ | — |
| AIInsight | — | — | — | 自身即 AI 输出 |

---

## 五、对象-报告映射矩阵

| 对象 | 周报复盘 | 岗位复盘 | 部门复盘 | 说明 |
|------|:---:|:---:|:---:|------|
| Job | ✅ | ✅ | ✅ | 核心复盘对象 |
| Candidate | ✅ | ✅ | ✅ | 候选人漏斗数据 |
| Application | ✅ | ✅ | ✅ | 阶段转化率 |
| Interview | ✅ | ✅ | ✅ | 面试数量与分布 |
| InterviewFeedback | ✅ | ✅ | ✅ | 质量趋势 |
| ActionItem | ✅ | ✅ | ✅ | 闭环率 |
| ActivityLog | ✅ | ❌ | ❌ | 动态时间线 |
| ProfileCalibration | ✅ | ✅ | ❌ | 画像变更历史 |
| BusinessFeedback | ✅ | ✅ | ✅ | 淘汰原因分布 |
| OfferRisk | ✅ | ✅ | ❌ | 风险趋势 |
| KnowledgeDocument | ❌ | ❌ | ❌ | 不进入报告 |
| AIInsight | ✅ | ✅ | ✅ | AI 发现摘要 |

---

## 六、扩展预留

### 6.1 已识别但未定义的未来对象

| 对象 | 职责 | 预计 Phase |
|------|------|-----------|
| InterviewerProfile | 面试官能力画像（擅长维度、评分偏差、培训记录） | Phase 13 |
| RecruitmentChannel | 招聘渠道管理（渠道 ROI、转化漏斗） | Phase 11 |
| OnboardingChecklist | 入职前准备清单 | Phase 14 |
| NotificationRule | 通知规则配置 | Phase 10 |
| IntegrationConfig | 外部系统集成配置（Moka/飞书） | Phase 15 |

### 6.2 对象关系扩展方向

```
未来可能的新增关系：
InterviewerProfile → User (1:1)
RecruitmentChannel → Application (1:N, source)
OnboardingChecklist → Application (1:1, pre_onboarding stage)
NotificationRule → User (N:M, 订阅关系)
IntegrationConfig → System (配置对象)
```

---

> **文档维护规则**：每次新增 Prisma Model 或修改核心对象关系时，必须同步更新本文档。
