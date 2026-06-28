// Phase 8.11: Copilot Context Builder v2
// 统一入口，按 moduleKey/objectType 路由到对应的 context source 适配器
// 对每个 source 的 excerpt 统一脱敏，判定 no-evidence

import type { ScopeWhere } from "@/server/permissions/types";
import { redactContextExcerpt } from "@/server/services/ai/copilot-redaction-service";

// ============================================================================
// Types
// ============================================================================

export interface ContextSourceResult {
  refType: string;
  refId: string;
  objectType: string;
  objectId: string;
  sourceLabel: string;
  excerpt: string;
  redactionStatus: "applied" | "skipped" | "not_required";
  hasEvidence: boolean;
  isRequired: boolean;
}

export interface BuiltContext {
  sources: ContextSourceResult[];
  aggregatedContext: string;
  noEvidence: boolean;
  scopeInfo: { scope: string; role: string };
}

export interface ContextBuilderOptions {
  moduleKey: string;
  objectType: string;
  objectId: string;
  scope: ScopeWhere;
  question?: string;
  extraRefIds?: string[];
}

// ============================================================================
// Context Source Interface
// ============================================================================

export interface ContextSource {
  fetch(
    objectType: string,
    objectId: string,
    scope: ScopeWhere,
    question?: string,
    extraRefIds?: string[],
  ): Promise<ContextSourceResult[]>;
}

// ============================================================================
// Source Registry — lazy loaded to avoid circular deps
// ============================================================================

const sourceRegistry: Record<string, () => Promise<ContextSource>> = {
  dashboard: () => import("./context-sources/dashboard-context-source").then((m) => m),
  job: () => import("./context-sources/job-context-source").then((m) => m),
  job_list: () => import("./context-sources/job-context-source").then((m) => m),
  candidate: () => import("./context-sources/candidate-context-source").then((m) => m),
  candidate_list: () => import("./context-sources/candidate-context-source").then((m) => m),
  interview_quality: () => import("./context-sources/interview-feedback-context-source").then((m) => m),
  interview_feedback: () => import("./context-sources/interview-feedback-context-source").then((m) => m),
  offer_risk: () => import("./context-sources/offer-risk-context-source").then((m) => m),
  offer_risk_list: () => import("./context-sources/offer-risk-context-source").then((m) => m),
  action: () => import("./context-sources/action-context-source").then((m) => m),
  action_list: () => import("./context-sources/action-context-source").then((m) => m),
  funnel: () => import("./context-sources/funnel-context-source").then((m) => m),
  knowledge: () => import("./context-sources/knowledge-context-source").then((m) => m),
  data_source_chunk: () => import("./context-sources/data-source-context-source").then((m) => m),
  data_source_list: () => import("./context-sources/data-source-context-source").then((m) => m),
  transcript: () => import("./context-sources/transcript-context-source").then((m) => m),
  transcript_list: () => import("./context-sources/transcript-context-source").then((m) => m),
};

function resolveSourceKey(moduleKey: string, objectType: string): string {
  // Prefer objectType if it has a direct source, otherwise use moduleKey
  if (sourceRegistry[objectType]) return objectType;
  if (sourceRegistry[moduleKey]) return moduleKey;
  // Fallback: dashboard for unknown modules
  return "dashboard";
}

// ============================================================================
// Main Entry Point
// ============================================================================

export async function buildCopilotContext(
  opts: ContextBuilderOptions,
): Promise<BuiltContext> {
  const sourceKey = resolveSourceKey(opts.moduleKey, opts.objectType);
  const sourceLoader = sourceRegistry[sourceKey];
  
  if (!sourceLoader) {
    return {
      sources: [],
      aggregatedContext: "{}",
      noEvidence: true,
      scopeInfo: { scope: opts.scope.scope, role: opts.scope.role || "" },
    };
  }

  const source = await sourceLoader();
  const rawSources = await source.fetch(
    opts.objectType,
    opts.objectId,
    opts.scope,
    opts.question,
    opts.extraRefIds,
  );

  // 统一脱敏
  const sources: ContextSourceResult[] = rawSources.map((s) => {
    const { text, status } = redactContextExcerpt(s.excerpt, s.redactionStatus !== "not_required");
    return { ...s, excerpt: text, redactionStatus: status };
  });

  // no-evidence 判定：任一 isRequired=true 的 source hasEvidence=false
  const noEvidence = sources.some((s) => s.isRequired && !s.hasEvidence);

  // 聚合 context
  const aggregatedContext = sources
    .map((s) => `【${s.sourceLabel}】${s.excerpt}`)
    .join("\n\n");

  return {
    sources,
    aggregatedContext,
    noEvidence,
    scopeInfo: { scope: opts.scope.scope, role: opts.scope.role || "" },
  };
}
