"use client";

import { useEffect, useState } from "react";
import { RoleSwitcher } from "@/components/auth/RoleSwitcher";
import type { Role } from "@/server/permissions/types";
import { ROLE_LABELS } from "@/server/permissions/types";

export function Topbar() {
  const [role, setRole] = useState<Role>("admin");
  const [loading, setLoading] = useState(true);

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
          Recruitment Dashboard
        </h1>
        <span className="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
          Phase 1
        </span>
      </div>

      <div className="flex items-center gap-3">
        {!loading && <RoleSwitcher currentRole={role} />}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-tertiary)] text-sm font-medium text-[var(--color-text-secondary)]">
          {ROLE_LABELS[role]?.[0] ?? "A"}
        </div>
      </div>
    </header>
  );
}
