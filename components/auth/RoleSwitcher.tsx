"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/server/permissions/types";
import { ROLE_LABELS } from "@/server/permissions/types";

const ROLES: Role[] = ["admin", "leader", "hrbp", "recruiter", "business_owner", "interviewer"];

export function RoleSwitcher({ currentRole }: { currentRole: Role }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(currentRole);
  const router = useRouter();

  async function handleSwitch(newRole: Role) {
    setRole(newRole);
    await fetch("/api/auth/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
      >
        <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
        <span className="text-[var(--color-text-tertiary)]">开发角色:</span>
        <span className="text-[var(--color-text-primary)]">{ROLE_LABELS[role]}</span>
        <span className="text-[var(--color-text-tertiary)]">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg py-1">
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              开发态角色切换
            </div>
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => handleSwitch(r)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-tertiary)] ${
                  r === role
                    ? "text-[var(--color-primary)] font-medium bg-[var(--color-primary-light)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    r === role ? "bg-[var(--color-primary)]" : "bg-[var(--color-text-tertiary)]"
                  }`}
                />
                {ROLE_LABELS[r]}
              </button>
            ))}
            <div className="border-t border-[var(--color-border)] px-3 py-1.5 text-[10px] text-[var(--color-warning)]">
              ⚠ 仅开发环境，非正式认证
            </div>
          </div>
        </>
      )}
    </div>
  );
}
