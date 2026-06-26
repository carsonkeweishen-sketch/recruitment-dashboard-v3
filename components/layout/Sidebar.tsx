"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  enabled: boolean;
}

const navItems: NavItem[] = [
  { label: "首页", href: "/", icon: "home", enabled: true },
  { label: "权限调试", href: "/permissions-debug", icon: "shield", enabled: true },
  { label: "岗位管理", href: "/jobs", icon: "briefcase", enabled: true },
  { label: "候选人", href: "/candidates", icon: "users", enabled: true },
  { label: "面试管理", href: "/interviews", icon: "chat", enabled: true },
  { label: "协同任务", href: "/actions", icon: "check", enabled: false },
  { label: "数据导入", href: "/imports", icon: "upload", enabled: false },
  { label: "Offer 风险", href: "/offer-risks", icon: "alert", enabled: false },
  { label: "招聘周报", href: "/reports", icon: "chart", enabled: false },
  { label: "面试官赋能", href: "/interviewer-enablement", icon: "star", enabled: false },
];

const iconMap: Record<string, string> = {
  home: "🏠",
  shield: "🛡️",
  briefcase: "💼",
  users: "👥",
  chat: "💬",
  check: "✅",
  upload: "📤",
  alert: "⚠️",
  chart: "📊",
  star: "⭐",
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[var(--sidebar-width)] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Logo */}
      <div className="flex h-[var(--topbar-height)] items-center gap-2 border-b border-[var(--color-border)] px-4">
        <span className="text-lg font-bold text-[var(--color-primary)]">RD</span>
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Recruitment
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto px-2 py-3">
        <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
          导航
        </div>
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.href}>
              {item.enabled ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    pathname === item.href
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
                  <span className="ml-auto rounded bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                    即将
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] p-3">
        <div className="text-center text-xs text-[var(--color-text-tertiary)]">
          Phase 4 · 候选人与投递
        </div>
      </div>
    </aside>
  );
}
