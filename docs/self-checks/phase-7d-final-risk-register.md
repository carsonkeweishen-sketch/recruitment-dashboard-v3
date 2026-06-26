# Phase 7.D-Final Lock — Risk Register

> 日期：2026-06-27

## 演示风险矩阵

| # | 风险 | 概率 | 影响 | 缓解措施 | 状态 |
|---|------|------|------|---------|------|
| R1 | DB 连接断开导致 API 超时 | 低 | 高 | 本地 PostgreSQL，演示前确认 pg_isready | ✅ 已缓解 |
| R2 | 浏览器缓存导致旧 UI 显示 | 中 | 中 | 演示前清除缓存或使用无痕模式 | ✅ 已记录 |
| R3 | 演示数据被上轮操作改变（如 resolve 了关键 action） | 高 | 中 | 演示前重新 seed DB，固定主路径 Action | ✅ 已记录 |
| R4 | 权限 cookie 过期或未设置 | 中 | 高 | 演示前在浏览器 console 设置 cookie | ✅ 已记录 |
| R5 | 网络波动导致页面加载慢 | 低 | 低 | 本地环境，无外部依赖 | ✅ |
| R6 | 截图与实际页面不一致 | 低 | 中 | 截图来自真实 API，与演示环境一致 | ✅ |
| R7 | CEO 点击非主路径功能 | 中 | 低 | Demo Script 限定路径，主持人引导 | ✅ 已记录 |

## 演示前必须执行

详见 **`docs/demo/CEO_DEMO_RESET_RUNBOOK.md`**（完整重置步骤 + 验证清单）。

> ⚠️ Cookie 注入步骤已移至 **`docs/demo/CEO_DEMO_PRIVATE_RUNBOOK.md`**（私密文档）。

快速摘要：
1. 确认 PostgreSQL 运行：`pg_isready`
2. 重置 + Seed：`NODE_OPTIONS="" npx prisma db push --force-reset --accept-data-loss && NODE_OPTIONS="" npx tsx prisma/seed.ts`
3. 启动 dev server：`NODE_OPTIONS="" pnpm dev`
4. Cookie 注入：见私密运维手册

## 回退方案

如果演示现场出现严重问题：
1. 使用截图作为备选（14 张 Final Lock 截图完整）
2. Word 自检报告包含全部截图可离线展示
3. 核心价值可以通过截图 + 口述传达
