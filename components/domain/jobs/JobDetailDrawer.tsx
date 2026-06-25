"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BusinessFeedbackTimeline } from "@/components/domain/business-feedback/BusinessFeedbackTimeline";
import { BusinessReasonStats } from "@/components/domain/business-feedback/BusinessReasonStats";
import { ProfileSignalCard } from "@/components/domain/business-feedback/ProfileSignalCard";
import { ProfileCalibrationPanel } from "@/components/domain/business-feedback/ProfileCalibrationPanel";
import { BusinessFeedbackFormModal } from "@/components/domain/business-feedback/BusinessFeedbackFormModal";
import { ProfileCalibrationFormModal } from "@/components/domain/business-feedback/ProfileCalibrationFormModal";

interface JobDetail {
  id: string;
  jobCode: string | null;
  title: string;
  department: { id: string; name: string } | null;
  level: string | null;
  status: string;
  priority: string;
  owner: { id: string; name: string } | null;
  businessOwner: { id: string; name: string } | null;
  location: string | null;
  headcount: number;
  brandLine: string | null;
  jdText: string | null;
  profileSummary: string | null;
  mustHave: Record<string, unknown> | null;
  niceToHave: Record<string, unknown> | null;
  targetCompanies: string[] | null;
  interviewFocus: string[] | null;
  salaryMin: number | null;
  salaryMax: number | null;
  totalApplications: number;
  activeApplications: number;
  applicationsByStage: Record<string, number> | null;
}

