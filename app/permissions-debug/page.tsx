import { getSession } from "@/server/auth/session";
import type { Role, Resource } from "@/server/permissions/types";
import { ROLE_LABELS, RESOURCE_LABELS, SCOPE_LABELS } from "@/server/permissions/types";
import { getScopeFor } from "@/server/permissions/matrix";
import { getAllowedActions } from "@/server/permissions/check-permission";

export default async function PermissionsDebugPage() {
  const session = await getSession();
  const role: Role = session.role;

  const resources: Resource[] = [
    "dashboard", "workbench", "jobs", "candidates", "applications",
    "interviews", "actions", "imports", "offerRisks", "reports",
    "aiAssistant", "interviewerEnablement", "settings",
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              权限调试面板
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              当前角色: <span className="font-medium text-[var(--color-primary)]">{ROLE_LABELS[role]}</span>
              {" "}({role})
            </p>
          </div>
          <span className="rounded-full bg-[var(--color-warning-light)] px-3 py-1 text-xs font-medium text-[var(--color-warning)]">
            🛠 开发调试
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">模块</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Scope</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">允许操作</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => {
              const scope = getScopeFor(role, r);
              const actions = getAllowedActions(role, r);
              const isDenied = scope === "DENY";
              return (
                <tr
                  key={r}
                  className={`border-b border-[var(--color-border)] last:border-0 ${
                    isDenied ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {RESOURCE_LABELS[r]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        scope === "ALL"
                          ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          : scope === "DENY"
                            ? "bg-[var(--color-danger-light)] text-[var(--color-danger)]"
                            : "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {SCOPE_LABELS[scope]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {actions.length === 0 ? (
                        <span className="text-xs text-[var(--color-text-tertiary)]">—</span>
                      ) : (
                        actions.map((a) => (
                          <span
                            key={a}
                            className="rounded bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
                          >
                            {a}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          ⚠️ 此页面仅用于开发环境验证权限矩阵。正式环境将移除。权限由服务端 <code className="rounded bg-[var(--color-surface-tertiary)] px-1">requirePermission()</code> 强制执行。
        </p>
      </div>
    </div>
  );
}
