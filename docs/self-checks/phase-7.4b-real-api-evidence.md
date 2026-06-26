# Phase 7.4B-P0 Real API Evidence

> 日期：2026-06-26
> 环境：local PostgreSQL + Next.js dev server
> Mock：否 — 所有测试来自真实 API

## 测试环境

| 变量 | 值 |
|------|-----|
| 数据库 | PostgreSQL 16 @ localhost:5432 |
| 数据库名 | recruitment_dashboard_v3 |
| 服务器 | Next.js 16.2.9 dev (Turbopack) |
| 测试方法 | curl + Playwright browser fetch |
| Session | cookie-based (rd_dev_role / rd_dev_user_id) |

## 测试用户

| 角色 | 用户ID | 姓名 |
|------|--------|------|
| admin | cmqv2nfjo0007y3jxiwti2eer | 陈总 |
| recruiter | cmqv2nfjq000ay3jx3qg1m83k | 王招聘 |
| interviewer | cmqv2nfjr000cy3jxq62urqiq | 孙面试官 |

---

## T1: GET /api/actions/:id authorized → 200

| 字段 | 值 |
|------|-----|
| 角色 | admin |
| userId | cmqv2nfjo0007y3jxiwti2eer |
| 请求 | GET /api/actions/cmqv2nflv001ey3jxovwi34h6 |
| HTTP status | 200 |
| Response success | true |
| Response data | ActionItem 完整对象（含 owner, createdBy, job, candidate 等） |
| ActivityLog 返回 | activity[] (真实 ActivityLog 记录) |
| DB write | 无（只读） |
| Verdict | ✅ PASS |

---

## T2: GET /api/actions/:id unauthorized → 403/404

| 字段 | 值 |
|------|-----|
| 角色 | interviewer |
| userId | cmqv2nfjr000cy3jxq62urqiq |
| 请求 | GET /api/actions/cmqv2nflv001ey3jxovwi34h6 |
| HTTP status | 403 |
| Response | `{"success":false,"error":"Permission denied"}` |
| ActivityLog | N/A |
| DB write | 无 |
| Verdict | ✅ PASS — interviewer RELATED scope 无法访问非关联 action |

---

## T3: POST /api/actions valid → 201

| 字段 | 值 |
|------|-----|
| 角色 | admin |
| userId | cmqv2nfjo0007y3jxiwti2eer |
| 请求 | POST /api/actions |
| Payload | `{"title":"P0真实证据：Dismiss测试Action","category":"data_quality","priority":"low","sourceType":"manual"}` |
| HTTP status | 201 |
| Response | `{"success":true,"data":{...action对象...}}` |
| DB write | action_items 表新增一行 |
| ActivityLog | ACTION_CREATED 已写入 (action_item 类型) |
| ActivityLog ID | 确认已写入 activity_logs 表 |
| Verdict | ✅ PASS |

---

## T4: POST /api/actions invalid → 400

| 字段 | 值 |
|------|-----|
| 角色 | admin |
| userId | cmqv2nfjo0007y3jxiwti2eer |
| 请求 | POST /api/actions |
| Payload | `{"title":"","category":"manual","priority":"medium","sourceType":"manual"}` |
| HTTP status | 400 |
| Response | `{"success":false,"error":"title is required"}` |
| DB write | 无 |
| ActivityLog | 无 |
| Verdict | ✅ PASS |

---

## T5: POST /api/actions unauthorized → 403/404

| 字段 | 值 |
|------|-----|
| 角色 | interviewer |
| userId | cmqv2nfjr000cy3jxq62urqiq |
| 请求 | POST /api/actions |
| Payload | `{"title":"test","category":"manual","priority":"medium","sourceType":"manual"}` |
| HTTP status | 403 |
| Response | `{"success":false,"error":"Permission denied"}` |
| DB write | 无 |
| ActivityLog | 无 |
| Verdict | ✅ PASS — interviewer 无 create 权限 |

---

## T6: POST /api/actions/:id/resolve valid → 200