export function JobDetailDrawer({ jobId, onClose }: { jobId: string | null; onClose: () => void }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "profile" | "funnel" | "activity" | "feedback">("overview");
  // Phase 5: Business Feedback state
  const [feedbackData, setFeedbackData] = useState<{
    feedbacks: Array<{ id: string; decision: string; reasonCode: string | null; reasonText: string | null; reviewer: { id: string; name: string } | null; job: { id: string; title: string; jobCode: string | null } | null; createdAt: string }>;
    decisionStats: Record<string, number>;
    reasonStats: Record<string, number>;
    profileSignals: { calibrationNeeded: boolean; topReasonCode: string | null; topReasonCount: number; rejectionRate: number; suggestedCalibrationReason: string | null } | null;
    calibrations: Array<{ id: string; sourceFeedbackIds: string[]; calibrationReason: string | null; status: string; confirmedAt: string | null; createdAt: string }>;
  } | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showCalibrationForm, setShowCalibrationForm] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const d = await res.json();
        if (!cancelled) setJob(d.data);
      } catch {
        if (!cancelled) setJob(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [jobId]);

  // Phase 5: Load feedback summary when feedback tab is active
  useEffect(() => {
    if (!jobId || tab !== "feedback") return;
    let cancelled = false;
    async function loadFeedback() {
      setFeedbackLoading(true);
      try {
        const res = await fetch(`/api/jobs/${jobId}/feedback-summary`);
        const d = await res.json();
        if (!cancelled && d.success) setFeedbackData(d.data);
      } catch {
        if (!cancelled) setFeedbackData(null);
      } finally {
        if (!cancelled) setFeedbackLoading(false);
      }
    }
    loadFeedback();
    return () => { cancelled = true; };
  }, [jobId, tab]);

  async function refreshFeedback() {
    if (!jobId) return;
    setFeedbackLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/feedback-summary`);
      const d = await res.json();
      if (d.success) setFeedbackData(d.data);
    } catch { /* keep existing data */ }
    finally { setFeedbackLoading(false); }
  }

  if (!jobId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">岗位详情</h2>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">✕</button>
        </div>

        {loading && <div className="flex-1 p-5"><div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-surface-tertiary)]" /></div>}
        {!loading && !job && <div className="flex-1 p-5 text-sm text-[var(--color-text-secondary)]">加载失败</div>}

        {job && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-[var(--color-border)]">
              {(["overview", "profile", "funnel", "feedback", "activity"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === t ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>
                  {t === "overview" ? "概览" : t === "profile" ? "画像" : t === "funnel" ? "漏斗" : t === "feedback" ? "业务反馈" : "动态"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-5">
              {tab === "overview" && <OverviewTab job={job} />}
              {tab === "profile" && <ProfileTab job={job} />}
              {tab === "funnel" && <FunnelTab job={job} />}
              {tab === "feedback" && <FeedbackTab job={job} feedbackData={feedbackData} loading={feedbackLoading} onRefresh={refreshFeedback} onShowFeedbackForm={() => setShowFeedbackForm(true)} onShowCalibrationForm={() => setShowCalibrationForm(true)} />}
              {tab === "activity" && <ActivityTab />}
            </div>
          </>
        )}
      </div>
      {/* Phase 5 Modals */}
      {showFeedbackForm && job && (
        <BusinessFeedbackFormModal jobId={job.id} jobTitle={job.title} onClose={() => setShowFeedbackForm(false)} onSuccess={() => { setShowFeedbackForm(false); refreshFeedback(); }} />
      )}
      {showCalibrationForm && job && feedbackData && (
        <ProfileCalibrationFormModal jobId={job.id} jobTitle={job.title} feedbackOptions={feedbackData.feedbacks} onClose={() => setShowCalibrationForm(false)} onSuccess={() => { setShowCalibrationForm(false); refreshFeedback(); }} />
      )}
    </>
  );
}

function OverviewTab({ job }: { job: JobDetail }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{job.title}</h3>
        {job.jobCode && <div className="text-xs text-[var(--color-text-tertiary)]">{job.jobCode}</div>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="部门" value={job.department?.name} />
        <Field label="职级" value={job.level} />
        <Field label="状态" badge={<StatusBadge label={job.status === "open" ? "在招" : job.status} variant="success" />} />
        <Field label="优先级" badge={<StatusBadge label={job.priority} variant={job.priority === "high" ? "danger" : "default"} />} />
        <Field label="招聘负责人" value={job.owner?.name} />
        <Field label="业务负责人" value={job.businessOwner?.name} />
        <Field label="地点" value={job.location} />
        <Field label="编制" value={job.headcount?.toString()} />
        <Field label="业务线" value={job.brandLine} />
        <Field label="薪资区间" value={job.salaryMin && job.salaryMax ? `${job.salaryMin / 1000}k - ${job.salaryMax / 1000}k` : "—"} />
      </div>
    </div>
  );
}

function Field({ label, value, badge }: { label: string; value?: string | null; badge?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-[var(--color-text-tertiary)]">{label}</div>
      <div className="mt-0.5 text-sm text-[var(--color-text-primary)]">{badge ?? value ?? "—"}</div>
    </div>
  );
}

function ProfileTab({ job }: { job: JobDetail }) {
  return (
    <div className="space-y-5">
      {job.profileSummary && (
        <Section title="画像摘要">
          <p className="text-sm text-[var(--color-text-secondary)]">{job.profileSummary}</p>
        </Section>
      )}
      {job.jdText && (
        <Section title="岗位职责">
          <p className="whitespace-pre-wrap text-sm text-[var(--color-text-secondary)]">{job.jdText}</p>
        </Section>
      )}
      {job.mustHave && <TagSection title="必备条件 (Must Have)" data={job.mustHave} />}
      {job.niceToHave && <TagSection title="加分项 (Nice to Have)" data={job.niceToHave} />}
      {job.targetCompanies && (
        <Section title="目标公司">
          <div className="flex flex-wrap gap-1.5">{job.targetCompanies.map((c) => <span key={c} className="rounded-full bg-[var(--color-surface-tertiary)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">{c}</span>)}</div>
        </Section>
      )}
      {job.interviewFocus && (
        <Section title="面试关注点">
          <div className="space-y-2">
            {job.interviewFocus.map((f, i) => (
              <div key={i} className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">{f}</div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">{title}</h4>
      {children}
    </div>
  );
}

function TagSection({ title, data }: { title: string; data: Record<string, unknown> }) {
  return (
    <Section title={title}>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(data).map(([k, v]) => (
          <span key={k} className="rounded-full bg-[var(--color-primary-light)] px-2.5 py-1 text-xs text-[var(--color-primary)]">
            {k}: {String(v)}
          </span>
        ))}
      </div>
    </Section>
  );
}

function FunnelTab({ job }: { job: JobDetail }) {
  const stages = job.applicationsByStage ?? {};
  const stageLabels: Record<string, string> = {
    sourced: "入库", hr_screen: "HR筛选", business_screen: "业务筛选",
    first_interview: "初试", second_interview: "复试", final_interview: "终面",
    offer_risk: "Offer风险", pre_onboarding: "入职前", hired: "已入职",
    rejected: "已淘汰", withdrawn: "退出", closed: "已关闭",
  };
  const maxCount = Math.max(...Object.values(stages), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--color-text-secondary)]">总计 {job.totalApplications} 候选人</span>
        <span className="text-xs text-[var(--color-text-tertiary)]">活跃 {job.activeApplications}</span>
      </div>
      {Object.entries(stageLabels).map(([key, label]) => {
        const count = stages[key] ?? 0;
        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <div key={key} className="flex items-center gap-3">
            <div className="w-20 text-xs text-[var(--color-text-secondary)]">{label}</div>
            <div className="flex-1">
              <div className="h-6 rounded bg-[var(--color-surface-tertiary)]">
                <div className="h-6 rounded bg-[var(--color-primary-light)] transition-all" style={{ width: `${pct}%` }}>
                  {count > 0 && <span className="px-2 text-xs leading-6 text-[var(--color-primary)]">{count}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FeedbackTab({ job: _job, feedbackData, loading, onRefresh, onShowFeedbackForm, onShowCalibrationForm }: {
  job: JobDetail;
  feedbackData: {
    feedbacks: Array<{ id: string; decision: string; reasonCode: string | null; reasonText: string | null; reviewer: { id: string; name: string } | null; job: { id: string; title: string; jobCode: string | null } | null; createdAt: string }>;
    decisionStats: Record<string, number>;
    reasonStats: Record<string, number>;
    profileSignals: { calibrationNeeded: boolean; topReasonCode: string | null; topReasonCount: number; rejectionRate: number; suggestedCalibrationReason: string | null } | null;
    calibrations: Array<{ id: string; sourceFeedbackIds: string[]; calibrationReason: string | null; status: string; confirmedAt: string | null; createdAt: string }>;
  } | null;
  loading: boolean;
  onRefresh: () => void;
  onShowFeedbackForm: () => void;
  onShowCalibrationForm: () => void;
}) {
  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--color-surface-tertiary)]" />)}</div>;

  return (
    <div className="space-y-5">
      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={onShowFeedbackForm} className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">创建业务反馈</button>
        <button onClick={onRefresh} className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]">刷新</button>
      </div>

      {!feedbackData && !loading && <div className="flex flex-col items-center justify-center py-8 text-center"><p className="text-sm text-[var(--color-text-secondary)]">加载反馈数据...</p></div>}

      {feedbackData && (
        <>
          {/* Decision & Reason Stats */}
          {(Object.keys(feedbackData.decisionStats).length > 0 || Object.keys(feedbackData.reasonStats).length > 0) && (
            <BusinessReasonStats decisionStats={feedbackData.decisionStats} reasonStats={feedbackData.reasonStats} />
          )}

          {/* Profile Signal Card */}
          <ProfileSignalCard signal={feedbackData.profileSignals} onCreateCalibration={onShowCalibrationForm} />

          {/* Calibration History */}
          {feedbackData.calibrations.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">画像校准历史</div>
              <ProfileCalibrationPanel calibrations={feedbackData.calibrations} onConfirm={async (id) => {
                await fetch(`/api/profile-calibrations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "confirmed" }) });
                onRefresh();
              }} />
            </div>
          )}

          {/* Feedback Timeline */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">反馈记录</div>
            <BusinessFeedbackTimeline feedbacks={feedbackData.feedbacks} />
          </div>
        </>
      )}
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 text-4xl">📭</div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">暂无岗位动态</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-xs">
        后续业务反馈、面试记录、Offer 风险和 AI 分析会沉淀在这里。
      </p>
    </div>
  );
}
