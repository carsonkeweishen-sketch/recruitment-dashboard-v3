# Phase 5.2.2 Final Hotfix — 最终报告

> 日期：2025-06-26
> 分支：agent/workbuddy/phase-5

---

## 0. Executive Summary

| 项目 | 内容 |
|------|------|
| Phase 名称 | Phase 5.2.2 Final Hotfix |
| 当前分支 | agent/workbuddy/phase-5 |
| 是否完成 | 是 |
| 是否建议进入下一 Phase | 等待外部审查 |
| 是否自行进入下一 Phase | 否 |
| 是否合并 main | 否 |
| 是否 force push | 否 |

---

## 修复 1：profileCalibration unscoped findUnique 清零

- 删除了 `confirmCalibration` 中的 `findUnique({ where: { id } })`
- 改为 scoped `updateMany` + scope WHERE clause
- `confirmCalibrationAction` 传入 scope 参数
- grep 验证：ZERO `findUnique({ where: { id })` 在 profile-calibration-repository 的权限路径中
- ownership-check.ts 中的 findUnique 是 guard 内部数据读取，非业务数据返回路径

## 修复 2：Self Access Policy 明确

- 新增 `docs/design/SELF_ACCESS_POLICY.md`
- 明确定义 reviewerId 自访问和 createdBy 自访问的边界
- `requireCalibrationOwnership` 增加 `action` 参数："read" 允许 createdBy 自访问，"confirm" 需要 job-level bizOwner scope
- 补 6 条 API evidence（self access 200, unrelated 404, confirm gated 403）

## 修复 3：截图目录统一

- 截图目录从 `screenshots/phase-5.2.3/` 改为 `screenshots/phase-5.2.2/`

---

## 最终结论

| 项目 | 结论 |
|------|------|
| Phase 5.2.2 Final Hotfix 是否完成 | 是 |
| profileCalibration unscoped findUnique 是否清零 | 是 |
| Self Access Policy 是否明确 | 是 |
| Self Access 是否有 API evidence | 是 |
| 截图目录是否统一 | 是 |
| 是否建议恢复 Phase 6 | 等待外部审查 |
| 是否自行进入 Phase 6 | 否 |
| 当前风险 | Scope Guardrail 未实施（建议 Phase 6 前补） |
| 需要外部确认 | Evidence Lock 是否通过？是否可恢复 Phase 6？ |
