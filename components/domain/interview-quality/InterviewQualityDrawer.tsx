"use client";

import { useEffect, useState } from "react";
import { DrawerShell } from "@/components/ui/drawer-shell";
import { StatusBadge } from "@/components/ui/StatusBadge";

type TabKey = "overview" | "feedback" | "evidence" | "risks" | "followup" | "actions" | "activity";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "概览" }, { key: "feedback", label: "反馈" }, { key: "evidence", label: "证据" },
  { key: "risks", label: "风险" }, { key: "followup", label: "追问" }, { key: "actions", label: "行动" }, { key: "activity", label: "动态" },
];

const DIM_LABELS: Record<string, string> = { role_competency: "岗位胜任力", business_understanding: "业务理解", problem_solving: "问题解决", communication: "沟通表达", ownership_collaboration: "责任心与协作", motivation_stability: "动机与稳定性" };

interface Props { feedbackId: string | null; onClose: () => void; }

export function InterviewQualityDrawer({ feedbackId, onClose }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (!feedbackId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/interview-quality/${feedbackId}/analysis`)
      .then(r => r.json()).then(d => { if (!cancelled && d.success) setData(d.data); })
      .catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [feedbackId]);

  if (!feedbackId) return null;

  const statusBadge = data ? (
    <StatusBadge label={data.status === "submitted" ? "已提交" : "待提交"} variant={data.status === "submitted" ? "success" : "warning"} />
  ) : null;

  return (
    <DrawerShell title="面试质量详情" statusBadge={statusBadge} width="lg" onClose={onClose}>
      {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-[var(--color-surface-tertiary)]" />)}</div> :
       !data ? <div className="text-sm text-[var(--color-text-secondary)] py-8 text-center">加载失败</div> : (
        <>
          <div className="flex border-b border-[var(--color-border)] -mx-6 px-6 mb-4">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-2.5 text-sm font-medium transition-colors border-b-2 ${tab === t.key ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === "overview" && <OverviewTab data={data} />}
          {tab === "feedback" && <FeedbackTab data={data} />}
          {tab === "evidence" && <EvidenceTab data={data} />}
          {tab === "risks" && <RisksTab data={data} />}
          {tab === "followup" && <FollowUpTab data={data} />}
          {tab === "actions" && <ActionsTab data={data} />}
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
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-[var(--color-text-tertiary)]">岗位</span><p className="text-[var(--color-text-primary)]">{data.jobTitle || "—"}</p></div>
        <div><span className="text-[var(--color-text-tertiary)]">轮次</span><p className="text-[var(--color-text-primary)]">{data.round || "—"}</p></div>
        <div><span className="text-[var(--color-text-tertiary)]">面试官</span><p className="text-[var(--color-text-primary)]">{data.interviewerName || "—"}</p></div>
        <div><span className="text-[var(--color-text-tertiary)]">质量分</span><p className="text-[var(--color-text-primary)]">{data.feedbackQualityScore ?? "—"}</p></div>
        <div><span className="text-[var(--color-text-tertiary)]">证据分</span><p className="text-[var(--color-text-primary)]">{data.evidenceScore ?? "—"}</p></div>
        <div><span className="text-[var(--color-text-tertiary)]">推荐结论</span><p className="text-[var(--color-text-primary)]">{data.overallRecommendation || "—"}</p></div>
      </div>
      {data.riskNotes && <div><span className="text-xs text-[var(--color-text-tertiary)]">风险备注</span><p className="text-sm text-[var(--color-text-secondary)]">{data.riskNotes}</p></div>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FeedbackTab({ data }: { data: Record<string, any> }) {
  const scores = data.scores || {};
  const dims = Object.keys(DIM_LABELS);
  return (
    <div className="space-y-3">
      {dims.map(dim => {
        const val = scores[dim];
        return (
          <div key={dim} className="rounded-xl border border-[var(--color-border)] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">{DIM_LABELS[dim]}</span>
              <span className="text-sm text-[var(--color-text-primary)] font-semibold">{val != null ? val : "—"}</span>
            </div>
          </div>
        );
      })}
      {data.evidenceText && <p className="text-sm text-[var(--color-text-secondary)] mt-2">证据: {data.evidenceText.substring(0, 200)}</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EvidenceTab({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-[var(--color-text-primary)] font-semibold">证据分: {data.evidenceScore ?? "—"}</span>
      </div>
      {data.evidenceText ? (
        <div className="rounded-xl border border-[var(--color-border)] p-4"><p className="text-sm text-[var(--color-text-secondary)]">{data.evidenceText}</p></div>
      ) : <p className="text-sm text-[var(--color-warning)]">证据缺失</p>}
      {data.evidenceGaps?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] mb-1">证据缺口</h4>
          {data.evidenceGaps.map((g: string, i: number) => <p key={i} className="text-sm text-[var(--color-warning)]">· {g}</p>)}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RisksTab({ data }: { data: Record<string, any> }) {
  const risks = data.risks || [];
  if (risks.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无风险信号</p>;
  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {risks.map((r: any, i: number) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] p-4" data-insight-card="true">
          <div className="flex items-center gap-2 mb-1"><StatusBadge label={r.title} variant={r.riskLevel === "high" ? "danger" : "warning"} /><span className="text-xs text-[var(--color-text-tertiary)]" data-provenance="system_rule">系统规则提醒</span></div>
          <p className="text-sm text-[var(--color-text-secondary)]">{r.summary}</p>
          {(r.evidence || []).length > 0 && <div className="mt-1">{r.evidence.map((e: string, j: number) => <p key={j} className="text-xs text-[var(--color-text-tertiary)]">· {e}</p>)}</div>}
          <p className="mt-1 text-xs text-[var(--color-primary)]" data-suggested-action="true">→ {r.suggestedFollowUp}</p>
          {r.triggerCondition && <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">触发条件：{r.triggerCondition}</p>}
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FollowUpTab({ data }: { data: Record<string, any> }) {
  const items = data.followUp || [];
  if (items.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无追问建议</p>;
  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {items.map((f: any, i: number) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">❓ {f.question}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">目的: {f.purpose}</p>
          <p className="text-xs text-[var(--color-text-tertiary)]">期望证据: {f.expectedEvidence}</p>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActionsTab({ data }: { data: Record<string, any> }) {
  const actions = data.actions || [];
  if (actions.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无关联行动项</p>;
  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {actions.map((a: any, i: number) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center justify-between"><p className="text-sm font-medium text-[var(--color-text-primary)]">{a.title}</p><StatusBadge label={a.priority === "urgent" ? "紧急" : a.priority === "high" ? "高" : "中"} variant={a.priority === "urgent" ? "danger" : "warning"} /></div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]"><span>{a.status}</span><span>·</span><span>{a.ownerName || "—"}</span></div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActivityTab({ data }: { data: Record<string, any> }) {
  const activity = data.activity || [];
  if (activity.length === 0) return <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">暂无动态</p>;
  const LABELS: Record<string, string> = { FEEDBACK_SUBMITTED: "提交了面试反馈", ACTION_CREATED: "创建了行动项", ACTION_RESOLVED: "标记行动项为已解决", FEEDBACK_UPDATED: "更新了面试反馈" };
  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {activity.map((a: any, i: number) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] px-4 py-3">
          <p className="text-sm text-[var(--color-text-primary)]"><span className="font-medium">{a.actorName || "系统"}</span> {LABELS[a.action] || a.action}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{a.createdAt ? new Date(a.createdAt).toLocaleString("zh-CN") : ""}</p>
        </div>
      ))}
    </div>
  );
}
