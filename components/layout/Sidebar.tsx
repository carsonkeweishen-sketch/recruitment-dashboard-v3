"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ============================================================
// 理然智能招聘 AI 看板 — 产品边界收口后导航
// 本产品：招聘判断、风险识别、面试质量、候选人评估、岗位卡点、行动闭环
// 周报由外部产品承接，面试流程推进由 Moka 承接
// ============================================================

interface NavItem {
  label: string;
  href: string;
  icon: string;
  enabled: boolean;
  phaseLabel?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "概览",
    items: [
      { label: "招聘总览", href: "/dashboard", icon: "dashboard", enabled: true },
    ],
  },
  {
    label: "风险与行动",
    items: [
      { label: "风险行动中心", href: "/actions", icon: "check", enabled: true },
    ],
  },
  {
    label: "招聘分析",
    items: [
      { label: "岗位分析", href: "/jobs", icon: "briefcase", enabled: true },
      { label: "候选人评估", href: "/candidates", icon: "users", enabled: true },
      { label: "数据漏斗", href: "/funnel", icon: "chart", enabled: false, phaseLabel: "Phase 8.2" },
    ],
  },
  {
    label: "面试质量",
    items: [
      { label: "面试质量", href: "/interviews", icon: "chat", enabled: true },
      { label: "面试官质量", href: "/interviewer-quality", icon: "star", enabled: false, phaseLabel: "Phase 8.5" },
    ],
  },
  {
    label: "风险分析",
    items: [
      { label: "Offer 风险", href: "/offer-risks", icon: "alert", enabled: false, phaseLabel: "Phase 8.6" },
    ],
  },
  {
    label: "知识资产",
    items: [
      { label: "知识库 / 模板库", href: "/knowledge", icon: "book", enabled: false, phaseLabel: "Phase 8.7" },
    ],
  },
  {
    label: "设置",
    items: [
      { label: "集成", href: "/integrations", icon: "plug", enabled: false, phaseLabel: "Phase 9+" },
      { label: "设置", href: "/settings", icon: "settings", enabled: false, phaseLabel: "Phase 9+" },
    ],
  },
];

const iconMap: Record<string, string> = {
  dashboard: "📊",
  check: "✅",
  briefcase: "💼",
  users: "👥",
  chart: "📈",
  chat: "💬",
  star: "⭐",
  alert: "⚠️",
  book: "📚",
  plug: "🔌",
  settings: "⚙️",
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[var(--sidebar-width)] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Logo */}
      <div className="flex h-[var(--topbar-height)] items-center gap-2 border-b border-[var(--color-border)] px-4">
        <span className="text-lg font-bold text-[var(--color-primary)]">理然</span>
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          智能招聘
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto px-2 py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  {item.enabled ? (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href))
                          ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      <span className="text-base">{iconMap[item.icon]}</span>
                      {item.label}
                    </Link>
                  ) : (
                    <span className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--color-text-tertiary)] opacity-50">
                      <span className="text-base">{iconMap[item.icon]}</span>
                      {item.label}
                      {item.phaseLabel && (
                        <span className="ml-auto rounded bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                          {item.phaseLabel}
                        </span>
                      )}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] p-3">
        <div className="text-center text-xs text-[var(--color-text-tertiary)]">
          理然智能招聘 AI 看板
        </div>
      </div>
    </aside>
  );
}
