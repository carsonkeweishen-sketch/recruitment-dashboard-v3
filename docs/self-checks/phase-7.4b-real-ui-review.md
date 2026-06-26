# Phase 7.4B-P0 — Real Evidence UI Review

> 日期：2026-06-26

## UI 组件清单

| 组件 | 文件 | 状态 |
|------|------|------|
| ActionDetailDrawer | components/domain/actions/ActionDetailDrawer.tsx | ✅ 完成 |
| ActionDetailOverview | components/domain/actions/ActionDetailOverview.tsx | ✅ 完成 |
| ActionLinkedContextPanel | components/domain/actions/ActionLinkedContextPanel.tsx | ✅ 完成 |
| ActionActivityTimeline | components/domain/actions/ActionActivityTimeline.tsx | ✅ 完成（真实 ActivityLog 渲染） |
| CreateActionModal | components/domain/actions/CreateActionModal.tsx | ✅ 完成 |
| ResolveActionModal | components/domain/actions/ResolveActionModal.tsx | ✅ 完成 |
| DismissActionModal | components/domain/actions/DismissActionModal.tsx | ✅ 完成 |
| ActionList | components/domain/actions/ActionList.tsx | ✅ 完成 |
| ActionMetricsCards | components/domain/actions/ActionMetricsCards.tsx | ✅ 完成 |
| ActionFilterBar | components/domain/actions/ActionFilterBar.tsx | ✅ 完成 |

## P0 修复验证

| P0 项 | 状态 | 说明 |
|-------|------|------|
| P0-1: 取消 page.route mock | ✅ | 截图脚本无 mock，所有 API 调用真实 |
| P0-2: Activity 来自真实 ActivityLog | ✅ | ActionActivityTimeline 仅渲染 API 返回的 activity[] |
| P0-3: 无前端静态 activity | ✅ | 无 `const events = []` 或硬编码数据 |
| P0-4: 无数据时显示"暂无操作记录" | ✅ | activity === null 或 [] 时展示 |
| P0-5: Create/Resolve/Dismiss 写入 ActivityLog | ✅ | ACTION_CREATED / RESOLVED / DISMISSED 全部验证 |
| P0-6: detail API 返回 activity | ✅ | getActionByIdWithScope 联表查询 ActivityLog |

## 交互验证

| 交互 | 状态 |
|------|------|
| 行点击 → Drawer 打开 | ✅ |
| Drawer Escape 关闭 | ✅ |
| Drawer 背景点击关闭 | ✅ |
| Tab 切换（概览/关联信息/活动记录）| ✅ |
| 创建按钮 → Modal 弹出 | ✅ |
| 创建验证错误（空标题）| ✅ |
| 创建成功 → Toast + 列表刷新 | ✅ |
| 解决按钮 → Resolve Modal | ✅ |
| 解决成功 → Toast + Drawer 关闭 | ✅ |
| 忽略按钮 → Dismiss Modal | ✅ |
| 忽略成功 → Toast + Drawer 关闭 | ✅ |
