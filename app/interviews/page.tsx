"use client";

import { useState, useEffect, useCallback } from "react";
import { InterviewList } from "@/components/domain/interviews/InterviewList";
import { InterviewDetailDrawer } from "@/components/domain/interviews/InterviewDetailDrawer";
import { InterviewFeedbackForm } from "@/components/domain/interviews/InterviewFeedbackForm";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionDenied } from "@/components/ui/PermissionDenied";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";

interface InterviewData {
  id: string;
  round: string;
  status: string;
  scheduledAt: string | null;
  completedAt?: string | null;
  application: {
    id: string;
    stage: string;
    candidate: { id: string; name: string; currentCompany: string; currentTitle: string };
    job: { id: string; title: string; jobCode: string; department: { name: string }; level: string };
  };
  interviewer: { id: string; name: string };
  feedbacks: Array<{
    id: string;
    overallRecommendation: string | null;
    scores: Record<string, number> | null;
    evidenceText: string | null;
    riskNotes: string | null;
    feedbackQualityScore: number | null;
    qualityLevel: string | null;
    riskSignals: unknown;
    submittedAt: string | null;
    interviewer: { id: string; name: string };
  }>;
}

interface Metrics {
  totalInterviews: number;
  feedbackSubmittedCount: number;
  feedbackPendingCount: number;
  feedbackOnTimeRate: number;
  avgFeedbackQualityScore: number;
  overdueFeedbackCount: number;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewData | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      const res = await fetch(`/api/interviews?${params.toString()}`);
      const data = await res.json();
      if (!data.success) {
        if (res.status === 403 || data.error?.includes("Permission denied")) {
          setPermissionDenied(true);
        } else {
          setError(data.error || "Failed to load interviews");
        }
        return;
      }
      setInterviews(data.interviews || []);
      setMetrics(data.metrics || null);
      setPermissionDenied(false);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(statusFilter);
  }, [fetchData, statusFilter]);

  const handleInterviewClick = (interview: InterviewData) => {
    setSelectedInterview(interview);
    setShowFeedbackForm(false);
  };

  const handleCloseDrawer = () => {
    setSelectedInterview(null);
    setShowFeedbackForm(false);
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackForm(false);
    fetchData(statusFilter);
  };

  if (loading) return <LoadingSkeleton />;
  if (permissionDenied) return <PermissionDenied />;
  if (error) return <ErrorState title={error} onRetry={() => fetchData(statusFilter)} />;

  return (
    <ProductShell
      title="面试管理"
      description="查看面试安排、反馈状态、面试质量和候选人表现风险"
      kpiRow={
        metrics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard label="待反馈面试" value={metrics.feedbackPendingCount} trendDirection={metrics.feedbackPendingCount > 3 ? "up" : "flat"} />
            <KpiCard label="已提交反馈" value={metrics.feedbackSubmittedCount} />
            <KpiCard label="逾期反馈" value={metrics.overdueFeedbackCount} trendDirection={metrics.overdueFeedbackCount > 0 ? "up" : "flat"} />
            <KpiCard label="平均反馈质量分" value={metrics.avgFeedbackQualityScore} />
            <KpiCard label="反馈及时率" value={`${metrics.feedbackOnTimeRate}%`} />
          </div>
        ) : undefined
      }
      filterBar={
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-[var(--color-border)] p-0.5">
            {[
              { value: "all", label: "全部" },
              { value: "scheduled", label: "待面试" },
              { value: "completed", label: "已完成" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  statusFilter === opt.value
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {interviews.length === 0 ? (
        <EmptyState
          title="暂无面试记录"
          description="当前筛选条件下没有面试数据"
        />
      ) : (
        <InterviewList
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          interviews={interviews as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onInterviewClick={handleInterviewClick as any}
        />
      )}

      {selectedInterview && (
        <InterviewDetailDrawer
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          interview={selectedInterview as any}
          onClose={handleCloseDrawer}
          onSubmitFeedback={() => setShowFeedbackForm(true)}
        />
      )}

      {showFeedbackForm && selectedInterview && (
        <InterviewFeedbackForm
          interviewId={selectedInterview.id}
          candidateName={selectedInterview.application.candidate.name}
          jobTitle={selectedInterview.application.job.title}
          round={selectedInterview.round}
          onSuccess={handleFeedbackSubmitted}
          onCancel={() => setShowFeedbackForm(false)}
        />
      )}
    </ProductShell>
  );
}
