// Phase 7.4B: Action API client

import type { ActionItem, ActionMetrics } from "./action-types";

export async function fetchActions(params?: Record<string, string>): Promise<{
  actions: ActionItem[];
  metrics: ActionMetrics;
}> {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
  const res = await fetch(`/api/actions?${q.toString()}`);
  if (res.status === 403) throw new Error("PERMISSION_DENIED");
  if (!res.ok) throw new Error("LOAD_FAILED");
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "LOAD_FAILED");
  return { actions: data.actions, metrics: data.metrics };
}

export async function fetchActionDetail(id: string): Promise<ActionItem> {
  const res = await fetch(`/api/actions/${id}`);
  if (res.status === 403 || res.status === 404) throw new Error("PERMISSION_DENIED");
  if (!res.ok) throw new Error("LOAD_FAILED");
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "LOAD_FAILED");
  return data.data;
}

export async function createAction(body: Record<string, unknown>): Promise<ActionItem> {
  const res = await fetch("/api/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 400) throw new Error("VALIDATION_ERROR");
  if (res.status === 403) throw new Error("PERMISSION_DENIED");
  if (!res.ok) throw new Error("CREATE_FAILED");
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "CREATE_FAILED");
  return data.data;
}

export async function resolveAction(id: string, resolutionNote: string): Promise<ActionItem> {
  const res = await fetch(`/api/actions/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolutionNote }),
  });
  if (res.status === 400) throw new Error("VALIDATION_ERROR");
  if (res.status === 409) throw new Error("ALREADY_RESOLVED");
  if (res.status === 403 || res.status === 404) throw new Error("PERMISSION_DENIED");
  if (!res.ok) throw new Error("RESOLVE_FAILED");
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "RESOLVE_FAILED");
  return data.data;
}

export async function dismissAction(id: string, dismissedReason: string): Promise<ActionItem> {
  const res = await fetch(`/api/actions/${id}/dismiss`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dismissedReason }),
  });
  if (res.status === 400) throw new Error("VALIDATION_ERROR");
  if (res.status === 403 || res.status === 404) throw new Error("PERMISSION_DENIED");
  if (!res.ok) throw new Error("DISMISS_FAILED");
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "DISMISS_FAILED");
  return data.data;
}
