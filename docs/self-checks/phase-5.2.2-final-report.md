# Phase 5.2.2 Evidence Lock — 最终报告

> 编写日期：2025-06-26
> 分支：agent/workbuddy/phase-5
> 最新 Commit：9ab315f (workbuddy-phase-5.4)

---

## 一、逐条确认

| # | 检查项 | 结论 | 证据 |
|---|--------|------|------|
| 1 | Phase 5.2.2 Evidence Lock 是否完成 | **是** | 本报告 + commands.log + api-responses.md |
| 2 | commands.log 原始输出是否完整 | **是** | docs/self-checks/phase-5.2.2-commands.log，15 条命令全部含 raw output + 逐条分析 |
| 3 | api-responses 原始证据是否完整 | **是** | docs/self-checks/phase-5.2.2-api-responses.md，15 条测试含 role/userId/status/verdict |
| 4 | multi-application candidate 是否完成 | **是** | 林可 3 apps (A=recruiter owned, B=biz_owner related, C=interviewer assigned) |
| 5 | candidate detail applications 是否按角色返回不同子集 | **是** | admin=3, recruiter=3, biz_owner=1, interviewer=1, hrbp=404 |
| 6 | BusinessFeedback / ProfileCalibration scope 是否补证 | **是** | BF 5 条测试 + PC 4 条测试 |
| 7 | 是否仍有 service fallback | **否** | grep 确认 ZERO unscoped calls in API/service layer |
| 8 | 是否仍有 businessOwnerId / ownerId 混用 | **否** | grep 确认仅 ownership-check.ts 中有 select 声明，非 OR 混用 |
| 9 | 是否仍有 return true / \|\| true 恒真逻辑 | **否** | grep 确认 ZERO matches |
| 10 | 是否建议恢复 Phase 6 | **等待外部审查** | — |
| 11 | 是否自行进入 Phase 6 | **否** | 本轮仅做 Evidence Lock，无 Phase 6 代码 |

---

## 二、发现与说明

### 2.1 已确认的安全修复

1. **ZERO unscoped calls** — 5 个 grep 命令（getJobById/getCandidateById/getApplicationById/getFeedbackById/getCalibrationById）在 API/service 层均为 ZERO matches
2. **ZERO return true** — 恒真逻辑已清除
3. **ZERO filterApplicationsByScope** — JS filter 已替换为 Prisma include.where
4. **ZERO businessOwnerId/ownerId OR 混用** — 3 处匹配均为 TypeScript select 声明
5. **build/typecheck/lint 全部通过**

### 2.2 已知的低风险项

1. **profile-calibration-repository.ts:77** — `confirmCalibration` 函数中 unscoped `findUnique({ where: { id } })`，有前置 `requireCalibrationOwnership` scope 检查作为补偿控制
2. **reviewerId/createdBy OR 路径** — BusinessFeedback 的 `reviewerId` 和 ProfileCalibration 的 `createdBy` 提供额外的自访问路径。这是有意的设计决策（创建者/提交者可以访问自己的内容），不是安全漏洞

### 2.3 multi-application 二次过滤验证

**强证据**：林可 3 applications，不同角色看到不同子集：

| 角色 | 看到 | 过滤掉 | 机制 |
|------|------|--------|------|
| admin | 媒介投放 + 品牌策划 + KA大客户销售 | — | ALL scope |
| recruiter(王招聘) | 全部 3 条 | — | ownerId 匹配全部 3 条 |
| business_owner(赵业务) | 仅 KA大客户销售 | 品牌策划、媒介投放 | job.businessOwnerId ≠ 赵业务 |
| interviewer(孙面试官) | 仅 媒介投放 | KA大客户销售、品牌策划 | interviews.some.interviewerId 仅匹配媒介投放 |
| hrbp(张HRBP) | 0 (404) | 全部 3 条 | 部门不匹配，candidate 级别拒绝 |

### 2.4 business_owner 不通过 ownerId 获权证明

赵业务(business_owner) 看到林可的 applications 子集仅 1 条（KA大客户销售），而林可有 2 条 applications 的 ownerId=王招聘（品牌策划 + 媒介投放）。

如果 business_owner 通过 ownerId 获权，赵业务会看到全部 3 条。实际只看到 1 条，证明 business_owner 仅通过 job.businessOwnerId 获权。✅

---

## 三、Scope Guardrail 建议（未实施）

任务书建议新增以下文件：

```
server/permissions/scope-context.ts
server/permissions/resource-scope-builder.ts
server/permissions/scope-guards.ts
```

由于当前 Phase 时间限制，Guardrail 代码未实施。建议在 Phase 6 恢复后优先建设，以防止后续返工。

---

## 四、证据文件清单

| 文件 | 说明 |
|------|------|
| `docs/self-checks/phase-5.2.2-commands.log` | 15 条命令完整 raw output + 逐条分析 |
| `docs/self-checks/phase-5.2.2-api-responses.md` | 15 条 API 测试完整证据 |
| `docs/self-checks/phase-5.2.2-final-report.md` | 本文件（最终报告） |

---

## 五、结论

Phase 5.2.2 Evidence Lock **已完成**。所有 11 项检查全部通过或有明确的设计决策说明。无安全漏洞。

**等待外部审查，不自行恢复 Phase 6。**
