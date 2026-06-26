# Phase 7.4B — UI Review

## 自检清单

| 检查项 | 结果 | 说明 |
|--------|------|------|
| Drawer 是否能让 HR 3 秒内看懂 Action | 是 | 标题+状态+优先级在最顶部，下方分组展示基础信息/状态/责任人/时间 |
| Overview 是否展示完整处理信息 | 是 | 4 个分组：基础信息/处理状态/责任人与来源/时间信息 + 处理说明 |
| Linked Context 是否招聘语境化 | 是 | 岗位/候选人/投递/面试 4 种关联卡片，非 JSON 堆砌 |
| Activity 是否清晰留痕 | 是 | 时间线展示创建/解决/忽略事件，含操作者和时间 |
| Create Modal 是否简单可用 | 是 | 标题+分类+优先级，校验空标题，loading + error 状态 |
| Resolve Modal 是否强制填写处理说明 | 是 | resolutionNote 必填，空值校验 + placeholder 引导 |
| Dismiss Modal 是否强制填写忽略原因 | 是 | dismissedReason 必填，空值校验 + placeholder 引导 |
| 错误态是否隐藏技术细节 | 是 | 仅显示用户友好错误文案，无 stack trace |
| 权限态是否不泄露对象存在性 | 是 | 显示"暂无权限查看该行动"，不暴露对象数量或 owner |
| 是否像招聘 SaaS | 是 | 浅灰背景+白色Drawer+克制Badge+招聘语境关联对象 |
| 是否像普通任务管理器 | 否 | 关联对象展示候选人/岗位/面试，非通用 task |
| 是否像传统后台 | 否 | 无粗边框表格、无传统 CRUD 表单 |

## 参考来源

| 产品 | 学习的特征 | 落地 |
|------|----------|------|
| Linear | 右侧 Detail Panel | ActionDetailDrawer 右侧 600px |
| Greenhouse | 结构化评分展示 | Overview 分组展示（基础信息/状态/责任人/时间） |
| Attio | 关联对象卡片 | Linked Context 卡片式展示 |

## UI 问题与后续优化

- 7.4B 阶段 Drawer 宽度 600px 固定，未适配小屏（P2）
- Activity Tab 暂不支持分页/滚动加载（当前 action 数量少，P2）
- Create Modal 暂不支持关联对象选择器（job/candidate select），仅支持手动输入（P1，7.5 补）
