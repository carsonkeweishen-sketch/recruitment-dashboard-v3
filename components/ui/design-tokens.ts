/**
 * 理然智能招聘 AI 看板 — 统一设计 Token
 *
 * 集中管理所有视觉变量，禁止在组件中使用任意 hex 色值或临时拼样式。
 * 参考：Linear / Stripe / Ashby / Greenhouse / Vercel / Tremor
 *
 * 使用方式：
 *   import { tokens } from "@/components/ui/design-tokens";
 *   <div className={tokens.surface.card} />
 */

export const tokens = {
  // ============================================================
  // 圆角 (Border Radius)
  // ============================================================
  radius: {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
    /** Card / Panel 统一用 2xl */
    card: "rounded-2xl",
    /** Button 统一用 xl */
    button: "rounded-xl",
    /** Badge / Chip 统一用 full */
    badge: "rounded-full",
  } as const,

  // ============================================================
  // 表面 (Surface / Background)
  // ============================================================
  surface: {
    /** 页面底色 */
    page: "bg-[var(--color-surface-secondary)]",
    /** 卡片 / 面板 */
    card: "bg-[var(--color-surface)]",
    /** 次级区域（如侧边栏内区块） */
    muted: "bg-[var(--color-surface-tertiary)]",
    /** 悬停态 */
    hover: "hover:bg-[var(--color-surface-tertiary)]",
  } as const,

  // ============================================================
  // 边框 (Border)
  // ============================================================
  border: {
    default: "border-[var(--color-border)]",
    strong: "border-[var(--color-border-strong)]",
    /** 单像素边框 — Attio 风格 */
    hairline: "border border-[var(--color-border)]",
  } as const,

  // ============================================================
  // 文本 (Text)
  // ============================================================
  text: {
    /** 页面标题 / 关键标识 */
    title: "text-[var(--color-text-primary)]",
    /** 正文 */
    body: "text-[var(--color-text-secondary)]",
    /** 辅助信息 */
    muted: "text-[var(--color-text-tertiary)]",
    /** 极弱信息 / 占位 */
    subtle: "text-[var(--color-text-tertiary)] text-xs",
  } as const,

  // ============================================================
  // 语义意图色 (Semantic Intent)
  // ============================================================
  intent: {
    neutral: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
    info: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
    success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
    warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
    danger: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  } as const,

  // ============================================================
  // 状态指示色 (Status Dot / Indicator)
  // ============================================================
  status: {
    active: "bg-emerald-500",
    inactive: "bg-slate-300",
    pending: "bg-amber-400",
    error: "bg-red-500",
    info: "bg-blue-500",
  } as const,

  // ============================================================
  // 阴影 (Shadow)
  // ============================================================
  shadow: {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    /** Drawer / Modal 使用 */
    overlay: "shadow-lg",
  } as const,

  // ============================================================
  // 间距 (Spacing — 基于 8px 基准)
  // ============================================================
  spacing: {
    page: "p-6",
    section: "space-y-6",
    card: "p-5",
    compact: "p-4",
    tight: "p-3",
  } as const,

  // ============================================================
  // 布局 (Layout)
  // ============================================================
  layout: {
    sidebar: "w-[var(--sidebar-width)]",
    topbar: "h-[var(--topbar-height)]",
    /** KPI 卡片网格：最多 4 列 */
    kpiGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
    /** 标准双栏 */
    twoCol: "grid grid-cols-1 lg:grid-cols-2 gap-6",
  } as const,

  // ============================================================
  // 交互 (Interaction)
  // ============================================================
  interaction: {
    /** 可点击元素 */
    clickable: "cursor-pointer transition-colors",
    /** 焦点环 */
    focus: "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2",
    /** 禁用态 */
    disabled: "opacity-50 cursor-not-allowed",
  } as const,

  // ============================================================
  // 动画 (Animation)
  // ============================================================
  animation: {
    fadeIn: "animate-in fade-in duration-200",
    slideIn: "animate-in slide-in-from-right duration-300",
    skeleton: "animate-pulse",
  } as const,
} as const;

/**
 * 复合样式 — 常用组件组合
 */
export const componentStyles = {
  /** 标准卡片 */
  card: `${tokens.radius.card} ${tokens.border.hairline} ${tokens.surface.card}`,
  /** 页面标题 */
  pageTitle: "text-xl font-semibold text-[var(--color-text-primary)]",
  /** 页面描述 */
  pageDescription: "text-sm text-[var(--color-text-secondary)] max-w-2xl",
  /** Section 标题 */
  sectionTitle: "text-sm font-semibold text-[var(--color-text-primary)]",
  /** KPI 数值 */
  kpiValue: "text-2xl font-semibold text-[var(--color-text-primary)]",
  /** KPI 标签 */
  kpiLabel: "text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider",
  /** 主按钮 */
  primaryButton:
    "rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50",
  /** 次按钮 */
  secondaryButton:
    "rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors",
  /** Ghost 按钮 */
  ghostButton:
    "rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors",
} as const;
