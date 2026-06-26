# 理然智能招聘 AI 看板 — 统一设计系统

> 版本：v1.0 | Phase 8.0
> 前置阅读：`UI_REFERENCE_STUDY.md`（设计语言研究）、`RECRUITMENT_DASHBOARD_UI_SPEC.md`（页面级 UI 规范）
> 设计参考：Linear / Stripe / Ashby / Greenhouse / Vercel / Tremor
>
> **本设计系统是唯一来源。所有组件、页面必须通过 `design-tokens.ts` 获取视觉变量，禁止使用任意 hex 色值、任意圆角、任意阴影。**

---

## 目录

1. [设计原则](#1-设计原则)
2. [颜色系统](#2-颜色系统)
3. [圆角规范](#3-圆角规范)
4. [间距规范](#4-间距规范)
5. [字体层级](#5-字体层级)
6. [卡片规范](#6-卡片规范)
7. [Badge 规范](#7-badge-规范)
8. [四态规范](#8-四态规范)
9. [Drawer 规范](#9-drawer-规范)
10. [Modal 规范](#10-modal-规范)
11. [列表密度规范](#11-列表密度规范)
12. [风险色使用规则](#12-风险色使用规则)
13. [禁止事项](#13-禁止事项)
14. [组件-参考映射表](#14-组件-参考映射表)

---

## 1. 设计原则

### 1.1 核心原则

| # | 原则 | 说明 |
|---|------|------|
| 1 | **少即是多** | 减少视觉噪音，突出核心信息。参考 Linear 的极简哲学。 |
| 2 | **Token 驱动** | 所有视觉变量通过 `design-tokens.ts` 集中管理。参考 Stripe 的 Design Token 体系。 |
| 3 | **8px 基准** | 所有间距基于 8px 的倍数（4/8/12/16/24/32）。参考 Stripe 的间距系统。 |
| 4 | **业务语义优先** | 颜色和图标必须承载业务含义，不做纯装饰。参考 Greenhouse 的语义化设计。 |
| 5 | **四态完备** | 每个组件必须覆盖 Loading/Empty/Error/PermissionDenied 四态。 |
| 6 | **招聘场景适配** | 所有设计决策服务于 HR/面试官/管理层的招聘工作流。 |

### 1.2 设计参考优先级

| 优先级 | 参考对象 | 学什么 |
|--------|---------|--------|
| P0 | Linear | 倒 L 形布局、表面层级、减少视觉噪音、active 指示器 |
| P0 | Stripe | Design Token 驱动、间距 8px 基准、组件预设 |
| P1 | Ashby | 一体化招聘 Dashboard、Analytics 独立模块 |
| P1 | Greenhouse | 招聘业务 UI 模式、结构化评分表单 |
| P1 | Tremor | KPI 卡片、趋势箭头、数据可视化模式 |

---

## 2. 颜色系统

所有颜色通过 CSS 变量定义在 `app/globals.css`，通过 `design-tokens.ts` 引用。**禁止在组件中直接使用 hex 色值。**

### 2.1 Brand（品牌色）

| Token | 变量 | 色值 | 用途 |
|-------|------|------|------|
| primary | `--color-primary` | `#2563eb` | 主按钮、链接、active 状态 |
| primary-hover | `--color-primary-hover` | `#1d4ed8` | 主按钮悬停 |
| primary-light | `--color-primary-light` | `#dbeafe` | 选中背景、信息卡片 |

### 2.2 Surface（表面）

| Token | 变量 | 色值 | 用途 |
|-------|------|------|------|
| surface | `--color-surface` | `#ffffff` | 卡片、面板、侧边栏 |
| surface-secondary | `--color-surface-secondary` | `#f8fafc` | 页面底色 |
| surface-tertiary | `--color-surface-tertiary` | `#f1f5f9` | 次级区块、悬停态 |

### 2.3 Text（文本）

| Token | 变量 | 色值 | 用途 |
|-------|------|------|------|
| text-primary | `--color-text-primary` | `#0f172a` | 标题、核心标识、KPI 数值 |
| text-secondary | `--color-text-secondary` | `#475569` | 正文、辅助信息 |
| text-tertiary | `--color-text-tertiary` | `#94a3b8` | 元数据、占位文字 |

### 2.4 Border（边框）

| Token | 变量 | 色值 | 用途 |
|-------|------|------|------|
| border | `--color-border` | `#e2e8f0` | 默认边框 |
| border-strong | `--color-border-strong` | `#cbd5e1` | 强调边框、悬停边框 |

### 2.5 Semantic（语义色）

| Token | 变量 | 背景色 | 文字色 | 用途 |
|-------|------|--------|--------|------|
| success | `--color-success` | `#dcfce7` | `#16a34a` | 已解决、正常、通过 |
| warning | `--color-warning` | `#fef3c7` | `#d97706` | 逾期、待处理、需关注 |
| danger | `--color-danger` | `#fee2e2` | `#dc2626` | 紧急、高风险、拒绝 |
| info | `--color-primary-light` | `#dbeafe` | `#2563eb` | 信息提示、进行中 |

### 2.6 状态指示色（Dot）

| Token | 色值 | 用途 |
|-------|------|------|
| active | `#16a34a` (emerald-500) | 活跃/在线 |
| inactive | `#cbd5e1` (slate-300) | 非活跃/离线 |
| pending | `#f59e0b` (amber-400) | 待处理 |
| error | `#ef4444` (red-500) | 异常/阻断 |
| info | `#3b82f6` (blue-500) | 信息 |

---

## 3. 圆角规范

| Token | Tailwind | 适用场景 |
|-------|----------|---------|
| card | `rounded-2xl` | 卡片、面板、SectionCard |
| button | `rounded-xl` | 按钮、输入框 |
| badge | `rounded-full` | Badge、Chip、标签 |
| modal | `rounded-lg` | Modal、Drawer 容器 |
| none | `rounded-none` | 表格、分隔线 |

**规则**：
- Card 统一 `rounded-2xl`
- Button 统一 `rounded-xl`
- Badge 统一 `rounded-full`
- 不允许出现 `rounded-[7px]` 或 `rounded-[14px]` 等非标圆角

---

## 4. 间距规范

基于 **8px 基准**，使用以下间距值：

| Token | 值 | Tailwind | 适用场景 |
|-------|-----|----------|---------|
| xs | 4px | `p-1` / `gap-1` | 图标间距、紧凑内边距 |
| sm | 8px | `p-2` / `gap-2` | 按钮内边距、列表项间距 |
| md | 12px | `p-3` / `gap-3` | 卡片内边距（紧凑） |
| lg | 16px | `p-4` / `gap-4` | 卡片内边距、KPI 间距 |
| xl | 24px | `p-6` / `gap-6` | 页面内边距、Section 间距 |
| 2xl | 32px | `p-8` / `gap-8` | 大区块间距 |

**组件级间距**（通过 `design-tokens.ts` 的 `spacing` 对象）：

| Token | Tailwind | 用途 |
|-------|----------|------|
| page | `p-6` | 页面内边距 |
| section | `space-y-6` | Section 垂直间距 |
| card | `p-5` | 标准卡片内边距 |
| compact | `p-4` | 紧凑卡片 |
| tight | `p-3` | 密集信息区 |

**规则**：
- 不允许出现 `px-[13px]` 或 `mt-[7px]` 等非标间距
- 如有特殊需求，优先在 `design-tokens.ts` 中新增 token

---

## 5. 字体层级

| 层级 | 字号 | 字重 | 行高 | 适用场景 | 实现 |
|------|------|------|------|---------|------|
| **Page Title** | 20px (xl) | 600 (semibold) | 28px | 页面标题 | `text-xl font-semibold text-[var(--color-text-primary)]` |
| **Section Title** | 14px (sm) | 600 (semibold) | 20px | Section 标题 | `text-sm font-semibold text-[var(--color-text-primary)]` |
| **Card Title** | 16px (base) | 600 (semibold) | 24px | 卡片标题 | `text-base font-semibold` |
| **Body** | 14px (sm) | 400 (normal) | 20px | 正文 | `text-sm text-[var(--color-text-secondary)]` |
| **Caption** | 12px (xs) | 500 (medium) | 16px | KPI 标签、Badge 文字 | `text-xs font-medium text-[var(--color-text-tertiary)]` |
| **Helper Text** | 12px (xs) | 400 (normal) | 16px | 辅助说明 | `text-xs text-[var(--color-text-tertiary)]` |
| **KPI Value** | 24px (2xl) | 600 (semibold) | 32px | KPI 数值 | `text-2xl font-semibold text-[var(--color-text-primary)]` |

**规则**：
- Page Title 只在 `ProductShell` 中使用
- Body 正文使用 `text-sm`，不使用 `text-base`（14px 为招聘系统默认正文字号）
- KPI 数值使用 `text-2xl`，不使用 `text-3xl`（避免过于夸张）

---

## 6. 卡片规范

### 6.1 标准卡片

通过 `componentStyles.card` 使用：

```tsx
import { componentStyles } from "@/components/ui/design-tokens";

<div className={componentStyles.card}>
  {/* 卡片内容 */}
</div>
```

等效样式：`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]`

### 6.2 KPI 卡片

通过 `KpiCard` 组件使用：

```tsx
<KpiCard label="待处理" value={5} trendDirection="up" trendLabel="比上周+2" href="/actions" />
```

- 标签：12px，灰色，大写跟踪
- 数值：24px，深色加粗
- 趋势：12px，绿色↑/红色↓/灰色→
- 可点击跳转

### 6.3 Section 卡片

通过 `SectionCard` 组件使用：

```tsx
<SectionCard title="岗位信息">
  {/* 内容 */}
</SectionCard>
```

- 可选标题
- 默认内边距 p-5
- 白色背景 + 边框

---

## 7. Badge 规范

### 7.1 语义色使用规则

| 语义 | 背景色 | 文字色 | 使用场景 |
|------|--------|--------|---------|
| neutral | `surface-tertiary` | `text-secondary` | 默认、草稿、普通 |
| info | `primary-light` | `primary` | 信息、处理中、进行中 |
| success | `success-light` | `success` | 已解决、已确认、已完成 |
| warning | `warning-light` | `warning` | 逾期、待处理、需关注 |
| danger | `danger-light` | `danger` | 紧急、高风险、已拒绝 |

### 7.2 使用方式

```tsx
import { StatusBadge } from "@/components/ui/StatusBadge";

<StatusBadge label="待处理" variant="warning" />
<StatusBadge label="已解决" variant="success" />
<StatusBadge label="紧急" variant="danger" />
```

### 7.3 禁止做法

- ❌ 不使用 StatusBadge，自己拼 `bg-red-100 text-red-700 rounded-md`
- ❌ 创建新的 Badge 颜色变体（如 `bg-purple-50`）
- ❌ Badge 不使用 `rounded-full`（统一用 pill 形状）

---

## 8. 四态规范

每个页面/组件必须覆盖以下四态：

### 8.1 Loading 态

```tsx
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// 使用骨架屏，不使用 spinner
<LoadingSkeleton />
```

**规则**：
- 使用骨架屏（`animate-pulse` + 灰色块）
- 不使用 spinner（除非操作 < 1 秒）
- 骨架屏应与实际内容结构一致

### 8.2 Empty 态

```tsx
import { EmptyState } from "@/components/ui/EmptyState";

<EmptyState
  icon="📭"
  title="暂无内容"
  description="当前筛选条件下没有数据。"
  action={<Link href="/actions">前往风险行动中心</Link>}
/>
```

**规则**：
- 禁止 "暂无数据"、"Coming soon!!!"、"TODO"
- 必须有引导操作（跳转到可用模块）

### 8.3 Error 态

```tsx
import { ErrorState } from "@/components/ui/ErrorState";

<ErrorState
  title="加载失败"
  description="请稍后重试或联系管理员。"
  onRetry={() => refetch()}
/>
```

**规则**：
- 禁止暴露技术堆栈（Prisma error / SQL / stack trace）
- 禁止暴露环境变量（DATABASE_URL / API Key）
- 必须有重试按钮

### 8.4 Permission Denied 态

```tsx
import { PermissionDenied } from "@/components/ui/PermissionDenied";

<PermissionDenied message="您没有权限访问此页面。如需访问请联系管理员。" />
```

**规则**：
- 禁止泄露对象存在性（"该候选人不存在" → 应显示"权限不足"）
- 禁止泄露对象归属（"该岗位属于销售部"）
- 禁止泄露对象数量（"共 5 个岗位，您无权查看"）

---

## 9. Drawer 规范

### 9.1 结构

```
┌──────────────────────────────────────────┐
│  遮罩层 (bg-black/30, 点击关闭)              │
│                              ┌───────────┤
│                              │ 固定标题   │
│                              │ + 状态     │
│                              ├───────────┤
│                              │  Tab 1    │
│                              │  Tab 2    │
│                              │  Tab 3    │
│                              │  ...      │
│                              ├───────────┤
│                              │  Action   │
│                              │  Bar      │
│                              └───────────┤
└──────────────────────────────────────────┘
```

### 9.2 规则

| 规则 | 说明 |
|------|------|
| 方向 | 右侧滑入 |
| 宽度 | 详情 640px / 含 AI 分析 720px / 简单 480px |
| 遮罩 | `bg-black/30`，点击关闭 |
| ESC | 支持键盘 ESC 关闭 |
| 标题 | 固定在顶部，不随内容滚动 |
| Tabs | 最多 5 个，数据预加载 |
| Action Bar | 固定在底部 |
| 禁止 | 不堆 raw JSON、不展示敏感信息、不展示内部 ID |

### 9.3 使用方式

```tsx
import { DetailDrawer } from "@/components/ui/DetailDrawer";

<DetailDrawer title="行动详情" onClose={handleClose}>
  {/* 内容 */}
</DetailDrawer>
```

---

## 10. Modal 规范

### 10.1 规则

| 规则 | 说明 |
|------|------|
| 一次一个动作 | 一个 Modal 只做一件事 |
| 必填项即时校验 | 不等到提交才校验 |
| 提交中 loading | 按钮显示 "提交中..."，禁用重复提交 |
| 成功后关闭 | 成功后 toast 提示 + 关闭 Modal |
| 失败后明确错误 | 错误信息在 Modal 内展示，不暴露技术栈 |
| 不丢输入 | 关闭前如有未保存内容，弹出确认提示 |
| ESC | 支持键盘 ESC 关闭 |

### 10.2 使用方式

```tsx
import { FormModal } from "@/components/ui/FormModal";

<FormModal
  title="新建行动项"
  onClose={handleClose}
  onSubmit={handleSubmit}
  submitLabel="确认新建"
  submitting={isSubmitting}
>
  {/* 表单内容 */}
</FormModal>
```

---

## 11. 列表密度规范

| 密度 | 行高 | 内边距 | 适用场景 |
|------|------|--------|---------|
| 舒适 | 52px | `py-3 px-4` | 候选人列表、岗位列表 |
| 标准 | 44px | `py-2.5 px-4` | 面试列表、Action 列表 |
| 紧凑 | 36px | `py-2 px-3` | 数据密集的表格 |

**规则**：
- 列表行最多展示 8 列
- 次要信息进 Drawer 或 Tooltip
- 列表支持排序和筛选
- 操作列最多 3 个按钮

---

## 12. 风险色使用规则

| 风险等级 | 颜色 | 使用规则 |
|---------|------|---------|
| critical (紧急) | `danger` | 仅用于需要立即处理的阻断性问题 |
| high (高) | `danger-light` + 深红文字 | 逾期、高风险 Offer |
| medium (中) | `warning` | 需关注但非阻断 |
| low (低) | `neutral` | 信息性提示 |

**重要规则**：
- **不要过度标红**：如果一页有 10 个红色 Badge，红色就失去意义
- 优先用 `warning`（amber），`danger`（red）留给真正紧急的事项
- 风险色只用于 Badge 和状态指示器，不用于大面积背景

---

## 13. 禁止事项

### 13.1 全局禁止

| # | 禁止 | 原因 | 正确做法 |
|---|------|------|---------|
| 1 | 任意 hex 色值 | 破坏一致性 | 使用 CSS 变量或 design-tokens |
| 2 | 任意圆角 | 风格碎片化 | 使用 tokens.radius |
| 3 | 任意阴影 | 层级混乱 | 使用 tokens.shadow |
| 4 | 任意 Badge 样式 | 语义混乱 | 使用 StatusBadge 组件 |
| 5 | 非标间距 | 布局不统一 | 使用 8px 基准间距 |
| 6 | 传统后台风格 | 不像 SaaS | 参考 Linear/Stripe |
| 7 | 大屏驾驶舱风 | 过度设计 | 简洁实用 |
| 8 | 装饰性图表 | 无业务含义 | 每个图表必须有交互 |
| 9 | KPI 无动作 | 纯展示无价值 | KPI 卡片可点击跳转 |
| 10 | 假 AI 输出 | 欺骗用户 | 不接入就不展示 |

### 13.2 文案禁止

| 禁止词 | 推荐替换 |
|--------|---------|
| Coming soon!!! | 该模块正在接入招聘数据 |
| TODO | 预计交付：Phase X.X |
| 测试模块 | （删除，使用正式模块名） |
| undefined / null / NaN | （确保有 fallback） |
| 暂无数据 | 当前筛选条件下没有数据。可前往 XX 查看。 |
| Mock / Demo / Sample | （使用真实数据） |
| AI 自动判断 | AI 辅助建议，仅供参考 |
| GPT 生成 | AI 分析（不标注具体模型） |

---

## 14. 组件-参考映射表

| 组件 | 主要参考 | 关键学习点 | 文件路径 |
|------|---------|-----------|---------|
| KpiCard | Tremor | 数字+标签+趋势三要素 | `components/ui/kpi-card.tsx` |
| StatusBadge | Stripe Chip | dot 指示器、语义色 | `components/ui/StatusBadge.tsx` |
| ProductShell | Linear Dashboard | Page Header + KPI + Filter + Content | `components/ui/product-shell.tsx` |
| ModulePage | Stripe Empty State | 成熟空状态展示 | `components/ui/module-page.tsx` |
| DetailDrawer | Linear Side Panel | 右侧滑入、Tabs、ESC 关闭 | `components/ui/DetailDrawer.tsx` |
| FormModal | Stripe Modal | 提交 loading、离开确认 | `components/ui/FormModal.tsx` |
| EmptyState | Untitled UI | 插图+文案+引导 | `components/ui/EmptyState.tsx` |
| ErrorState | Stripe Error | 错误+重试 | `components/ui/ErrorState.tsx` |
| PermissionDenied | Linear | 锁图标+不泄露信息 | `components/ui/PermissionDenied.tsx` |
| LoadingSkeleton | Vercel | 骨架屏非 spinner | `components/ui/LoadingSkeleton.tsx` |
| Sidebar | Linear | 分组导航、active 指示器 | `components/layout/Sidebar.tsx` |
| ObjectChip | Rippling | 对象标签（岗位/候选人/面试官） | `components/ui/object-chip.tsx` |
| SectionCard | Tremor Card | 可选标题卡片 | `components/ui/SectionCard.tsx` |

---

> **本设计系统是唯一来源。所有新增组件必须通过 `design-tokens.ts` 获取视觉变量，禁止使用任意 hex 色值、任意圆角、任意阴影。**
>
> 版本：v1.0 | Phase 8.0 | 理然智能招聘 AI 看板
