"use client";

export function Topbar() {
  return (
    <header className="flex h-[var(--topbar-height)] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
      {/* Left: Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-medium text-[var(--color-text-primary)]">
          Recruitment Dashboard
        </h1>
        <span className="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
          Phase 0
        </span>
      </div>

      {/* Right: Placeholder for Phase 1 role switcher */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[var(--color-surface-tertiary)] flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
          A
        </div>
      </div>
    </header>
  );
}
