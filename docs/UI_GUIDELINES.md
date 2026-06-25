# UI / UX 设计规范

> Recruitment Dashboard v3 长期视觉标准。后续所有 Phase 必须遵守。

## 设计方向

参考 Task Management Web App UI Kit 的产品风格（Linear / Notion / Stripe 流派），深度借鉴其设计语言，但不复制品牌资产。

### 可以学习的设计特征

1. 左侧固定 Sidebar
2. 顶部 Topbar（含搜索框、用户头像/角色区域）
3. 浅灰页面背景
4. 白色圆角卡片 + 轻阴影
5. 大量留白
6. KPI 数字卡片
7. 分区卡片
8. 任务列表式信息组织
9. 状态标签
10. 右侧 Drawer / 详情面板
11. Modal 弹窗
12. Timeline / Activity Feed
13. Step / Popup 场景
14. 清爽、轻、专业，不像传统后台

### 禁止复制

- Superpage Logo / 品牌名
- 原始头像素材
- 英文任务管理文案
- 原 UI Kit 图标资产
- 完整逐像素布局
- 任何未经授权的设计资产

参考图片存放于 `private-data/ui-reference/`（已 gitignore）。

## 招聘业务映射

将参考 UI 的任务管理语义转换为招聘业务语义：

| 参考设计 | 招聘系统落地 |
|----------|-------------|
| Task Home | 招聘工作台 / Workbench |
| Dashboard | 招聘效率看板 |
| Teams | 部门 / 角色管理 |
| Boards | 岗位管理 |
| Inbox | 待处理事项 / Action Center |
| Timeline | 招聘动态 / ActivityLog |
| Task Card | ActionItem |
| Announcement | 风险提醒 / 面试质量提醒 / Offer 风险提醒 |
| Popup | 面试反馈 / 导入确认 / AI 结果确认 |
| Detail Panel | 候选人详情 / 岗位详情 / Offer 风险详情 |

## 全局 UI 标准

### 布局

- Sidebar: 240px 固定左侧
- Topbar: 56px 固定顶部
- Content: 浅灰背景 `#f8fafc`，白色卡片 `#ffffff`

### 颜色系统

见 `app/globals.css` Design Token 定义。禁止业务页面新增 hex。

### 字体

- 系统字体栈：Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### 间距

- 页面间距: 24px (`p-6`)
- 卡片内边距: 20px (`p-5`)
- 组件间距: 12-16px

### 圆角

- 卡片/容器: `rounded-lg` (8px)
- 按钮/徽章: `rounded-md` (6px)
- 输入框: `rounded-md` (6px)

### 状态展示

- Loading: Skeleton 骨架屏
- Empty: 空状态插图 + 文案
- Error: 错误图标 + 重试按钮
- Permission Denied: 锁图标 + 说明文案

### 强制规则

1. 每个页面只突出 1 个主目标
2. 每个按钮只做 1 个动作
3. 表格不要拥挤
4. 不做大屏驾驶舱
5. 不做政企后台
6. 不做军事化文案
7. 不出现 raw JSON
8. 不出现 undefined / null / NaN / Invalid Date

## 后续页面落地要求

### Workbench（类似 Task Home）
- 欢迎区
- 核心 KPI
- 我的待办
- 面试质量提醒
- Offer 风险提醒
- 最近动态

### Actions（类似任务列表）
- KPI
- 筛选
- Action 列表 + 状态标签
- 右侧 DetailDrawer
- ActivityTimeline

### Reports（类似 Dashboard + Feed）
- 周报 KPI
- 岗位卡点
- 面试质量
- Offer 风险
- AI 使用摘要
- 历史报告列表

### Imports（流程型工具）
- StepIndicator
- 上传
- 字段映射
- 校验
- 确认导入

### Applications（高密度详情页）
- 候选人基础信息
- 投递记录
- 面试记录
- AI 分析
- Offer 风险
- ActivityLog
- 使用 Drawer / Tabs / SectionCard 管理信息密度

## 自检要求

从 Phase 3（涉及 UI 的 Phase）开始，自检报告必须包含 **UI Reference Landing 表**：

| 参考设计特征 | 招聘系统落地页面/组件 | 截图 |
|-------------|---------------------|------|
| KPI 数字卡片 | Workbench MetricCard | workbench-kpi.png |
| 任务列表 | Actions DataTable | actions-list.png |
| 右侧详情面板 | Application Drawer | application-drawer.png |
| 弹窗 | FormModal | interview-feedback-modal.png |
| 时间线 | ActivityTimeline | candidate-activity.png |

## 禁止

- 暗黑模式（Phase 12 再考虑）
- 大屏驾驶舱风
- 政企后台风
- 军事化/作战风
- 复杂数据可视化（Phase 0 不涉及图表）
