"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function IntegrationStatusPanel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/integrations/status")
      .then(r => r.json())
      .then(d => { if (d.success) setIntegrations(d.data.integrations || []); });
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="text-sm font-semibold mb-3">集成状态</h3>
      <div className="space-y-2">
        {integrations.map((int, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm">{int.displayName || int.provider}</span>
            <StatusBadge label={int.status === "connected" ? "已连接" : "未配置"} variant={int.status === "connected" ? "success" : "default"} />
          </div>
        ))}
        {integrations.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">加载中...</p>}
      </div>
    </div>
  );
}
