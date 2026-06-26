# Phase 7 — Action Center 当前状态 (Claude UX Review Input)

> 日期：2026-06-26
> 项目：Recruitment Dashboard v3 / 理然智能招聘 AI 看板
> 用途：供 Claude 进行 UX/UI Polish Review，为 CEO Demo 做准备

---

## 一、当前已完成页面

### 1.1 /actions — 行动中心首页
- URL: `/actions`
- 包含组件：ActionMetricsCards（KPI 卡片）、ActionFilterBar（筛选器）、ActionList（数据表格）、LoadingSkeleton / ErrorState / EmptyState / PermissionDenied
- KPI 卡片：待处理数、逾期数、高优先级数、今日到期数、平均关闭时长、按时关闭率
- 筛选器：状态（全部/待处理/处理中/已阻塞/已解决/已忽略）、优先级（全部/低/中/高/紧急）、分类（全部/反馈催办/面试跟进/候选人风险追问/岗位画像校准/业务反馈补充/Offer 风险跟进/流程卡点处理/数据质量修正/手动创建）、只看逾期 checkbox

### 1.2 Action Detail Drawer
- 600px 右侧抽屉
- 3 个 Tab：概览 / 关联信息 / 活动记录
- 底部 Footer：标记为已解决 / 忽略此行动（仅 open/in_progress/blocked 状态显示）
- 已解决/已忽略状态显示处理说明或忽略原因
- Escape 关闭、背景点击关闭

### 1.3 Overview Tab
- 4 个分组：基础信息（标题+描述）、处理状态（分类/状态/优先级/来源 4 格）、责任人与来源（负责人/创建人+来源说明）、时间信息（截止时间/创建时间）
- 逾期状态红色标注

### 1.4 Linked Context Tab
- 4 张信息卡片：关联岗位（岗位名称/编号）、关联候选人（姓名）、关联投递（阶段/候选人）、关联面试（轮次/面试官）
- 无关联时显示"暂无关联信息"

### 1.5 Activity Tab
- 时间线组件
- 数据来源：真实 ActivityLog（ACTION_CREATED / ACTION_RESOLVED / ACTION_DISMISSED）
- 显示：事件类型、时间、操作人、详情
- 无数据时显示"暂无操作记录"

### 1.6 Create Action Modal
- 表单字段：标题（必填）、描述、分类下拉、优先级下拉
- 验证：空标题 → 红色错误提示"标题不能为空"
- 成功后：绿色 Toast "行动已创建"，弹窗关闭，列表刷新

### 1.7 Resolve Action Modal
- 显示被解决的 Action 标题
- 必填字段：处理说明（最少 2 字）
- 成功后：绿色 Toast "行动已标记为已解决"

### 1.8 Dismiss Action Modal
- 显示被忽略的 Action 标题
- 必填字段：忽略原因（最少 2 字）
- 成功后：绿色 Toast "行动已忽略"

### 1.9 状态页面
- Loading：骨架屏动画
- Empty：空状态提示
- Error：错误提示 + 重试按钮
- Permission Denied：权限拒绝提示

---

## 二、当前技术边界

- ✅ 使用真实 GET/POST API（GET /api/actions, GET /api/actions/:id, POST /api/actions, POST /api/actions/:id/resolve, POST /api/actions/:id/dismiss）
- ✅ Activity 来自真实 ActivityLog（activity_logs 表）
- ✅ 不使用 page.route mock 作为 Evidence
- ✅ 不使用前端静态 activity 数组
- ✅ 不接 AI / Moka / 飞书
- ✅ 不进入 Phase 7.5（不做 Job/Candidate Detail Actions Tab）
- ✅ API → Service → Repository → Prisma 四层架构
- ✅ 6-role Scope Guardrail 权限控制
- ✅ 10 条 API Evidence 全部通过

---

## 三、当前截图（真实 API）

所有截图目录：`screenshots/phase-7.4b-real/`

| # | 文件名 | 页面状态 |
|---|--------|---------|
| 1 | action-list-main-real-api.png | Action List 主页面 |
| 2 | action-detail-drawer-overview-real-api.png | Drawer Overview Tab |
| 3 | action-detail-drawer-linked-context-real-api.png | Drawer Linked Context Tab |
| 4 | action-detail-drawer-activity-real-api.png | Drawer Activity Tab |
| 5 | action-detail-drawer-loading.png | Drawer Loading |
| 6 | action-detail-drawer-permission-denied-real-api.png | Permission Denied |
| 7 | create-action-modal.png | Create Modal 空表单 |
| 8 | create-action-validation-error.png | Create Validation Error |
| 9 | create-action-success-real-api.png | Create Success Toast |
| 10 | resolve-action-success-real-api.png | Resolve Success Toast |
| 11 | dismiss-action-success-real-api.png | Dismiss Success Toast |
| 12 | activity-after-resolve-or-dismiss-real-api.png | Activity after resolve/dismiss |

