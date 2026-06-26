# Claude Phase 8.0 Foundation UX Review — Triage

> 日期：2026-06-27
> Review 来源：Claude Phase 8.0 Foundation UX Review
> 处置原则：P0 全部采纳并完成，P1 全部处理完成，P2 全部记录不做

---

## Triage 总表

| # | Claude 建议 | 级别 | 是否采纳 | 处理方式 | 改动文件 | 是否扩功能 | 当前状态 |
|---|------------|------|---------|---------|---------|-----------|---------|
| 1 | 导航不能 14+ 模块平铺，应业务分组 | P0 | ✅ 采纳 | 重写 Sidebar 为 6 组业务分组导航（概览/招聘运营/面试/风险与行动/分析/设置），移除 permissions-debug | `components/layout/Sidebar.tsx` | 否 | ✅ 完成 |
| 2 | 设计系统必须成为唯一来源 | P0 | ✅ 采纳 | 创建 design-tokens.ts 统一管理颜色/圆角/间距/字体/阴影/动画；统一所有 UI 组件使用 design-tokens | `components/ui/design-tokens.ts`, `components/ui/*` | 否 | ✅ 完成 |
| 3 | 规则智能与 LLM 必须分开 | P0 | ✅ 采纳 | 更新 AI_CAPABILITY_FRAMEWORK.md 明确 Layer 1 系统规则提醒 / Layer 2 AI 辅助建议 / Layer 3 人工确认后的执行闭环；UI 文案区分"系统发现"和"AI 辅助建议，仅供参考" | `docs/product/AI_CAPABILITY_FRAMEWORK.md` | 否 | ✅ 完成（Phase 8.0A 已修正） |
| 4 | 未完成模块必须有成熟空状态 | P0 | ✅ 采纳 | 创建 ModulePage 组件（统一"该模块正在接入招聘数据"文案），为 /dashboard /reports /knowledge /settings /offer-risks 创建成熟空状态页面 | `components/ui/module-page.tsx`, `app/dashboard/`, `app/reports/`, `app/knowledge/`, `app/settings/`, `app/offer-risks/` | 否 | ✅ 完成 |
| 5 | 全局模块命名必须中文招聘语义化 | P0 | ✅ 采纳 | 创建 PRODUCT_NAMING_GLOSSARY.md 定义全部模块/操作/状态/优先级/AI/角色的中文命名；统一 Sidebar 命名 | `docs/product/PRODUCT_NAMING_GLOSSARY.md`, `components/layout/Sidebar.tsx` | 否 | ✅ 完成 |
| 6 | 导航按角色收敛 | P1 | ✅ 采纳 | 在 module-registry.ts 中定义每个模块的角色可见性；Sidebar 未启用模块显示 phaseLabel | `server/config/module-registry.ts` | 否 | ✅ 完成 |
| 7 | AI 可信度展示规范 | P1 | ✅ 采纳 | 创建 AI_OUTPUT_PROVENANCE_STANDARD.md 定义 AI 输出必须包含 provider/model/promptVersion/confidence/evidence/humanReviewStatus | `docs/product/AI_OUTPUT_PROVENANCE_STANDARD.md` | 否 | ✅ 完成 |
| 8 | 四态共享组件 | P1 | ✅ 采纳 | 创建/统一 error-state.tsx, permission-state.tsx, loading-skeleton.tsx, empty-state.tsx，每个支持 title/description/action/icon | `components/ui/error-state.tsx`, `permission-state.tsx`, `loading-skeleton.tsx`, `empty-state.tsx` | 否 | ✅ 完成 |
| 9 | Drawer/Modal 基础规范 | P1 | ✅ 采纳 | 创建 drawer-shell.tsx (右侧进入/固定标题/Tabs/底部ActionBar) + modal-shell.tsx (居中/一次一个动作/即时校验/loading) + 交互规范文档 | `components/ui/drawer-shell.tsx`, `modal-shell.tsx`, `docs/design/DRAWER_MODAL_INTERACTION_STANDARD.md` | 否 | ✅ 完成 |
| 10 | 字体与间距 scale | P1 | ✅ 采纳 | 在 RIJON_RECRUITMENT_DESIGN_SYSTEM.md 中定义完整字体层级（Page Title/Section Title/Card Title/Body/Caption/Helper Text）和 8px 基准间距系统 | `docs/design/RIJON_RECRUITMENT_DESIGN_SYSTEM.md` | 否 | ✅ 完成 |
| 11 | Dashboard 定位先锁文档 | P1 | ✅ 采纳 | 在 PRODUCT_INFORMATION_ARCHITECTURE.md 和 MODULE_ROADMAP.md 中明确：Dashboard 不是 KPI 堆砌页，是招聘风险与待办聚合入口 | `docs/product/PRODUCT_INFORMATION_ARCHITECTURE.md`, `docs/product/MODULE_ROADMAP.md` | 否 | ✅ 完成 |
| 12 | 模块路线标注依赖 | P1 | ✅ 采纳 | 创建 MODULE_ROADMAP.md 含核心对象分层（6 层）、8 个 Phase 路线、模块依赖矩阵 | `docs/product/MODULE_ROADMAP.md` | 否 | ✅ 完成 |
| 13 | 后续 P2 项 | P2 | ❌ 记录不做 | 标记为"记录，当前不做" | — | — | 📋 已记录 |

---

## 统计

| 级别 | 总数 | 采纳 | 记录不做 |
|------|------|------|---------|
| P0 | 5 | 5 | 0 |
| P1 | 7 | 7 | 0 |
| P2 | 1 | 0 | 1 |
| **合计** | **13** | **12** | **1** |

---

## 最终结论

| 结论项 | 状态 |
|--------|------|
| P0 全部采纳并完成 | ✅ |
| P1 全部处理完成 | ✅ |
| P2 全部记录不做 | ✅ |
| 是否扩功能 | 否 |
| 是否破坏 Action Center | 否 |
| 是否建议进入 Phase 8.1 | 否 — 需 ChatGPT Review 确认后 |

---

> 版本：v1.0 | 日期：2026-06-27
