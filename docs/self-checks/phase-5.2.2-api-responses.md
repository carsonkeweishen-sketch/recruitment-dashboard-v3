# Phase 5.2.2 Final Hotfix — API Response Evidence

> 执行时间：2025-06-26
> 测试服务器：Next.js dev @ localhost:3456
> Session Cookie：rd_dev_role / rd_dev_user_id / rd_dev_dept_id

---

## 修复 1：profileCalibration unscoped findUnique 清零

### TEST 1.1: 赵业务 confirm calibration (createdBy but no job scope)

```text
role: business_owner
userId: cmqt44zdc0008zyqh6dao7vbr (赵业务)
departmentId: cmqt44z9o0002zyqhl63hcpu6
request: PATCH /api/profile-calibrations/cmqueaee70000cvpfqzi0rzk7
payload: {"status":"confirmed"}
HTTP status: 403
response summary: { success: false, error: "Permission denied: you must be the business owner of this job to confirm calibrations" }
DB write: no
ActivityLog: no
verdict: ✅ 赵业务通过 createdBy 可以 read，但不能 confirm。confirm 需要 job-level bizOwner scope。
```

### TEST 1.2: 陈总(admin) confirm calibration (already confirmed)

```text
role: admin
userId: cmqt44zav0004zyqhbtt0lfha (陈总)
request: PATCH /api/profile-calibrations/cmqueaee70000cvpfqzi0rzk7
payload: {"status":"confirmed"}
HTTP status: 409
response summary: { success: false, error: "Calibration already confirmed" }
DB write: no
ActivityLog: no
verdict: ✅ admin 有权 confirm，但状态已是 confirmed，正确返回 409。
```

---

## 修复 2：Self Access Policy API Evidence

### TEST 2.1: 赵业务 self feedback (reviewerId match)

```text
role: business_owner
userId: cmqt44zdc0008zyqh6dao7vbr (赵业务)
request: GET /api/business-feedback/cmqt44zin0014zyqhj2nq8uvw
HTTP status: 200
response summary: { success: true }
why visible: reviewerId=赵业务 AND job.businessOwnerId=赵业务 (双重匹配)
verdict: ✅ Self feedback access works.
```

### TEST 2.2: 赵业务 unrelated feedback (NOT reviewer, NOT bizOwner)

```text
role: business_owner
userId: cmqt44zdc0008zyqh6dao7vbr (赵业务)
request: GET /api/business-feedback/cmquet59l0000x4pfy1drb1x0
  (feedback on 媒介投放, reviewer=陈总, bizOwner=孙面试官)
HTTP status: 404
response summary: { success: false, error: "Not found" }
why denied: reviewerId≠赵业务 AND job.businessOwnerId≠赵业务
verdict: ✅ Truly unrelated feedback correctly denied (404).
```

### TEST 2.3: 赵业务 self calibration (createdBy match)

```text
role: business_owner
userId: cmqt44zdc0008zyqh6dao7vbr (赵业务)
request: GET /api/profile-calibrations/cmqueaee70000cvpfqzi0rzk7
HTTP status: 200
response summary: { success: true }
why visible: createdBy=赵业务 (自访问路径)
verdict: ✅ Self calibration access works.
```

### TEST 2.4: 赵业务 confirm calibration (createdBy but no job scope)

```text
role: business_owner
userId: cmqt44zdc0008zyqh6dao7vbr (赵业务)
request: PATCH /api/profile-calibrations/cmqueaee70000cvpfqzi0rzk7
HTTP status: 403
response summary: { success: false, error: "Permission denied: you must be the business owner of this job to confirm calibrations" }
why denied: createdBy 路径不允许 confirm — confirm 需要 job-level bizOwner scope
verdict: ✅ Confirm gated by job scope, not just createdBy.
```

---

## Summary

| # | Test | Expected | Actual | Pass |
|---|------|----------|--------|------|
| 1.1 | biz_owner confirm (createdBy, no job scope) | 403 | 403 | ✅ |
| 1.2 | admin confirm (already confirmed) | 409 | 409 | ✅ |
| 2.1 | biz_owner self feedback (reviewerId) | 200 | 200 | ✅ |
| 2.2 | biz_owner unrelated feedback (not reviewer, not bizOwner) | 404 | 404 | ✅ |
| 2.3 | biz_owner self calibration (createdBy) | 200 | 200 | ✅ |
| 2.4 | biz_owner confirm (createdBy, no job scope) | 403 | 403 | ✅ |
