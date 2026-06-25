# UI / UX 设计规范

> 轻量 SaaS 风格，参考 Linear / Notion / Stripe。

## 设计原则

1. **清爽**：大量留白，低视觉噪音
2. **专业**：语义化颜色，克制装饰
3. **高效**：信息密度适中，操作路径短
4. **一致**：Design Token 驱动，禁止 hex 散落

## 布局

- Sidebar: 240px 固定左侧
- Topbar: 56px 固定顶部
- Content: 浅灰背景 `#f8fafc`，白色卡片 `#ffffff`

## 颜色系统

见 `app/globals.css` Design Token 定义。

## 字体

- 系统字体栈：Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- 中文字体：系统默认
- 代码：SF Mono, monospace

## 间距

- 页面间距: 24px (`p-6`)
- 卡片内边距: 20px (`p-5`)
- 组件间距: 12-16px

## 圆角

- 卡片/容器: `rounded-lg` (8px)
- 按钮/徽章: `rounded-md` (6px)
- 输入框: `rounded-md` (6px)

## 状态展示

- Loading: Skeleton 骨架屏
- Empty: 空状态插图 + 文案
- Error: 错误图标 + 重试按钮
- Permission Denied: 锁图标 + 说明文案

## 禁止

- 大屏驾驶舱风
- 政企后台风
- 军事化/作战风
- 复杂数据可视化（Phase 0 不涉及图表）
- 暗黑模式（Phase 12 再考虑）
