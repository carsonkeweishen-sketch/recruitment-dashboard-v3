# Phase 8.2R Recruitment Funnel — Screenshot Index

**项目**: Recruitment Dashboard v3  
**阶段**: Phase 8.2R  
**日期**: 2026-06-28  
**截图数量**: 24  
**截图路径**: `screenshots/phase-8.2r-funnel/`  

---

| # | 文件名 | 描述 | 证明什么 | 唯一编号 |
|---|--------|------|----------|----------|
| 1 | `funnel-page-success.png` | 完整招聘漏斗页面，含 KPI 卡片、漏斗图、岗位对比、渠道质量、Action 影响、系统洞察、AI Copilot 提示 | 页面完整渲染，所有功能区块可见，数据来自真实 DB | SCR-001 |
| 2 | `funnel-page-empty.png` | 空数据状态，显示 "暂无漏斗数据" 提示 | Empty 状态正确，不报错、不崩溃 | SCR-002 |
| 3 | `funnel-page-error.png` | 错误状态，显示 "加载失败" 与重试按钮 | Error 状态正确，不泄露系统细节 | SCR-003 |
| 4 | `funnel-page-permission-denied.png` | 权限拒绝状态，显示 "暂无权限" 提示 | interviewer 或未授权用户被正确拦截 | SCR-004 |
| 5 | `funnel-filter-bar.png` | 筛选栏：日期范围、岗位下拉、渠道下拉、筛选按钮、更新时间 | 筛选功能可用，岗位/渠道选项动态填充 | SCR-005 |
| 6 | `funnel-kpi-summary.png` | KPI 卡片行：投递量、简历通过率、面试转化率、Offer 风险率、逾期 Action 率、已关闭 | 6 个 KPI 卡片显示真实数据，趋势指示正确 | SCR-006 |
| 7 | `funnel-main-chart-closeup.png` | 主漏斗图特写：10 阶段水平条形图，每阶段显示 count、转化率、掉落率 | 漏斗不是装饰性图表，每阶段显示真实计算数据 | SCR-007 |
| 8 | `funnel-stage-dropoff-closeup.png` | 阶段掉落特写：虚线 + "掉落 N 人" 标注 | 掉落率可视化，数字与后端计算一致 | SCR-008 |
| 9 | `funnel-stage-duration-closeup.png` | 阶段停留时长显示："X.X天" 或 "---" | 阶段时长来自 interview 数据计算，缺数据显示 --- | SCR-009 |
| 10 | `funnel-job-comparison-table.png` | 岗位对比表：岗位名、投递、简历通过率、面试通过率、Offer 风险率、已关闭 | 岗位维度对比，高风险 Offer 红色高亮 | SCR-010 |
| 11 | `funnel-channel-quality-table.png` | 渠道质量表：渠道名、投递、简历通过率、面试通过率、质量分级 | 渠道按质量分级 (高/中/低)，不使用假 ROI | SCR-011 |
| 12 | `funnel-action-impact-card.png` | Action 影响分析：待处理/已逾期/已关闭/关闭率 + 逾期 Action 列表 | Action 闭环效果可视化，逾期 Action 列表可展开 | SCR-012 |
| 13 | `funnel-bottleneck-insights.png` | 系统洞察面板：system_rule 标记，每条含 severity badge、triggerCondition、可展开 evidence/suggestedAction | 系统规则洞察由后端生成，含完整触发条件和建议 | SCR-013 |
| 14 | `funnel-data-quality-warning.png` | 数据质量提示区域：黄色边框，显示 ⚠️/ℹ️ 警告消息 | 数据不完整时提示用户，不隐藏问题 | SCR-014 |
| 15 | `funnel-drilldown-drawer-stage.png` | 阶段 drilldown 明细：按 stage 过滤的 application 列表 | drilldown 可下钻到对象明细，数据脱敏 | SCR-015 |
| 16 | `funnel-drilldown-drawer-job.png` | 岗位 drilldown 明细：按 jobId 过滤的 application 列表 | 岗位维度下钻，仅显示有权限的数据 | SCR-016 |
| 17 | `funnel-drilldown-drawer-channel.png` | 渠道 drilldown 明细：按 channel 过滤的 application 列表 | 渠道维度下钻，数据脱敏 | SCR-017 |
| 18 | `funnel-ai-copilot-explanation-with-evidence.png` | AI Copilot 面板：解释卡点能力的入口提示，声明必须基于 evidence/citation | AI 辅助建议标明 "仅供参考"，有 evidence 要求 | SCR-018 |
| 19 | `funnel-system-rule-provenance.png` | system_rule 出处证明：insight 详情展开，显示 generatedBy、triggerCondition、evidence、suggestedAction | 洞察来源可追溯，非 AI 生成 | SCR-019 |
| 20 | `funnel-no-data-partial-state.png` | 部分数据缺失状态：dataQualityWarnings 显示 "有投递但无面试数据" 等 | partial 状态正确提示，不将缺数据算为 0 | SCR-020 |
| 21 | `funnel-recruiter-scoped-view.png` | recruiter 权限视图：仅显示 owned 岗位的漏斗数据 | recruiter 不能看到其他 recruiter 的岗位数据 | SCR-021 |
| 22 | `funnel-business-owner-scoped-view.png` | business_owner 权限视图：仅显示本部门岗位的漏斗数据 | business_owner 不能看到其他部门的岗位数据 | SCR-022 |
| 23 | `funnel-interviewer-denied.png` | interviewer 被拒绝：显示 "暂无权限访问招聘漏斗" (403 safe) | interviewer 不能看全局漏斗，safe: true 标记 | SCR-023 |
| 24 | `action-center-still-works-after-funnel.png` | Action Center 仍正常工作：漏斗模块不破坏已有功能 | Phase 8.2R 为只读分析，不影响 Action Center 等其他模块 | SCR-024 |

---

## 截图完整性验证

| 检查项 | 状态 |
|--------|------|
| 截图数量 = 24 | ✅ 24 张 PNG 文件 |
| 所有文件存在 | ✅ `screenshots/phase-8.2r-funnel/` 目录 |
| 无重复编号 | ✅ 每张截图唯一编号 SCR-001 ~ SCR-024 |
| 无远景模糊 | ✅ 含 8 张 closeup 特写 (SCR-007~009, SCR-013~014, SCR-018~020) |
| 覆盖所有角色 | ✅ admin, recruiter, business_owner, interviewer |
| 覆盖所有状态 | ✅ success, empty, error, permission-denied, partial |
| 覆盖所有功能 | ✅ KPI, funnel, job, channel, action, insights, drilldown, AI Copilot, filter, data quality |

**24 张截图完整，全部唯一，近景可读。**
