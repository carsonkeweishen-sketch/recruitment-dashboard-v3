# Phase 8.0 Foundation — Screenshot Index

> 日期：2026-06-27
> 环境：local PostgreSQL + Next.js dev server
> Mock：否 — 全部来自真实渲染
> 截图目录：screenshots/phase-8-foundation/

| # | 文件名 | 页面/状态 | 路由 | 验证内容 |
|---|--------|----------|------|---------|
| 1 | product-shell-navigation-grouped.png | Product Shell + 业务分组导航 | /actions | 左侧导航 6 组分组，无 permissions-debug，中文招聘语义命名 |
| 2 | product-shell-dashboard-entry.png | 招聘总览（空状态） | /dashboard | ModulePage 组件，成熟空状态文案 |
| 3 | action-center-with-product-shell.png | 风险行动中心（Product Shell 内） | /actions | /actions 在 Product Shell 中正常工作 |
| 4 | jobs-module-foundation-state.png | 岗位 | /jobs | 岗位页面使用 ProductShell + KpiCard |
| 5 | candidates-module-foundation-state.png | 候选人 | /candidates | 候选人页面使用 ProductShell + KpiCard |
| 6 | interviews-module-foundation-state.png | 面试管理 | /interviews | 面试页面使用 ProductShell + KpiCard |
| 7 | reports-module-foundation-state.png | 周报/复盘（空状态） | /reports | ModulePage 空状态 |
| 8 | knowledge-module-foundation-state.png | 知识库（空状态） | /knowledge | ModulePage 空状态 |
| 9 | settings-module-foundation-state.png | 设置（空状态） | /settings | ModulePage 空状态 |
| 10 | standard-empty-state.png | 标准空状态组件 | /actions（空筛选） | EmptyState 组件展示 |
| 11 | standard-permission-state.png | 标准权限拒绝组件 | /actions (interviewer) | PermissionState 组件展示 |
| 12 | standard-kpi-cards.png | 标准 KPI 卡片展示 | /jobs | KpiCard 组件在岗位页面展示 |
| 13 | design-system-component-sample.png | 设计系统组件总览 | /candidates | KpiCard + StatusBadge + ObjectChip + SectionCard 合集 |
| 14 | offer-risks-module-foundation-state.png | Offer 风险（空状态） | /offer-risks | ModulePage 空状态 |

## 验证清单

| 验证项 | 状态 |
|--------|------|
| 全部来自真实渲染 | ✅ |
| Mock: 否 | ✅ |
| 无测试感命名 | ✅ |
| 无 null/undefined/NaN/Invalid Date | ✅ |
| 无 raw JSON | ✅ |
| 无敏感信息泄露 | ✅ |
| 14 张 PNG 截图 | ✅ (2.2 MB) |
| 导航分组可见 | ✅ |
| 空状态文案统一 | ✅ |
