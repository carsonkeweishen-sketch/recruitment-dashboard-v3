"use client";

import { useState, useEffect } from "react";
import type { ActionItem } from "./action-types";
import { fetchActionDetail } from "./action-api";
import { ActionDetailOverview } from "./ActionDetailOverview";
import { ActionLinkedContextPanel } from "./ActionLinkedContextPanel";
import { ActionActivityTimeline } from "./ActionActivityTimeline";
import {
  STATUS_LABELS, PRIORITY_LABELS, STATUS_BADGE_STYLES, PRIORITY_BADGE_STYLES,
} from "./action-display-utils";

interface Props {
  actionId: string;
  onClose: () => void;
  onResolve: (action: ActionItem) => void;
  onDismiss: (action: ActionItem) => void;
  onRefresh: () => void;
}

export function ActionDetailDrawer({ actionId, onClose, onResolve, onDismiss }: Props) {
  const [action, setAction] = useState<ActionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "linked" | "activity">("overview");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetchActionDetail(actionId)
      .then((a) => { setAction(a); setLoading(false); })
      .catch((e) => {
        setLoading(false);
        setError(e.message === "PERMISSION_DENIED"
          ? "暂无权限查看该行动"
          : "加载失败，请稍后重试");
      });
  }, [actionId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const canOperate = action && (action.status === "open" || action.status === "in_progress" || action.status === "blocked");

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-50 flex h-full w-[600px] flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {loading ? (
                <div className="h-6 w-48 animate-pulse rounded bg-[var(--color-surface-tertiary)]" />
              ) : error ? (
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {error}
                </h2>
              ) : (
                <>
                  <h2 className="text-lg font-semibold leading-snug text-[var(--color-text-primary)] line-clamp-2">
                    {action?.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-2">
                    {action && (
                      <>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[action.status]}`}>
                          {STATUS_LABELS[action.status]}
                        </span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE_STYLES[action.priority]}`}>
                          {PRIORITY_LABELS[action.priority]}
                        </span>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            <button onClick={onClose} className="shrink-0 rounded-md p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] px-6">
          {(["overview", "linked", "activity"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t === "overview" ? "概览" : t === "linked" ? "关联信息" : "活动记录"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded bg-[var(--color-surface-tertiary)]" />)}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="text-sm text-[var(--color-text-secondary)]">{error}</div>
              <button onClick={() => { setLoading(true); setError(null); fetchActionDetail(actionId).then(a => { setAction(a); setLoading(false); }).catch(e => { setLoading(false); setError(e.message === "PERMISSION_DENIED" ? "暂无权限查看该行动" : "加载失败"); }); }}
                className="mt-3 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white">
                重试
              </button>
            </div>
          ) : action && (
            <>
              {tab === "overview" && <ActionDetailOverview action={action} />}
              {tab === "linked" && <ActionLinkedContextPanel action={action} />}
              {tab === "activity" && <ActionActivityTimeline action={action} />}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && action && (
          <div className="border-t border-[var(--color-border)] px-6 py-4">
            {canOperate ? (
              <div className="flex gap-3">
                <button
                  onClick={() => onResolve(action)}
                  className="flex-1 rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
                >
                  标记为已解决
                </button>
                <button
                  onClick={() => onDismiss(action)}
                  className="flex-1 rounded-md border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]"
                >
                  忽略此行动
                </button>
              </div>
            ) : (
              <div className="text-center text-sm text-[var(--color-text-tertiary)]">
                {action.status === "resolved" && (
                  <div>已解决 · {action.resolutionNote || ""}</div>
                )}
                {action.status === "dismissed" && (
                  <div>已忽略 · {action.dismissedReason || ""}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
