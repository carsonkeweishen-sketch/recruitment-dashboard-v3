"use client";

import { useEffect, useState } from "react";
import { DrawerShell } from "@/components/ui/drawer-shell";
import { StatusBadge } from "@/components/ui/StatusBadge";

const ACTIVITY_LABELS: Record<string, string> = {
  ACTION_CREATED: "创建了行动项",
  ACTION_RESOLVED: "将行动项标记为已解决",
  ACTION_DISMISSED: "忽略了行动项",
  CREATED: "创建了",
  JOB_CREATED: "创建了岗位",
  CANDIDATE_CREATED: "添加了候选人",
  APPLICATION_CREATED: "创建了投递记录",
  INTERVIEW_COMPLETED: "完成了面试",
  INTERVIEW_FEEDBACK_SUBMITTED: "提交了面试反馈",
  FEEDBACK_SUBMITTED: "提交了面试反馈",
  OFFER_RISK_CREATED: "创建了 Offer 风险提醒",
  RULE_TRIGGERED: "系统规则触发了行动项",
  STATE_CHANGED: "更新了状态",
  BUSINESS_FEEDBACK_SUBMITTED: "提交了业务反馈",
};

function formatActivity(action: string, detail: unknown): string {
  const base = ACTIVITY_LABELS[action] || action;
  if (detail && typeof detail === "object") {
    const d = detail as Record<string, unknown>;
    if (d.title) return `${base}：${d.title}`;
    if (d.resolutionNote) return `${base}：${d.resolutionNote}`;
  }
  return base;
}

const HEALTH_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  healthy: "success", attention: "warning", risk: "danger",
};

