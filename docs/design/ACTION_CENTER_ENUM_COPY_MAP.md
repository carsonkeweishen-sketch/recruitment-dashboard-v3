# Action Center Enum Copy Map

> 中文文案 + Badge 规则 + 状态颜色
> Claude UX Spec 到达后以 Claude + 外部 Review 口径为准

---

## 1. ActionStatus

| 值 | 中文 | Badge 颜色 | 说明 |
|----|------|-----------|------|
| open | 待处理 | 蓝色 (primary) | 新建未开始 |
| in_progress | 处理中 | 橙色 (warning) | 已开始处理 |
| blocked | 阻塞 | 红色 (danger) | 等待外部条件 |
| resolved | 已解决 | 绿色 (success) | 已关闭 |
| dismissed | 已忽略 | 灰色 (tertiary) | 不处理 |

---

## 2. ActionPriority

| 值 | 中文 | Badge 颜色 | 排序权重 |
|----|------|-----------|---------|
| urgent | 紧急 | 红色 (danger) | 1 |
| high | 高 | 橙色 (warning) | 2 |
| medium | 中 | 蓝色 (primary-light) | 3 |
| low | 低 | 灰色 (tertiary) | 4 |

---

## 3. ActionCategory

| 值 | 中文 | 说明 |
|----|------|------|
| feedback_followup | 反馈催办 | 面试后未提交反馈 |
| interview_followup | 面试跟进 | 面试后续推进 |
| candidate_risk_followup | 候选人风险追问 | 面试信号风险跟进 |
| job_calibration | 岗位画像校准 | 画像需要调整 |
| business_feedback | 业务反馈补充 | 业务方反馈待处理 |
| offer_risk | Offer 风险跟进 | Offer 阶段风险 |
| process_blocker | 流程卡点 | 招聘流程阻塞 |
| data_quality | 数据质量修正 | 数据问题修正 |
| manual | 手动创建 | 人工创建的待办 |

---

## 4. ActionSourceType

| 值 | 中文 | 说明 |
|----|------|------|
| manual | 手动创建 | |
| interview_feedback | 面试反馈 | 来自面试反馈事件 |
| interview_risk_signal | 面试风险信号 | 来自风险检测 |
| feedback_quality | 反馈质量 | 来自质量评分 |
| business_feedback | 业务反馈 | 来自业务反馈 |
| profile_calibration | 画像校准 | 来自画像校准 |
| job_pipeline | 岗位管道 | 来自岗位招聘状态 |
| candidate_application | 候选人投递 | 来自投递状态 |
| offer_risk | Offer 风险 | 来自 Offer 风险评估 |
| system_rule | 系统规则 | 来自规则引擎 |
| future_ai | AI 建议 | Phase 10 保留字段 |

---

## 5. 空状态文案

| 场景 | 标题 | 描述 |
|------|------|------|
| 无 Action | 暂无待处理事项 | 当前没有需要跟进的招聘动作 |
| 筛选无结果 | 没有匹配的行动项 | 尝试调整筛选条件 |
| 规则生成无结果 | 未发现需要自动创建的行动项 | 当前数据中未检测到需要系统自动生成的待办 |

---

## 6. 错误状态文案

| 场景 | 文案 |
|------|------|
| 加载失败 | 加载行动项失败，请稍后重试 |
| 创建失败 | 创建行动项失败，请检查必填字段 |
| 更新失败 | 更新行动项失败 |
| 关闭失败 | 关闭行动项失败 |
| 忽略失败 | 忽略行动项失败 |

---

## 7. 权限不足文案

| 场景 | 文案 |
|------|------|
| 无查看权限 | 你无权查看此行动项 |
| 无创建权限 | 你无权创建行动项 |
| 无更新权限 | 你无权更新此行动项 |
| 无关闭权限 | 你无权关闭此行动项 |

---

## 8. 操作按钮文案

| 操作 | 文案 |
|------|------|
| 创建 Action | 创建行动项 |
| 编辑 Action | 编辑 |
| 关闭 Action | 标记为已解决 |
| 忽略 Action | 忽略 |
| 生成 Action | 生成行动项 |
| 查看详情 | 查看 |
| 刷新列表 | 刷新 |

---

## 9. 页面文案

| 元素 | 文案 |
|------|------|
| 页面标题 | 行动中心 |
| 页面副标题 | 集中处理招聘过程中的待办、风险跟进和跨角色协同事项 |
| KPI-待处理 | 待处理 |
| KPI-逾期 | 逾期 |
| KPI-高优先级 | 高优先级 |
| KPI-今日到期 | 今日到期 |
| KPI-平均关闭时长 | 平均关闭时长 |
| KPI-按时关闭率 | 按时关闭率 |
| 筛选-状态 | 状态 |
| 筛选-优先级 | 优先级 |
| 筛选-分类 | 分类 |
| 筛选-负责人 | 负责人 |
| 筛选-逾期 | 只看逾期 |
| Drawer-概览 | 概览 |
| Drawer-关联上下文 | 关联信息 |
| Drawer-活动 | 活动记录 |
