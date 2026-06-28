"use client";

import { useEffect, useState } from "react";
import { RoleSwitcher } from "@/components/auth/RoleSwitcher";
import type { Role } from "@/server/permissions/types";
import { ROLE_LABELS } from "@/server/permissions/types";
import { useCopilotContext } from "@/components/domain/ai/copilot/CopilotContext";

export function Topbar() {
  const [role, setRole] = useState<Role>("admin");
  const [loading, setLoading] = useState(true);
  const { openPanel } = useCopilotContext();

  useEffect(() => {
    fetch("/api/auth/context")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.role) setRole(d.data.role);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <header className="flex h-[var(--topbar-height)] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-medium text-[var(--color-text-primary)]">
          理然智能招聘 AI 看板
        </h1>
        <span className="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
          v3
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={openPanel}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
          data-copilot-trigger="true"
        >
          <span>🤖</span>
          AI 助手
        </button>
        {!loading && <RoleSwitcher currentRole={role} />}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-tertiary)] text-sm font-medium text-[var(--color-text-secondary)]">
          {ROLE_LABELS[role]?.[0] ?? "A"}
        </div>
      </div>
    </header>
  );
}