---

## 四、当前需要 Claude 重点 Review 的问题

### 4.1 页面定位
- 这个页面看起来像招聘 SaaS 还是普通任务管理器？
- CEO 3 秒扫一眼能不能理解这个页面的核心价值？
- 首屏是否过于"任务列表化"而缺乏招聘领域语义？

### 4.2 KPI 卡片
- "待处理 3" 是否有业务含义？还是纯粹的数字？
- KPI 是否需要分层（招聘流程健康度 vs 行动项统计）？
- 是否需要更多招聘领域 KPI（如 SLA 达标率、反馈逾期率）？

### 4.3 Action List
- 列表是否清晰区分风险优先级？
- 逾期/高优 Action 是否足够醒目？
- "分类"列是否有实际业务价值，还是干扰信息？
- 关联对象列的可读性（当前格式："姓名 · 岗位名 · 轮次 · 面试官"）

### 4.4 Detail Drawer
- Drawer 打开后，能否快速理解"为什么这个 Action 存在"？
- Overview Tab 的信息分组是否合理？
- Linked Context 是否能让人理解岗位/候选人/面试/反馈之间的关系？
- Activity Tab 的事件文案是否专业、可复盘？

### 4.5 操作 Modal
- Create Modal 是否过于通用？是否需要引导用户选择"Action 类型"？
- Resolve/Dismiss Modal 是否让 CEO 产生"操作不可逆"的顾虑？
- Toast 提示是否提供足够反馈？

### 4.6 文案
- 当前中文文案是否专业克制？
- 是否有地方暴露技术字段名（raw ID, enum key 等）？
- 空状态、错误状态的文案是否有帮助性？

---

## 五、当前文案清单

### 页面标题
- 页面标题: "行动中心"
- 副标题: "集中处理招聘过程中的待办、风险跟进和跨角色协同事项"

### 操作按钮
- 创建 Action / 生成规则 Action（disabled）

### 筛选器
- 状态: 全部 / 待处理 / 处理中 / 已阻塞 / 已解决 / 已忽略
- 优先级: 全部 / 低 / 中 / 高 / 紧急
- 分类: 全部 / 反馈催办 / 面试跟进 / 候选人风险追问 / 岗位画像校准 / 业务反馈补充 / Offer 风险跟进 / 流程卡点处理 / 数据质量修正 / 手动创建

### 列表表头
- 行动项 / 分类 / 优先级 / 状态 / 负责人 / 关联对象 / 来源 / 截止/更新

### KPI 卡片
- 待处理 / 正常 / 逾期 / 高优先级 / 今日到期 / 平均关闭时长 / 按时关闭率

### Drawer
- 概览 / 关联信息 / 活动记录
- 标记为已解决 / 忽略此行动
- 基础信息 / 处理状态 / 责任人与来源 / 时间信息

### Modal
- 创建行动项
- 标记为已解决 → 处理说明
- 忽略此行动 → 忽略原因

### 状态文案
- 暂无操作记录
- 暂无关联信息
- 暂无详细描述
- 当前没有待处理行动
- 标题不能为空
- 操作失败，请稍后重试

---

## 六、演示数据需求

CEO Demo 需要一组脱敏但真实业务语义强的演示数据，覆盖：
- 业务面反馈逾期
- 候选人风险追问
- 面试反馈催办
- 岗位流程卡点
- Offer 风险
- 手动创建
- 已解决 / 已忽略各至少 1 条
- 完整关联链（Job → Candidate → Application → Interview）

---

## 七、参考截图路径

```
screenshots/phase-7.4b-real/
├── action-list-main-real-api.png
├── action-detail-drawer-overview-real-api.png
├── action-detail-drawer-linked-context-real-api.png
├── action-detail-drawer-activity-real-api.png
├── action-detail-drawer-loading.png
├── action-detail-drawer-permission-denied-real-api.png
├── create-action-modal.png
├── create-action-validation-error.png
├── create-action-success-real-api.png
├── resolve-action-success-real-api.png
├── dismiss-action-success-real-api.png
└── activity-after-resolve-or-dismiss-real-api.png
```
