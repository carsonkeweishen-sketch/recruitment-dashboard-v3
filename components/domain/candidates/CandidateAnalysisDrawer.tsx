"use client";

import { useEffect, useState } from "react";
import { DrawerShell } from "@/components/ui/drawer-shell";
import { StatusBadge } from "@/components/ui/StatusBadge";

type TabKey = "overview" | "match" | "evidence" | "interviews" | "risks" | "actions" | "insights" | "activity";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "概览" },
  { key: "match", label: "匹配" },
  { key: "evidence", label: "证据" },
  { key: "interviews", label: "面试" },
  { key: "risks", label: "风险" },
  { key: "actions", label: "行动" },
  { key: "insights", label: "洞察" },
  { key: "activity", label: "动态" },
];

interface Props { candidateId: string | null; onClose: () => void }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CandidateAnalysisDrawer({ candidateId, onClose }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (!candidateId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/candidates/${candidateId}/analysis`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [candidateId]);

  if (!candidateId) return null;

  return (
    <DrawerShell title="候选人评估详情" width="lg" onClose={onClose}>
      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-[var(--color-surface-tertiary)]" />)}</div>
      ) : !data ? (
        <div className="text-sm text-[var(--color-text-secondary)] py-8 text-center">加载失败</div>
      ) : (
        <>
          <div className="flex border-b border-[var(--color-border)] -mx-6 px-6 mb-4">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  tab === t.key ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && <OverviewTab data={data} />}
          {tab === "match" && <MatchTab data={data} />}
          {tab === "evidence" && <EvidenceTab data={data} />}
          {tab === "interviews" && <InterviewsTab data={data} />}
          {tab === "risks" && <RisksTab data={data} />}
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
      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{data.candidateName}</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="当前岗位" value={data.jobTitle} />
        <Field label="阶段" value={data.stage} />
        <Field label="当前公司" value={data.currentCompany} />
        <Field label="当前职位" value={data.currentTitle} />
        <Field label="匹配度" badge={<StatusBadge label={data.matchLevel === "high" ? "高" : data.matchLevel === "medium" ? "中" : "待评估"} variant={data.matchLevel === "high" ? "success" : "warning"} />} />
        <Field label="证据数" value={String(data.evidenceChain?.length ?? 0)} />
        <Field label="风险信号" value={String(data.riskSignals?.length ?? 0)} />
        <Field label="未关闭Action" value={String(data.openActions ?? 0)} />
      </div>
    </div>
  );
}

function Field({ label, value, badge }: { label: string; value?: string; badge?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-[var(--color-text-tertiary)]">{label}</div>
      <div className="mt-0.5 text-sm text-[var(--color-text-primary)]">{badge ?? value ?? "—"}</div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MatchTab({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">匹配等级</h4>
        <StatusBadge label={data.matchLevel === "high" ? "高匹配" : data.matchLevel === "medium" ? "中等匹配" : "待评估"} variant={data.matchLevel === "high" ? "success" : "warning"} />
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">关联岗位</h4>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(data.applications || []).map((app: any, i: number) => (
          <div key={i} className="text-sm text-[var(--color-text-secondary)]">{app.jobTitle} · {app.stage}</div>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EvidenceTab({ data }: { data: Record<string, any> }) {
  const chain = data.evidenceChain ?? [];
  if (chain.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无证据链</p>;
  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {chain.map((e: any, i: number) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[var(--color-text-tertiary)]">{e.sourceLabel}</span>
            <StatusBadge label={e.strength === "strong" ? "强" : e.strength === "medium" ? "中" : "弱"} variant={e.strength === "strong" ? "success" : "warning"} />
          </div>
          <p className="text-sm text-[var(--color-text-primary)]">{e.summary}</p>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InterviewsTab({ data }: { data: Record<string, any> }) {
  const interviews = data.interviews ?? [];
  if (interviews.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无面试记录</p>;
  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {interviews.map((iv: any, i: number) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] p-3">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{iv.round} · {iv.interviewerName ?? "—"}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[var(--color-text-secondary)]">状态: {iv.status}</span>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(iv.feedbacks || []).map((fb: any, j: number) => (
              <span key={j} className="text-xs text-[var(--color-text-tertiary)]">
                {fb.overallRecommendation ?? "—"} · 质量分: {fb.feedbackQualityScore ?? "—"}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RisksTab({ data }: { data: Record<string, any> }) {
  const risks = data.riskSignals ?? [];
  if (risks.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">未检测到风险信号</p>;
  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {risks.map((r: any, i: number) => (
        <div key={i} className="rounded-xl border border-[var(--color-warning-light)] bg-[var(--color-warning-light)] p-3">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge label={r.riskLevel === "high" ? "高风险" : "中风险"} variant={r.riskLevel === "high" ? "danger" : "warning"} />
            <span className="text-xs text-[var(--color-text-tertiary)]">系统规则提醒</span>
          </div>
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{r.title}</h4>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{r.summary}</p>
          <p className="text-xs text-[var(--color-primary)] mt-2">→ {r.suggestedFollowUp ?? "建议在下一轮面试中验证"}</p>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActionsTab({ data }: { data: Record<string, any> }) {
  const actions = data.actions ?? [];
  if (actions.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无行动项</p>;
  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {actions.map((a: any, i: number) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] p-3">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{a.title}</div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
            <span>{a.category}</span>
            <StatusBadge label={a.priority === "urgent" ? "紧急" : a.priority === "high" ? "高" : "中"} variant={a.priority === "urgent" ? "danger" : "warning"} />
            <span>{a.status}</span>
            <span>{a.ownerName ?? "—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InsightsTab({ data }: { data: Record<string, any> }) {
  const insights = data.insights ?? [];
  if (insights.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无系统洞察</p>;
  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {insights.map((ins: any, i: number) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge label={ins.category ?? "—"} variant={ins.severity === "high" ? "danger" : "warning"} />
            <span className="text-xs text-[var(--color-text-tertiary)]">系统规则提醒</span>
          </div>
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{ins.title}</h4>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{ins.summary}</p>
          <p className="mt-2 text-xs text-[var(--color-primary)]">→ {ins.suggestedAction ?? ""}</p>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActivityTab({ data }: { data: Record<string, any> }) {
  const activity = data.activity ?? [];
  if (activity.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无动态</p>;
  const LABELS: Record<string, string> = {
    ACTION_CREATED: "创建了行动项", CANDIDATE_CREATED: "创建了候选人档案", APPLICATION_CREATED: "创建了投递记录",
    INTERVIEW_FEEDBACK_SUBMITTED: "提交了面试反馈", ACTION_RESOLVED: "标记行动项为已解决",
  };
  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {activity.map((a: any, i: number) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] px-4 py-3">
          <p className="text-sm text-[var(--color-text-primary)]">
            <span className="font-medium">{a.actorName ?? "系统"}</span>
            {" "}{LABELS[a.action] || a.action}
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            {a.createdAt ? new Date(String(a.createdAt)).toLocaleString("zh-CN") : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
