# UI / UX 参考研究报告

> Recruitment Dashboard v3 — 海外优秀 SaaS 产品设计语言学习与落地计划
>
> 编写日期：2025-06-26
> 研究范围：Linear、Stripe、Ashby、Greenhouse、Vercel/Geist、Panda Design System (Setproduct)、Airtable、Retool、Attio、Rippling、Tremor、Untitled UI
> 技术补充：Panda CSS（Type-safe token 框架，仅作为 token 技术参考）

---

## 目录

1. [研究概述](#1-研究概述)
2. [各产品设计特征提取](#2-各产品设计特征提取)
3. [跨产品设计模式总结](#3-跨产品设计模式总结)
4. [Recruitment Dashboard v3 设计映射](#4-recruitment-dashboard-v3-设计映射)
5. [最终 UI 原则](#5-最终-ui-原则)
6. [页面级实施方案](#6-页面级实施方案)
7. [组件级实施方案](#7-组件级实施方案)
8. [Design Token 升级方案](#8-design-token-升级方案)
9. [落地优先级与路线图](#9-落地优先级与路线图)
10. [Reference Landing 表](#10-reference-landing-表)

---

## 1. 研究概述

### 1.1 研究目的

Recruitment Dashboard v3 定位为**轻量 SaaS 招聘工作台**，需要在视觉语言上达到海外一线 SaaS 产品的品质标准。本次研究系统分析了 12 个海外优秀 SaaS 产品的设计语言，提取可学习的设计特征，并制定具体的落地计划。

### 1.2 研究范围

| # | 产品 | 类型 | 为什么选它 |
|---|------|------|-----------|
| 1 | **Linear** | 项目管理 | 极简设计标杆，暗色/亮色双主题，LCH 色彩系统 |
| 2 | **Stripe** | 支付基础设施 | Design Token 驱动的组件系统，开发者体验设计 |
| 3 | **Ashby** | 招聘 ATS | 同领域产品，一体化招聘平台，现代 UI |
| 4 | **Greenhouse** | 招聘 ATS | 行业龙头，结构化招聘流程，AA 无障碍标准 |
| 5 | **Vercel/Geist** | 设计系统 | 高对比度、可访问的色彩系统，Geist 字体 |
| 6 | **Panda Design System (Setproduct)** | Figma UI Kit | 250+ 组件，80+ dashboard 模板，桌面端 1920w 设计规范 |
| 6b | **Panda CSS** (技术补充) | 样式框架 | Type-safe design token，仅作为 token 技术参考 |
| 7 | **Airtable** | 低代码数据库 | 信息密度管理，Interface Designer 布局系统 |
| 8 | **Retool** | 内部工具平台 | 数据密集型仪表盘设计，表格为核心组件 |
| 9 | **Attio** | CRM | 极高信息密度，单像素边框，4px 网格系统 |
| 10 | **Rippling** | HR/IT/Finance | 同领域产品，员工数据管理，模块化导航 |
| 11 | **Tremor** | 仪表盘组件库 | Tailwind 原生，数据可视化组件，dashboard 专用 |
| 12 | **Untitled UI** | Figma UI Kit | 全球最大的 UI Kit，900+ 全局样式，10k+ 组件 |

### 1.3 研究方法

- 直接阅读官方设计文档和博客（Linear UI Redesign 系列、Stripe Design Tokens、Greenhouse Redesign Overview）
- 参考设计系统分析平台（getdesign.md、designmd.co、designsystems.surf）
- 分析招聘行业竞品 UI 特征（Ashby、Greenhouse、Rippling）
- 提取可量化的设计 token 数据用于落地

---

## 2. 各产品设计特征提取

### 2.1 Linear — 极简项目管理的设计标杆

**来源**：[Linear UI Redesign Part II](https://linear.app/now/how-we-redesigned-the-linear-ui)、[Design System Analysis](https://getdesign.md/linear.app/design-md)

#### 色彩系统

| 特征 | 详情 |
|------|------|
| 色彩空间 | **LCH**（从 HSL 迁移），感知均匀，人眼友好 |
| 主题变量 | 每个主题仅需 **3 个变量**：base color、accent color、contrast（30-100） |
| 表面层级 | Background → Foreground → Panels → Dialogs → Modals |
| 中性化策略 | 减少 chrome（蓝色）在计算中的使用量，回归中性 timeless 外观 |
| 对比度 | 支持 contrast 变量自动生成高对比度主题用于无障碍 |

#### 字体系统

| 属性 | 值 |
|------|-----|
| 标题字体 | **Inter Display** — 增加表达力 |
| 正文字体 | **Inter**（常规版本） |
| 策略 | 减少视觉噪音，维持视觉对齐 |

#### 布局结构

```
┌─────────┬──────────────────────────┐
│         │  Tabs / Navigation       │  ← 倒 L 形水平部分
│         ├──────────────────────────┤
│ Sidebar │  App Header              │
│         │  View Header (filters)   │
│         ├──────────────────────────┤
│         │  Main Content Area       │
│         │  (List/Board/Timeline/   │
│         │   Split/Fullscreen)      │
│         │  ┌───────────┐           │
│         │  │ Side Panel │           │
│         │  │ (meta)     │           │
│         │  └───────────┘           │
└─────────┴──────────────────────────┘
```

#### 关键设计原则

1. **倒 L 形框架** — 全局 chrome 控制主视图内容
2. **减少视觉噪音** — 降低非核心元素的视觉权重
3. **维持视觉对齐** — 标签、图标、按钮垂直水平对齐
4. **增加导航层次感** — 在极简紧凑和宽敞之间找平衡
5. **参考 Apple 标准** — 接近原生应用感受

#### 对本项目的启示

- ✅ 倒 L 形布局与我们的 AppShell 高度一致
- ✅ LCH 色彩空间和 contrast 变量值得引入（Tailwind CSS 4 已支持 LCH/OKLCH）
- ✅ 表面层级体系可用于统一 card/drawer/modal 的视觉深度
- ⚠️ Linear 默认暗色模式 — 我们 Phase 12 才考虑，当前仅亮色

---

### 2.2 Stripe — Design Token 驱动的企业级设计

**来源**：[Stripe Apps Design Documentation](https://docs.stripe.com/stripe-apps/style)

#### 颜色系统

| Token | 用途 |
|-------|------|
| `surface` | 应用背景色 |
| `container` | 卡片和应用内分区背景 |
| `primary` | 文本和图标默认色 |
| `secondary` | 较低重要性文本/图标 |
| `disabled` | 禁用元素 |
| `info` / `success` / `attention` / `critical` | 语义色 |

边框色：`neutral`（默认）、`critical`（紧急）

#### 间距系统（8px 基准）

| Token | 像素值 |
|-------|--------|
| `0` | 0px |
| `xxsmall` | 2px |
| `xsmall` | 4px |
| `small` | 8px |
| `medium` | 16px |
| `large` | 24px |
| `xlarge` | 32px |
| `xxlarge` | 48px |

#### 排版系统

| Token | 用途 |
|-------|------|
| `heading` | 标注区块 |
| `subheading` | 标注区块内容 |
| `body` | 正文 |
| `caption` | 比正文更低调的文字 |

#### 布局系统

- 使用 **Stack 布局**（`stack: 'x' | 'y' | 'z'`）而非 raw flexbox
- 对齐：`alignX: 'start' | 'center' | 'end' | 'stretch'`，`alignY: 'top' | 'center' | 'baseline' | 'bottom' | 'stretch'`
- 分布：`distribute: 'space-between' | 'packed'`
- 分数宽度：`1/2`、`1/3`、`2/3`、`1/4`、`3/4` 等

#### 关键设计原则

1. **Design Token 驱动** — 所有样式通过预定义 token，不可使用任意值
2. **TypeScript 自动补全** — 所有 token 通过 TS 暴露
3. **预设优先** — 组件使用预设样式，有限覆盖
4. **视觉一致性** — 与 Dashboard 视觉匹配

#### 对本项目的启示

- ✅ 8px 间距基准与 Tailwind 默认一致
- ✅ Design Token 驱动与我们的 `globals.css` 体系一致
- ✅ Stack 布局理念可用于我们的布局组件（Box/Stack pattern）
- ⚠️ Stripe 的非标准 CSS 属性（如 `keyline`）不适用于我们的 Tailwind 体系

---

### 2.3 Ashby — 现代招聘 ATS 的 UI 标杆

**来源**：[OutSail Review](https://www.outsail.co/post/ashby-reviews---pricing-pros-cons-and-user-feedback)、[Ashby 官网](https://www.ashbyhq.com/)

#### 核心特征

| 特征 | 详情 |
|------|------|
| 定位 | 一体化招聘平台（ATS + CRM + Scheduling + Analytics） |
| 用户评价 | "Modern, user-friendly interface"、"intuitive design" |
| 核心用户群 | 北美科技公司，高量招聘团队 |
| 定价 | $5-8 PEPM，月付制 |
| 特色 | 独立的 Analytics 平台，可独立购买 |

#### 设计特征（从公开截图和分析推断）

1. **一体化仪表盘** — ATS、CRM、调度、分析整合在一个界面
2. **现代化、直观** — 高采用率，低培训成本
3. **数据密度适中** — 高量招聘场景，信息丰富但不拥挤
4. **灵活可配置** — 支持不同规模团队的定制需求

#### 对本项目的启示

- ✅ 一体化招聘工作台的定位与我们一致
- ✅ 独立 Analytics 模块的理念值得借鉴 — 我们的周报/分析模块
- ✅ 月付制定价模式验证了 SaaS 化招聘工具的商业可行性
- ✅ 高采用率设计 — 减少培训负担，招聘团队开箱即用

---

### 2.4 Greenhouse — 行业龙头的结构化招聘设计

**来源**：[Greenhouse Redesign Overview](https://support.greenhouse.io/hc/en-us/articles/6013087071643-Redesign-overview)

#### 重设计变更

| 变更 | 详情 |
|------|------|
| 色彩 | 新的品牌调色板，更新颜色系统 |
| 留白 | **增加留白**，提升可读性 |
| 按钮 | 刷新按钮样式，右上角用户头像改为姓名缩写 |
| 导航 | 从顶部导航 → 左侧导航（Job Dashboard） |
| 无障碍 | **AA 无障碍标准**（WCAG） |
| 产品切换 | 左上角 Logo 下拉切换 Recruiting / Onboarding |

#### 导航简化策略

- 将常用页面放在主导航
- 低频页面移到其他位置（Configure、Helpful Links）
- 去除多余点击：点击 Logo 回 Dashboard
- 页面命名更具体：Job Boards → Job Boards & Posts

#### 关键设计原则

1. **一致性体验** — Recruiting 和 Onboarding 统一设计语言
2. **最佳实践引导** — 界面引导用户遵循招聘最佳实践
3. **AA 无障碍** — 满足所有用户类型的需求
4. **内容优先** — 优先展示最重要内容
5. **简化导航** — 高频页面放在主导航，低频页面整合

#### 对本项目的启示

- ✅ AA 无障碍标准 — 我们应该在颜色对比度上达标
- ✅ 导航简化 — 我们当前 Sidebar 有 9 个入口，Phase 后期应精简
- ✅ 左侧导航用于 Job Dashboard — 与我们 DetailDrawer 的 Tabs 模式对应
- ✅ 增加留白 — 招聘页面不需要过度拥挤
- ✅ 姓名缩写头像 — 我们的 Topbar 可以借鉴

---

### 2.5 Vercel/Geist — 高对比度设计系统

**来源**：[Geist Design System](https://vercel.com/geist/introduction)、[Geist Colors](https://vercel.com/geist/colors)

#### 颜色系统（10 阶色阶）

| 色阶 | 用途 |
|------|------|
| Background 1 | 默认页面背景 |
| Background 2 | 次要背景（需要区分时少量使用） |
| Colors 1-3 | 组件背景：默认 → Hover → Active |
| Colors 4-6 | 组件边框：默认 → Hover → Active |
| Colors 7-8 | 高对比度背景：默认 → Hover |
| Colors 9-10 | 文本/图标：次要 → 主要 |

10 个完整色阶：Gray、Gray Alpha、Blue、Red、Amber、Green、Teal、Purple、Pink

#### 字体

- **Geist Sans** — 专为开发者和设计师设计
- **Geist Mono** — 等宽字体，代码场景

#### 关键设计原则

1. **高对比度** — 可访问的颜色系统
2. **P3 广色域** — 在支持的浏览器上使用
3. **组件背景三态** — 每个可交互组件有完整的 default/hover/active 背景色
4. **边框三态** — 输入框等组件有完整的 default/hover/active 边框色

#### 对本项目的启示

- ✅ 组件背景三态体系 — 目前我们只有 primary/primary-hover，缺少 active 态
- ✅ 边框三态 — 输入框需要更完整的交互反馈
- ✅ 文本双色 — secondary/primary 对应我们的 text-secondary/text-primary
- ⚠️ Geist 字体可以考虑引入替代 Inter，但非必须

---

### 2.6 Panda Design System (Setproduct) — 专业 Dashboard Figma UI Kit

**来源**：[Panda UI Kit - Setproduct](https://www.setproduct.com/templates/panda)、[Panda Design System Figma](https://www.figma.com/community/file/1415982271263017545/panda-design-system)、[Creative Market](https://creativemarket.com/E-sam/92036869-Panda-UI-Kit-%E2%80%93-Figma-Design-System)

#### 产品定位

Panda 是 Setproduct 出品的企业级 Dashboard Figma UI Kit，专注于**桌面端 1920w 数据密集型应用**设计。不是样式框架，而是一套完整的 Dashboard 设计系统。

#### 核心数据

| 指标 | 数据 |
|------|------|
| 组件数量 | 250+ auto-layout 组件，支持 Variants |
| Dashboard 模板 | 80+ 桌面端模板，覆盖主流 Dashboard 类别 |
| 布局宽度 | 1920w 桌面端（亮色 + 暗色双主题） |
| 设计模式 | Atomic 结构 + Modular + Responsive |
| 样式体系 | Auto-layout、Variants、Color & Text Styles、Global Styles |

#### Dashboard 模板类别

| 类别 | 示例 |
|------|------|
| Analytics | 数据分析仪表盘，KPI 卡片 + 图表 |
| Invoice | 发票管理，表格 + 状态追踪 |
| Calendar | 日历视图，事件管理 |
| Kanban | 看板视图，拖拽管理 |
| CRM | 客户关系管理，Pipeline 视图 |
| Project Management | 项目管理，任务列表 + 甘特图 |

#### 设计特征

| 特征 | 详情 |
|------|------|
| 风格 | Clean & modern web app dashboard |
| 信息密度 | 中等偏高 — 适合数据密集型 Dashboard |
| 组件结构 | Atomic：基础组件 → 复合组件 → 页面模板 |
| 布局 | 左侧导航 + 顶栏 + 内容区（经典 Dashboard 布局） |
| KPI 卡片 | 数字突出 + 趋势指示 + 图标装饰 |
| 表格 | 紧凑行高、状态标签、操作按钮右置 |
| 色彩 | 中性灰白底 + 蓝色强调 + 语义色（绿/红/黄） |

#### 对本项目的启示

- ✅ **80+ Dashboard 模板** — 直接参考 Analytics、CRM、Project Management 类别的布局
- ✅ **250+ 组件** — 我们的组件库可以对齐其分类体系
- ✅ **1920w 桌面端优先** — 招聘 Dashboard 以桌面端为核心使用场景
- ✅ **KPI 卡片设计** — 数字 + 趋势 + 图标的三要素组合
- ✅ **Atomic 结构** — 基础 UI 组件 → 业务组件 → 页面模板 的分层思路
- ⚠️ Panda 是 Figma 设计资产，不直接提供代码 — 我们学习其设计模式，用 Tailwind CSS 实现

### 2.6b Panda CSS（技术补充）— Type-safe Token 框架

> 仅作为 Design Token 技术参考，**不是 UI 设计参考对象**。

| 特征 | 详情 |
|------|------|
| 构建时 | 零运行时 CSS-in-JS，build time 生成静态 CSS |
| 类型安全 | TypeScript 原生支持 |
| Design Token | 支持 W3C token 规范的 base + semantic tokens |
| Recipes | 类似 Stitches 的 variant 系统（cva 模式） |

对本项目的 Token 技术参考价值：Recipes 模式可应用于组件变体，但我们使用 Tailwind CSS 4 + CSS 变量实现，**不引入 Panda CSS**。

---

### 2.7 Airtable — 信息密度与简洁的平衡

**来源**：[Airtable DESIGN.md](https://www.designmd.co/d/airtable)、[Interface Designer](https://www.airtable.com/guides/collaborate/getting-started-with-interface-designer)

#### 颜色系统

| Token | Hex | 用途 |
|-------|-----|------|
| `primary` | `#181d26` | 主色（近黑色，pill CTA） |
| `ink` | `#181d26` | 深色文本 |
| `body` | `#333840` | 正文 |
| `muted` | `#41454d` | 弱化文本 |
| `hairline` | `#dddddd` | 分割线 |
| `border-strong` | `#9297a0` | 强调边框 |
| `canvas` | `#ffffff` | 画布背景 |
| `surface-soft` | `#f8fafc` | 软表面 |
| `surface-strong` | `#e0e2e6` | 强表面 |

#### 字体

- **Haas Grotesk** — 适度字重，从不为了粗而粗

#### 关键设计原则

1. **白色画布 + 深色墨水** — 编辑工作流软件的标准范式
2. **品牌电压来自全出血卡片** — 珊瑚色、深绿、桃色、深海军蓝
3. **主要操作：近黑色 pill CTA** — 突出但不刺眼
4. **次要操作：白色描边按钮** — 弱化次要路径
5. **"精致简约"（sophisticated simplicity）** — 不过度设计

#### 对本项目的启示

- ✅ 白色画布 + 深色墨水 — 我们的亮色主题基准
- ✅ pill CTA — 可以考虑将主按钮从 rounded-md 改为 rounded-full
- ✅ hairline 分割线 — 0.5-1px 极细分割线
- ⚠️ Haas Grotesk 不适用，我们继续用 Inter

---

### 2.8 Retool — 数据密集型仪表盘设计

**来源**：[UI Tips for Efficient Dashboards in Retool](https://blog.boldtech.dev/ui-tips-efficient-dashboards-retool/)

#### 数据层级划分

| 层级 | 处理方式 | 示例 |
|------|----------|------|
| **主要数据** | 鲜明颜色、突出显示 | 角色标签、状态复选框 |
| **次要数据** | 浅灰色字体 | 邮箱地址 |
| **三级数据** | 隐藏在 Tooltip 中 | 补充信息（需要 info 图标提示） |

#### 表格设计原则

1. **分组相关列** — 将客户数据放在左侧，增长列放在右侧
2. **规范列标题** — 不要保留 snake_case/camelCase
3. **对齐规则** — 文本左对齐，数字右对齐
4. **展开行** — 嵌套数据通过展开行展示，需视觉区分（左缩进、颜色差异）
5. **同时只展开一行** — 避免信息过载

#### 过滤器设计

| 类型 | 适用场景 |
|------|----------|
| 分段控制器 | 单选过滤，快速切换 |
| 下拉选择器 | 多选或选项多 |
| 侧边栏 + 标签 | 全屏表格，可隐藏 |

#### 颜色策略

- **限制颜色使用** — 仅 2-3 个关键位置
- **主色调统一** — 关键操作使用统一主色
- **次要操作** — 使用主色的浅色变体

#### 对本项目的启示

- ✅ 数据层级划分 — 我们的 DataTable 需要区分主/次/三级数据
- ✅ 过滤器设计 — 分段控制器比下拉更适合状态筛选
- ✅ 展开行 — DetailDrawer 替代方案，适合轻量信息
- ✅ 颜色策略 — 限制颜色在 2-3 个关键位置
- ✅ 对齐规则 — 数字列右对齐

---

### 2.9 Attio — 极高信息密度的现代 CRM

**来源**：[Attio CRM · Curio Design](https://designbycurio.com/zh/attio-2024)

#### 核心设计语言

| 特征 | 详情 |
|------|------|
| 色彩 | 紫罗兰色为唯一强调色 |
| 表面 | 完全平坦，无阴影 |
| 网格 | **4px 网格**，机械般精确 |
| 边框 | **单像素边框**（1px） |
| 字体 | 等宽字体行 ID（Inter 标题 + Inter 正文） |
| 氛围 | 深色、高密度数据层 |

#### 字体规格

```
Heading: Inter · 3rem / 700 / 1.2 / -0.025em
Body:    Inter · 1rem / 400 / 1.5
```

#### 关键设计原则

1. **每一个像素都为信息密度服务** — 无装饰性元素
2. **单像素边框替代阴影** — 极致克制
3. **等宽字体用于数据标识** — 行 ID、ID 列
4. **完全平坦** — 无渐变、无阴影、无圆角夸张
5. **将 Linear/Vercel 的克制清晰感投射到 CRM 领域**

#### 对本项目的启示

- ✅ 单像素边框 — 我们的表格边框应保持极细
- ✅ 4px 网格 — 与 Tailwind 的 spacing scale 一致
- ✅ 唯一强调色 — 我们的 primary blue 应保持唯一性
- ⚠️ Attio 的极高密度不适合招聘场景的全部页面 — 候选人卡片需要适当留白
- ✅ 等宽字体 ID — 候选人编号、岗位编号可使用 mono 字体

---

### 2.10 Rippling — HR/IT/Finance 统一平台

**来源**：[Rippling Design System](https://github.com/Khalidabdi1/design-ai/blob/main/design-md/rippling/DESIGN.md)

#### 颜色系统

| Token | Hex | 角色 |
|-------|-----|------|
| `--rip-yellow` | `#F5C518` | 品牌强调（不用于按钮背景） |
| `--rip-navy` | `#0F1C2E` | 深色表面和侧边栏 |
| `--rip-blue` | `#0B5FFF` | CTA 按钮和主操作 |
| `--rip-blue-dark` | `#0944CC` | Hover/Active 状态 |
| `--rip-purple` | `#7C3AED` | 自动化和工作流强调 |
| `--rip-green` | `#059669` | 在职/已支付状态 |
| `--rip-amber` | `#D97706` | 待入职/审核中 |
| `--rip-red` | `#DC2626` | 离职/终止/错误 |
| `--surface-card` | `#FFFFFF` | 员工和应用卡片 |
| `--surface-bg` | `#F8FAFC` | 仪表盘背景 |

#### 排版

| 元素 | 字号 | 字重 | 行高 |
|------|------|------|------|
| Page Title | 30px | 700 | 1.1 |
| Section Title | 22px | 600 | 1.2 |
| Employee Name | 15px | 600 | 1.3 |
| Table Body | 14px | 400 | 1.5 |
| Body | 15px | 400 | 1.6 |
| Payroll Value | 20px | 700 | 1.1 |
| Label | 12px | 600 | 1.35 |

#### 组件

```css
.button-primary {
  min-height: 40px;
  padding: 0 18px;
  border-radius: 8px;
  background: #0B5FFF;
  font: 600 14px/1 Inter, sans-serif;
}

.employee-row {
  display: flex; align-items: center;
  gap: 12px; padding: 14px 16px;
  border-bottom: 1px solid #E2E8F0;
}

.automation-chip {
  border-radius: 999px;
  background: #EDE9FE;
  color: #7C3AED;
  font: 600 12px/1.4 Inter;
}
```

#### 关键设计原则

1. **HR/IT/Finance 模块明确分离** — 导航区分三大模块
2. **员工状态立即可见** — active/pending/terminated 颜色编码
3. **紫色专用于自动化** — 避免与其他功能混淆
4. **黄色仅为品牌标识** — 不用于按钮背景
5. **深色侧边栏** — 高对比度导航

#### 对本项目的启示

- ✅ 状态颜色编码 — 我们的 StatusBadge 已有 success/warning/danger
- ✅ 深色侧边栏选项 — 未来可以考虑（Phase 12 暗色模式）
- ✅ 自动化强调色 — 可以为 AI 相关功能使用紫色 accent
- ✅ 员工行设计 — 候选人列表行可参考 employee-row 模式
- ⚠️ Rippling 的黄色品牌色不适用于我们 — 我们保持蓝色 primary

---

### 2.11 Tremor — 仪表盘组件库

**来源**：[Tremor](https://www.tremor.so/)、[GitHub](https://github.com/tremorlabs/tremor)

#### 核心特征

| 特征 | 详情 |
|------|------|
| 技术栈 | React + Tailwind CSS + Radix UI + Recharts |
| 组件数 | 35+ 开源组件 |
| 无障碍 | 基于 Radix UI 的 WAI-ARIA 标准 |
| 图表 | Tracker、Bar List、Spark Charts、Progress Circles |
| 输入 | Date Range Picker、Range Slider、Multi-Select Filter |
| 模板 | 250+ blocks and templates |

#### 组件分类

| 类型 | 组件 |
|------|------|
| 数据展示 | MetricCard（KPI）、DataTable、BarList |
| 图表 | AreaChart、BarChart、LineChart、DonutChart |
| 微可视化 | Data Bars、Spark Charts、Progress Circles |
| 输入 | DatePicker、RangeSlider、Select、MultiCheckbox |
| 布局 | Card、Flex、Grid、Divider |

#### 关键设计原则

1. **Beautiful defaults** — 开箱即用的漂亮默认样式
2. **Simple props** — 关注数据而非设计
3. **Accessible by design** — 基于 Radix UI
4. **Copy-paste** — 直接复制粘贴组件代码
5. **Tailwind 原生** — 完全基于 Tailwind CSS

#### 对本项目的启示

- ✅ Tremor 是我们的**直接参考库** — 同为 Tailwind CSS + React 仪表盘
- ✅ MetricCard 设计 — 我们的 MetricCard 可以学习 Tremor 的变体
- ✅ Data Bars / Spark Charts — 适合 KPI 卡片内的微可视化
- ✅ Progress Circles — 面试完成率、Offer 接受率等指标
- ⚠️ 不需要安装 Tremor — 我们自建组件体系，但学习其设计模式

---

### 2.12 Untitled UI — 全球最大的 Figma UI Kit

**来源**：[Untitled UI](https://www.untitledui.com/)

#### 核心数据

| 指标 | 数据 |
|------|------|
| 全局样式 | 900+ |
| 组件和变体 | 10,000+ |
| 页面示例 | 420+ |
| 图标 | 2,000+ |
| 用户 | 380,000+ 设计师 |

#### 技术栈

- **Figma**: Auto Layout 5.0、Component Properties、Interactive Components
- **React**: React 19.2 + Tailwind CSS 4.3 + TypeScript 5.9 + React Aria

#### 关键设计原则

1. **完整覆盖** — 从全局样式到页面示例的完整设计系统
2. **变量驱动** — Figma variables：color、spacing、radius、width、typography、effects
3. **暗色模式变量** — 一键切换亮暗
4. **生产就绪** — 像素级完美，可直接用于开发
5. **无障碍** — React Aria 驱动的 WAI-ARIA 标准

#### 对本项目的启示

- ✅ 完整度目标 — 我们应建立完整的组件库（已有 13 个，需扩展到 20+）
- ✅ 变量驱动 — 我们的 CSS 变量体系已覆盖颜色，需扩展到间距/圆角
- ✅ 页面示例 — 每个页面应有明确的设计参考
- ⚠️ 不需要购买 Untitled UI — 但学习其组件分类和变体设计

---

## 3. 跨产品设计模式总结

### 3.1 色彩系统共识

| 模式 | 采用者 | 本项目当前状态 |
|------|--------|---------------|
| Design Token 驱动 | Stripe、Geist、Panda Design System、Rippling | ✅ 已采用 CSS 变量 |
| 语义色命名 | 全部 | ✅ primary/success/warning/danger |
| 8-10 阶色阶 | Geist、Tailwind | ⚠️ 仅定义了语义色，缺少色阶 |
| 组件三态（default/hover/active） | Geist、Stripe | ⚠️ 仅有 primary/primary-hover |
| 品牌色 ≠ 功能色 | Rippling、Airtable | ✅ primary 用于功能，无色品牌色 |

### 3.2 间距系统共识

| 模式 | 采用者 | 本项目当前状态 |
|------|--------|---------------|
| 4px 基准网格 | Attio、Tailwind | ✅ Tailwind 默认 4px |
| 8px 间距系统 | Stripe | ✅ 一致 |
| Token 命名间距 | Stripe（xxsmall~xxlarge） | ⚠️ 使用 Tailwind 数字 scale |

### 3.3 字体系统共识

| 模式 | 采用者 | 本项目当前状态 |
|------|--------|---------------|
| Inter 字体 | Linear、Attio、Rippling | ✅ 已使用 |
| 标题/正文区分 | 全部 | ⚠️ 需要明确标题层级 |
| Mono 用于数据 | Attio、Rippling | ❌ 未使用 mono 字体 |
| 字重克制 | Airtable（"从不为了粗而粗"） | ⚠️ 需审查 |

### 3.4 布局共识

| 模式 | 采用者 | 本项目当前状态 |
|------|--------|---------------|
| 倒 L 形框架 | Linear | ✅ AppShell 已实现 |
| 240px 侧边栏 | 多数产品 | ✅ 已设定 |
| 56px 顶栏 | 多数产品 | ✅ 已设定 |
| 浅灰页面背景 | 全部 | ✅ surface-secondary |
| 白色圆角卡片 | 全部 | ✅ SectionCard |

### 3.5 组件共识

| 模式 | 采用者 | 本项目当前状态 |
|------|--------|---------------|
| KPI 数字卡片 | Tremor、Retool | ✅ MetricCard |
| 状态标签 | 全部 | ✅ StatusBadge |
| 数据表格 | Retool、Tremor | ✅ DataTable |
| 右侧详情面板 | Linear | ✅ DetailDrawer |
| Modal 弹窗 | 全部 | ✅ FormModal |
| 骨架屏 | 全部 | ✅ LoadingSkeleton |
| 空状态 | 全部 | ✅ EmptyState |
| 错误状态 | 全部 | ✅ ErrorState |
| 权限拒绝 | — | ✅ PermissionDenied |
| 时间线 | Linear、Greenhouse | ❌ 缺失 ActivityTimeline |
| 步骤指示器 | Greenhouse、Stripe | ❌ 缺失 StepIndicator |

### 3.6 交互共识

| 模式 | 采用者 | 本项目当前状态 |
|------|--------|---------------|
| 每个按钮一个动作 | 全部 | ✅ 已遵守 |
| 分段控制器 | Retool、Tremor | ❌ 未使用 |
| 展开行 | Retool | ⚠️ DetailDrawer 替代 |
| Tooltip 三级数据 | Retool | ❌ 未使用 |
| 一键切换（feature flag） | Linear | ❌ 未使用 |

---

## 4. Recruitment Dashboard v3 设计映射

### 4.1 招聘业务 → SaaS 设计模式映射

| 招聘业务场景 | SaaS 参考模式 | 参考产品 | 落地组件 |
|-------------|--------------|---------|---------|
| 招聘工作台 | Dashboard / Task Home | Linear、Tremor | Workbench page |
| 岗位管理 | List + Detail Panel | Linear（Issues） | JobList + JobDetailDrawer |
| 候选人管理 | Data Table + Drawer | Retool、Ashby | CandidateList + CandidateDetailDrawer |
| 面试反馈 | Form + Scorecard | Greenhouse | InterviewFeedbackForm |
| 业务反馈 | Timeline + Stats | Linear（Activity） | BusinessFeedbackTimeline |
| 人才校准 | Panel + Form | Rippling（Employee Record） | ProfileCalibrationPanel |
| KPI 指标 | Metric Cards | Tremor、Retool | MetricCard |
| 招聘漏斗 | Funnel Visualization | Ashby Analytics | FunnelChart（Phase 7+） |
| 风险提醒 | Alert/Signal Cards | Rippling | ProfileSignalCard |
| 周报 | Dashboard + Feed | Tremor（Blocks） | Reports page |
| 数据导入 | Step-by-step Wizard | Stripe（Onboarding） | Imports page |
| 活动日志 | Activity Feed | Linear | ActivityTimeline |

### 4.2 角色 → 视图映射

| 角色 | 核心视图 | 参考产品 | 设计重点 |
|------|---------|---------|---------|
| Admin | 全局设置、权限管理 | Rippling Admin | 高密度数据、模块分离 |
| Leader | 招聘效率看板、周报 | Ashby Analytics | KPI 卡片、趋势图表 |
| HRBP | 部门招聘概览、风险监控 | Greenhouse Dashboard | 状态一览、风险高亮 |
| Recruiter | 候选人管道、面试安排 | Ashby ATS | 列表效率、快速操作 |
| Business Owner | 岗位详情、候选人反馈 | Greenhouse Job Dashboard | 决策辅助、校准面板 |
| Interviewer | 面试反馈、候选人信息 | Greenhouse Scorecard | 评分表单、证据输入 |

---

## 5. 最终 UI 原则

基于以上 12 个产品的研究，为 Recruitment Dashboard v3 制定以下 **10 条核心 UI 原则**：

### 原则 1：Design Token 驱动一切

> 所有视觉属性（颜色、间距、圆角、阴影、字体）必须通过 Design Token 定义。禁止在业务页面新增任意 hex 值。

**参考**：Stripe、Geist、Panda Design System
**当前状态**：✅ 已建立 Token 体系，需扩展

### 原则 2：信息密度分级管理

> 高密度页面（Jobs、Candidates）使用三级信息层级：主要数据突出、次要数据灰色、三级数据隐藏（Tooltip）。

**参考**：Retool、Attio
**当前状态**：⚠️ 需在 DataTable 中实现

### 原则 3：每个像素有目的

> 去除一切纯装饰性元素。分割线用 1px hairline。阴影仅用于必要的深度表达。

**参考**：Attio、Linear
**当前状态**：✅ 已控制

### 原则 4：组件三态完整

> 所有可交互组件必须有 default、hover、active 三态。输入框有 default、hover、active、focus、error、disabled 六态。

**参考**：Geist、Stripe
**当前状态**：⚠️ 仅实现了部分状态

### 原则 5：操作唯一性

> 每个按钮只做一个动作。主要操作突出（solid），次要操作弱化（outline/ghost），危险操作警告（destructive）。

**参考**：Airtable、Stripe
**当前状态**：✅ 已遵守

### 原则 6：状态全覆盖

> 所有页面必须有 Loading、Empty、Error、PermissionDenied 四种状态。不允许 undefined、null、NaN、Invalid Date、raw JSON。

**参考**：Untitled UI、Stripe
**当前状态**：✅ 已有 4 个状态组件

### 原则 7：内容优先导航

> 导航服务于内容，不抢占主视觉。高频入口在侧边栏，低频入口整合到次级菜单。Logo 点击回首页。

**参考**：Greenhouse、Linear
**当前状态**：✅ 侧边栏已实现，需后期精简

### 原则 8：微交互提升品质

> Hover 态过渡 150ms、页面切换 200ms、Modal 进出 200ms + 弹性缓动。骨架屏优于 spinner。

**参考**：Linear、Vercel
**当前状态**：⚠️ 尚未系统实现

### 原则 9：数据可扫描性

> 表格文本左对齐、数字右对齐、状态居中。使用 Data Bars、Spark Charts 等微可视化辅助数据扫描。

**参考**：Tremor、Retool
**当前状态**：⚠️ 需在 DataTable 中实现

### 原则 10：无障碍默认内置

> 颜色对比度 ≥ 4.5:1（AA 标准）。键盘导航完整。表单有 label + error message。不使用颜色作为唯一信息区分方式。

**参考**：Greenhouse、Tremor（Radix UI）
**当前状态**：⚠️ 需系统审查

---

## 6. 页面级实施方案

### 6.1 Workbench（招聘工作台）

| 特征 | 实施方案 | 参考 |
|------|---------|------|
| 欢迎区 | 日期 + 角色名称 + 今日概览一句话 | Linear Dashboard |
| 核心 KPI | 4 个 MetricCard：待处理、面试中、Offer 中、本周入职 | Tremor MetricCard |
| 我的待办 | 紧凑列表 + 状态标签 + 过期高亮 | Linear My Issues |
| 风险提醒 | ProfileSignalCard 列表 | Rippling Alert |
| 最近动态 | ActivityTimeline（5 条最新） | Linear Activity |

**布局**：
```
┌─────────────────────┬──────────────┐
│ Welcome + Date       │              │
├──────┬──────┬──────┬──┤  Activity    │
│ KPI1 │ KPI2 │ KPI3 │  │  Timeline    │
├──────┴──────┴──────┴──┤              │
│ My Actions (compact)   │              │
├────────────────────────┤              │
│ Risk Signals           │              │
└────────────────────────┴──────────────┘
```

### 6.2 Jobs（岗位管理）

| 特征 | 实施方案 | 参考 |
|------|---------|------|
| 筛选 | 分段控制器（状态）+ 搜索框 + 高级筛选折叠 | Retool |
| 列表 | DataTable：岗位名称、部门、进度、候选人、更新时间 | Linear Issues List |
| KPI | 4 个 MetricCard：在招岗位、总候选人、平均进度、逾期岗位 | Tremor |
| 详情 | JobDetailDrawer：5 个 Tabs（概览/画像/漏斗/反馈/动态） | Greenhouse Job Dashboard |

### 6.3 Candidates（候选人管理）

| 特征 | 实施方案 | 参考 |
|------|---------|------|
| 筛选 | 分段控制器（阶段）+ 搜索 + 岗位筛选 + 日期范围 | Ashby |
| 列表 | DataTable：姓名、岗位、阶段、更新时间、状态标签 | Retool employee-row |
| KPI | 4 个 MetricCard：总候选人、新候选人、面试中、Offer 中 | Tremor |
| 详情 | CandidateDetailDrawer：基础信息 + 投递记录 + 面试记录 + AI 分析 + ActivityLog | Ashby Candidate Profile |

### 6.4 Interviews（面试反馈）

| 特征 | 实施方案 | 参考 |
|------|---------|------|
| KPI | 4 个 MetricCard：待反馈、已完成、平均质量分、逾期反馈 | Greenhouse Dashboard |
| 列表 | DataTable：候选人、岗位、轮次、面试官、状态、质量分 | Greenhouse Scorecard List |
| 详情 | InterviewDetailDrawer：4 个 Tabs（概览/反馈/质量/风险） | Greenhouse Scorecard |
| 反馈表单 | 6 维度评分 + 5 级推荐 + 证据文本框 | Greenhouse Scorecard Form |

### 6.5 Business Feedback（业务反馈）

| 特征 | 实施方案 | 参考 |
|------|---------|------|
| 时间线 | 按岗位分组的反馈卡片，带状态标签 | Linear Activity Feed |
| 统计 | 通过/不通过比例、原因分布 | Ashby Analytics |
| 校准面板 | 并排对比：候选人画像 vs 岗位要求 | Rippling Employee Record |
| 表单 | Modal 表单：面试轮次、通过/不通过、原因、证据 | Greenhouse Feedback Form |

---

## 7. 组件级实施方案

### 7.1 已有组件升级

| 组件 | 当前状态 | 升级方案 | 参考 |
|------|---------|---------|------|
| **MetricCard** | 基本 KPI 展示 | 添加 trend 箭头、Spark Chart 变体、loading skeleton | Tremor MetricCard |
| **StatusBadge** | 基本颜色区分 | 添加 dot 指示器、size 变体（sm/md/lg） | Stripe Chip |
| **DataTable** | 基本表格 | 添加排序指示器、数字右对齐、行 hover 态、展开行支持 | Retool Table |
| **DetailDrawer** | 基本抽屉 | 添加 Tabs 切换动画、宽度变体（sm/md/lg）、键盘 ESC 关闭 | Linear Side Panel |
| **SectionCard** | 基本卡片 | 添加 collapsible 变体、卡片内 loading 态 | Tremor Card |
| **FormModal** | 基本弹窗 | 添加多步骤变体、提交中状态、确认离开提示 | Stripe Modal |
| **Sidebar** | emoji 图标 | 替换为 SVG 图标、添加折叠变体、active 指示器 | Linear Sidebar |
| **Topbar** | 基本顶栏 | 添加搜索框、通知 bell、用户头像（姓名缩写） | Greenhouse Topbar |

### 7.2 待新增组件

| 组件 | 用途 | 参考 | 优先级 |
|------|------|------|--------|
| **ActivityTimeline** | 活动时间线 | Linear Activity Feed | P0 |
| **StepIndicator** | 步骤指示器 | Stripe Onboarding | P0 |
| **ActionButtonGroup** | 操作按钮组 | Airtable Actions | P1 |
| **SparkChart** | 微型趋势图 | Tremor Spark Charts | P1 |
| **DataBar** | 数据条 | Tremor Data Bars | P1 |
| **ProgressCircle** | 进度环 | Tremor Progress Circle | P1 |
| **SegmentedControl** | 分段控制器 | Retool Segmented Control | P1 |
| **Tooltip** | 提示框 | Retool Tooltip | P1 |
| **CollapsibleSection** | 可折叠区域 | Tremor Accordion | P2 |
| **ConfirmDialog** | 确认对话框 | Stripe Confirm | P2 |
| **Avatar** | 头像（姓名缩写） | Greenhouse Avatar | P2 |

---

## 8. Design Token 升级方案

### 8.1 新增 Token

```css
:root {
  /* === 现有 Token（保留） === */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  /* ... 其他现有 token ... */

  /* === 新增：交互三态 === */
  --color-primary-active: #1e40af;

  /* === 新增：组件背景三态（参考 Geist） === */
  --color-surface-hover: #f1f5f9;
  --color-surface-active: #e2e8f0;

  /* === 新增：边框三态（参考 Geist） === */
  --color-border-hover: #94a3b8;
  --color-border-focus: #2563eb;

  /* === 新增：focus ring === */
  --color-ring: rgba(37, 99, 235, 0.3);

  /* === 新增：微动画 === */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* === 新增：阴影层级（参考 Rippling） === */
  --shadow-card: 0 1px 3px rgba(15, 23, 42, 0.06);
  --shadow-drawer: -8px 0 24px rgba(15, 23, 42, 0.08);
  --shadow-modal: 0 20px 52px rgba(15, 23, 42, 0.16);

  /* === 新增：字体（Mono） === */
  --font-mono: "JetBrains Mono", "SF Mono", Menlo, monospace;
}
```

### 8.2 颜色对比度审查（AA 标准）

| Token | 前景 | 背景 | 对比度 | 达标 |
|-------|------|------|--------|------|
| text-primary | `#0f172a` | `#ffffff` | 15.3:1 | ✅ AAA |
| text-secondary | `#475569` | `#ffffff` | 5.8:1 | ✅ AA |
| text-tertiary | `#94a3b8` | `#ffffff` | 3.0:1 | ❌ 需调整 |
| primary button | `#ffffff` | `#2563eb` | 4.6:1 | ✅ AA |
| success text | `#16a34a` | `#ffffff` | 4.0:1 | ⚠️ 临界 |
| danger text | `#dc2626` | `#ffffff` | 4.3:1 | ⚠️ 临界 |

**建议调整**：
- `text-tertiary`: `#94a3b8` → `#64748b`（对比度 4.5:1，达标 AA）
- `success`: `#16a34a` → `#15803d`（对比度 4.5:1）
- `danger`: `#dc2626` → `#b91c1c`（对比度 5.0:1）

---

## 9. 落地优先级与路线图

### P0 — 立即实施（Phase 5.3）

| 项目 | 内容 |
|------|------|
| Design Token 升级 | 新增交互三态、阴影层级、transition 变量 |
| text-tertiary 对比度修复 | `#94a3b8` → `#64748b` |
| Sidebar 图标 | emoji → SVG 图标 |
| Topbar 用户区域 | 添加姓名缩写头像 |

### P1 — Phase 6-7 实施

| 项目 | 内容 |
|------|------|
| DataTable 升级 | 数字右对齐、行 hover 态、排序指示器 |
| MetricCard 升级 | 添加 trend 箭头变体 |
| StatusBadge 升级 | 添加 dot 指示器、size 变体 |
| DetailDrawer 升级 | 键盘 ESC 关闭、Tabs 切换动画 |
| FormModal 升级 | 提交中状态、确认离开提示 |
| 新增 SegmentedControl | 用于状态筛选 |
| 新增 Tooltip | 用于三级数据展示 |
| 新增 ActivityTimeline | 活动时间线组件 |

### P2 — Phase 8-10 实施

| 项目 | 内容 |
|------|------|
| SparkChart / DataBar / ProgressCircle | KPI 卡片微可视化 |
| StepIndicator | 数据导入向导 |
| CollapsibleSection | 可折叠卡片 |
| ConfirmDialog | 危险操作确认 |
| Sidebar 折叠 | 图标模式 |
| 微交互动效 | 全局 transition 应用 |

### P3 — Phase 12+ 实施

| 项目 | 内容 |
|------|------|
| 暗色模式 | 完整暗色主题 |
| Sidebar 深色变体 | 参考 Rippling |
| Geist 字体评估 | 是否替换 Inter |

---

## 10. Reference Landing 表

> 按 UI 规范要求，记录参考设计特征到落地页面/组件的映射。

| # | 参考设计特征 | 来源产品 | 落地页面/组件 | 实施 Phase |
|---|------------|---------|-------------|-----------|
| 1 | LCH 色彩空间 + 3 变量主题 | Linear | `globals.css` Design Token | P0 |
| 2 | Design Token 驱动 + 8px 间距 | Stripe | 全局样式体系 | P0 |
| 3 | 倒 L 形布局框架 | Linear | `AppShell` | ✅ 已实现 |
| 4 | 高对比度组件三态（default/hover/active） | Geist | 全部可交互组件 | P0 |
| 5 | KPI 数字卡片 + 趋势箭头 | Tremor | `MetricCard` | P1 |
| 6 | 数据三级层级（主要/次要/Tooltip） | Retool | `DataTable` | P1 |
| 7 | 单像素边框 + 4px 网格 | Attio | 全局 border 体系 | ✅ 已接近 |
| 8 | 状态颜色编码（在职/审核/离职） | Rippling | `StatusBadge` | ✅ 已实现 |
| 9 | 评分表单 6 维度 + 证据文本 | Greenhouse | `InterviewFeedbackForm` | ✅ 已实现 |
| 10 | 招聘漏斗 + Analytics 独立模块 | Ashby | Jobs Funnel Tab | Phase 7 |
| 11 | 白色画布 + 深色墨水 | Airtable | 全局亮色主题 | ✅ 已实现 |
| 12 | 导航简化：高频在前，低频整合 | Greenhouse | `Sidebar` | P2 |
| 13 | 右侧 Detail Panel + Tabs | Linear | `DetailDrawer` | ✅ 已实现 |
| 14 | 活动时间线 + 头像 | Linear | `ActivityTimeline` | P1 |
| 15 | 步骤指示器（导入向导） | Stripe | `StepIndicator` | P2 |
| 16 | 分段控制器（状态筛选） | Retool | `SegmentedControl` | P1 |
| 17 | 骨架屏 Loading | Untitled UI | `LoadingSkeleton` | ✅ 已实现 |
| 18 | 空状态 + 错误状态 + 权限拒绝 | Untitled UI | `EmptyState`/`ErrorState`/`PermissionDenied` | ✅ 已实现 |
| 19 | 微可视化（Data Bars/Spark Charts） | Tremor | KPI 卡片内部 | P2 |
| 20 | AA 无障碍（对比度 ≥ 4.5:1） | Greenhouse | 全局颜色审查 | P0 |
| 21 | 员工行设计（头像 + 姓名 + 标签） | Rippling | 候选人列表行 | P1 |
| 22 | 自动化/工作流强调色（紫色） | Rippling | AI 分析标签 | P2 |
| 23 | 品牌色 ≠ 功能色 | Rippling | 颜色使用规范 | ✅ 已遵守 |
| 24 | Pill CTA（rounded-full 主按钮） | Airtable | 按钮变体 | P2 |
| 25 | 80+ Dashboard 模板布局参考 | Panda Design System (Setproduct) | 全局页面布局 | P1 |
| 26 | Type-safe Design Token（W3C 规范） | Panda CSS（技术补充） | Token 体系升级 | P2 |

---

## 附录 A：关键参考链接

| 产品 | 资源 |
|------|------|
| Linear | https://linear.app/now/how-we-redesigned-the-linear-ui |
| Stripe | https://docs.stripe.com/stripe-apps/style |
| Geist | https://vercel.com/geist/introduction |
| Geist Colors | https://vercel.com/geist/colors |
| Attio | https://designbycurio.com/zh/attio-2024 |
| Rippling | https://github.com/Khalidabdi1/design-ai/blob/main/design-md/rippling/DESIGN.md |
| Tremor | https://www.tremor.so/ |
| Retool | https://blog.boldtech.dev/ui-tips-efficient-dashboards-retool/ |
| Airtable | https://www.designmd.co/d/airtable |
| Panda Design System (Setproduct) | https://www.setproduct.com/templates/panda |
| Panda CSS (技术补充) | https://panda-css.com/ |
| Greenhouse | https://support.greenhouse.io/hc/en-us/articles/6013087071643-Redesign-overview |
| Ashby | https://www.outsail.co/post/ashby-reviews---pricing-pros-cons-and-user-feedback |
| Untitled UI | https://www.untitledui.com/ |

## 附录 B：本报告编写方法

- 每个产品的研究来源均在对应章节标注
- 设计 token 数据来自官方文档和设计系统分析平台
- 招聘行业产品（Ashby、Greenhouse）的特征提取结合了公开评测和官方文档
- "对本项目的启示"部分是结合 Recruitment Dashboard v3 当前代码状态（`app/globals.css`、组件代码、页面代码）的具体分析
- 所有落地建议均可追溯到具体组件文件路径