const TABS = [
  { key: "overview", label: "概览" },
  { key: "funnel", label: "漏斗" },
  { key: "candidates", label: "候选人" },
  { key: "interviews", label: "面试" },
  { key: "actions", label: "行动" },
  { key: "insights", label: "洞察" },
  { key: "activity", label: "动态" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface Props {
  jobId: string | null;
  onClose: () => void;
}

export function JobAnalysisDrawer({ jobId, onClose }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/jobs/${jobId}/analysis`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [jobId]);

  if (!jobId) return null;

  const statusBadge = data ? (
    <StatusBadge
      label={String(data.healthLevel === "attention" ? "关注" : data.healthLevel === "risk" ? "风险" : "健康")}
      variant={HEALTH_VARIANT[String(data.healthLevel ?? "healthy")] ?? "default"}
    />
  ) : null;

  return (
    <DrawerShell title="岗位分析详情" statusBadge={statusBadge} width="lg" onClose={onClose}>
      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-[var(--color-surface-tertiary)]" />)}</div>
      ) : !data ? (
        <div className="text-sm text-[var(--color-text-secondary)] py-8 text-center">加载失败</div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-[var(--color-border)] -mx-6 px-6 mb-4">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  tab === t.key
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab === "overview" && <OverviewTab data={data} />}
          {tab === "funnel" && <FunnelTab data={data} />}
          {tab === "candidates" && <CandidatesTab data={data} />}
          {tab === "interviews" && <InterviewsTab data={data} />}
          {tab === "actions" && <ActionsTab data={data} />}
          {tab === "insights" && <InsightsTab data={data} />}
          {tab === "activity" && <ActivityTab data={data} />}
        </>
      )}
    </DrawerShell>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OverviewTab({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{data.jobTitle}</h3>
        {data.jobCode && <p className="text-xs text-[var(--color-text-tertiary)]">{data.jobCode}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="部门" value={data.department?.name ? String(data.department.name) : null} />
        <Field label="职级" value={data.level ? String(data.level) : null} />
        <Field label="编制" value={String(data.headcount ?? "—")} />
        <Field label="地点" value={data.location ? String(data.location) : null} />
        <Field label="招聘负责人" value={data.owner?.name ? String(data.owner.name) : null} />
        <Field label="业务负责人" value={data.businessOwner?.name ? String(data.businessOwner.name) : null} />
      </div>
      {data.jdText && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">JD摘要</h4>
          <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{data.jdText.substring(0, 300)}</p>
        </div>
      )}
      {data.profileSummary && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">候选人画像</h4>
          <p className="text-sm text-[var(--color-text-secondary)]">{data.profileSummary}</p>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <span>候选人: {data.totalCandidates} (活跃 {data.activeCandidates})</span>
        <span>·</span>
        <span>行动项: {data.openActions} (逾期 {data.overdueActions})</span>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs text-[var(--color-text-tertiary)]">{label}</div>
      <div className="mt-0.5 text-sm text-[var(--color-text-primary)]">{value ?? "—"}</div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FunnelTab({ data }: { data: Record<string, any> }) {
  const funnel: Array<{ stage: string; label: string; count: number }> = data.funnel ?? [];
  const maxCount = Math.max(...funnel.map((f: { count: number }) => f.count), 1);
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-text-secondary)]">
        共 {data.totalCandidates} 位候选人，活跃 {data.activeCandidates}
      </p>
      {funnel.map((item: { stage: string; label: string; count: number }) => {
        const pct = Math.round((item.count / maxCount) * 100);
        return (
          <div key={item.stage} className="flex items-center gap-3">
            <div className="w-16 text-xs text-[var(--color-text-secondary)]">{item.label}</div>
            <div className="flex-1 h-6 rounded bg-[var(--color-surface-tertiary)]">
              <div className="h-6 rounded bg-[var(--color-primary-light)] flex items-center" style={{ width: `${pct}%` }}>
                {item.count > 0 && <span className="px-2 text-xs text-[var(--color-primary)]">{item.count}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CandidatesTab({ data }: { data: Record<string, any> }) {
  const candidates: Array<Record<string, unknown>> = data.candidatesSummary ?? [];
  if (candidates.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无候选人</p>;
  return (
    <div className="space-y-2">
      {candidates.map((c, i) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] px-4 py-3">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{String(c.candidateName ?? "—")}</div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
            <span>{String(c.stage ?? "—")}</span>
            {c.currentCompany ? <span>· {String(c.currentCompany)}</span> : null}
            {c.currentTitle ? <span>· {String(c.currentTitle)}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InterviewsTab({ data }: { data: Record<string, any> }) {
  const interviews: Array<Record<string, unknown>> = data.interviews ?? [];
  if (interviews.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无面试反馈</p>;
  return (
    <div className="space-y-2">
      <div className="flex gap-4 text-xs text-[var(--color-text-secondary)] mb-2">
        <span>待提交: {data.pendingFeedback ?? 0}</span>
        <span>低质量: {data.lowQualityFeedback ?? 0}</span>
      </div>
      {interviews.map((fb, i) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-[var(--color-text-primary)]">{String(fb.candidateName ?? "—")}</div>
            <StatusBadge
              label={String(fb.overallRecommendation ?? "—")}
              variant={String(fb.overallRecommendation || "").includes("HIRE") ? "success" : "default"}
            />
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
            <span>{String(fb.interviewerName ?? "—")}</span>
            <span>·</span>
            <span>质量分: {String(fb.feedbackQualityScore ?? "—")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActionsTab({ data }: { data: Record<string, any> }) {
  const actions: Array<Record<string, unknown>> = data.actions ?? [];
  if (actions.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无行动项</p>;
  return (
    <div className="space-y-2">
      {actions.map((a, i) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">{String(a.title ?? "—")}</div>
              <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
                <StatusBadge label={String(a.priority ?? "—")} variant={a.priority === "urgent" ? "danger" : "default"} />
                <span>{String(a.status ?? "—")}</span>
                {a.ownerName ? <span>· {String(a.ownerName)}</span> : null}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InsightsTab({ data }: { data: Record<string, any> }) {
  const insights: Array<Record<string, unknown>> = data.insights ?? [];
  if (insights.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无系统洞察</p>;
  return (
    <div className="space-y-3">
      {insights.map((ins, i) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge label={String(ins.category ?? "—")} variant={ins.severity === "high" ? "danger" : "warning"} />
            <span className="text-xs text-[var(--color-text-tertiary)]">系统规则提醒</span>
          </div>
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{String(ins.title ?? "—")}</h4>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{String(ins.summary ?? "")}</p>
          {(ins.evidence as string[])?.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {(ins.evidence as string[]).filter(Boolean).map((e: string, j: number) => (
                <div key={j} className="text-xs text-[var(--color-text-tertiary)]">· {e}</div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-[var(--color-primary)]">→ {String(ins.suggestedAction ?? "")}</p>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActivityTab({ data }: { data: Record<string, any> }) {
  const activity: Array<Record<string, unknown>> = data.activity ?? [];
  if (activity.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无动态</p>;
  return (
    <div className="space-y-1">
      {activity.map((a, i) => (
        <div key={i} className="flex items-start gap-2 py-2 border-b border-[var(--color-border)] last:border-0">
          <span className="text-xs mt-0.5 shrink-0">
            {String(a.action || "").includes("CREATED") ? "📝" : String(a.action || "").includes("RESOLVED") ? "✅" : "📌"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--color-text-primary)]">
              <span className="font-medium">{String(a.actorName ?? "系统")}</span>
              {" "}{formatActivity(String(a.action ?? ""), a.detail)}
            </p>
            {a.createdAt ? (
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                {new Date(String(a.createdAt)).toLocaleString("zh-CN")}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