| 字段 | 值 |
|------|-----|
| 角色 | admin |
| userId | cmqv2nfjo0007y3jxiwti2eer |
| 请求 | POST /api/actions/cmqv2w6gh000enejxywxha85d/resolve |
| Payload | `{"resolutionNote":"已���过猎头拓展3家新渠道，候选人池从3人扩充至8人，截止日期前完成任务。"}` |
| HTTP status | 200 |
| Response | `{"success":true,"data":{"status":"resolved","resolvedAt":"2026-06-26T..."}}` |
| DB write | action_items.status = "resolved", resolvedAt, resolutionNote 已更新 |
| ActivityLog | ACTION_RESOLVED 已写入 |
| Verdict | ✅ PASS |

---

## T7: POST /api/actions/:id/resolve missing note → 400

| 字段 | 值 |
|------|-----|
| 角色 | admin |
| userId | cmqv2nfjo0007y3jxiwti2eer |
| 请求 | POST /api/actions/:id/resolve |
| Payload | `{"resolutionNote":""}` |
| HTTP status | 400 |
| Response | `{"success":false,"error":"resolutionNote is required"}` |
| DB write | 无 |
| ActivityLog | 无 |
| Verdict | ✅ PASS |

---

## T8: POST /api/actions/:id/resolve duplicate → 409

| 字段 | 值 |
|------|-----|
| 角色 | admin |
| userId | cmqv2nfjo0007y3jxiwti2eer |
| 请求 | POST /api/actions/cmqv2w6gh000enejxywxha85d/resolve (重复) |
| Payload | `{"resolutionNote":"第二次尝试"}` |
| HTTP status | 409 |
| Response | `{"success":false,"error":"Action already resolved"}` |
| DB write | 无 |
| ActivityLog | 无 |
| Verdict | ✅ PASS |

---

## T9: POST /api/actions/:id/dismiss valid → 200

| 字段 | 值 |
|------|-----|
| 角色 | admin |
| userId | cmqv2nfjo0007y3jxiwti2eer |
| 请求 | POST /api/actions/cmqv2zy65000jnejxw8386iym/dismiss |
| Payload | `{"dismissedReason":"该问题已由线下业务沟通确认处理，不再需要系统跟踪。"}` |
| HTTP status | 200 |
| Response | `{"success":true,"data":{"status":"dismissed","dismissedReason":"..."}}` |
| DB write | action_items.status = "dismissed", dismissedReason 已更新 |
| ActivityLog | ACTION_DISMISSED 已写入 |
| Verdict | ✅ PASS |

---

## T10: POST /api/actions/:id/dismiss missing reason → 400

| 字段 | 值 |
|------|-----|
| 角色 | admin |
| userId | cmqv2nfjo0007y3jxiwti2eer |
| 请求 | POST /api/actions/:id/dismiss |
| Payload | `{"dismissedReason":""}` |
| HTTP status | 400 |
| Response | `{"success":false,"error":"dismissedReason is required"}` |
| DB write | 无 |
| ActivityLog | 无 |
| Verdict | ✅ PASS |

---

## ActivityLog Evidence 汇总

| 事件类型 | 验证状态 | 说明 |
|----------|---------|------|
| ACTION_CREATED | ✅ 已验证 | 创建 action 后 detail API 返回 activity 包含 ACTION_CREATED 记录 |
| ACTION_RESOLVED | ✅ 已验证 | 解决 action 后 detail API 返回 activity 包含 ACTION_CREATED + ACTION_RESOLVED 两条 |
| ACTION_DISMISSED | ✅ 已验证 | 忽略 action 后 detail API 返回 activity 包含 ACTION_CREATED + ACTION_DISMISSED 两条 |
| ACTION_UPDATED | ⚠️ 暂未测试 | update API 存在但本阶段不产生该事件（仅 PATCH status/priority 可能触发） |
| ACTION_GENERATED_BY_RULE | ⚠️ 暂未测试 | Rule Engine 在 Phase 7.3 完成，本次未触发规则生成 |

## 总结

| 指标 | 结果 |
|------|------|
| 总测试数 | 10 |
| 通过 | 10 |
| 失败 | 0 |
| Mock | 0 |
| ActivityLog 写入 | ACTION_CREATED / RESOLVED / DISMISSED 全部验证 |
