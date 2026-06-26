# Phase 8.0A Foundation Correction — Screenshot Index

> 日期：2026-06-27
> 环境：local PostgreSQL + Next.js dev server
> Mock：否 — 全部来自真实页面渲染

| # | 文件名 | 页面状态 | 角色 | URL | 验证内容 |
|---|--------|---------|------|-----|---------|
| 1 | standard-empty-state-real.png | 成熟空状态 | admin | /knowledge | "该模块正在接入招聘数据"，"当前可先通过招聘总览和风险行动中心查看核心招聘风险、待处理事项和行动闭环。" |
| 2 | standard-error-state-real.png | 错误状态 | admin | /jobs | 错误信息不含 Prisma/SQL/DATABASE_URL/stack trace |
| 3 | standard-permission-state-real.png | 权限拒绝 | interviewer | /settings | 不泄露对象存在性/归属人/数量/内部 ID |
| 4 | standard-loading-skeleton-real.png | 加载中 | admin | /jobs | KPI skeleton + 列表 skeleton 可见 |

## 验证清单

| 验证项 | 状态 |
|--------|------|
| 全部来自真实页面渲染 | ✅ |
| Mock: 否 | ✅ |
| 无 page.route 拦截 | ✅ |
| 空状态文案含"招聘总览" | ✅ |
| 错误态不暴露技术细节 | ✅ |
| 权限态不泄露对象信息 | ✅ |
| 加载态骨架屏可见 | ✅ |
| 4 张 PNG 截图 | ✅ |
