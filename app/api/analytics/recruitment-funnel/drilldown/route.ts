// Phase 8.2R: GET /api/analytics/recruitment-funnel/drilldown
// Returns object-level detail for a specific stage/job/channel
import { getSession } from "@/server/auth/session";
import { buildScopeWhere } from "@/server/permissions/check-permission";
import * as repo from "@/server/services/analytics/recruitment-funnel-repository";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "暂无权限访问招聘漏斗", safe: true }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "stage"; // stage | job | channel
    const value = url.searchParams.get("value") || ""; // stage key, jobId, or channel name

    const scope = buildScopeWhere(
      { role: session.role, userId: session.userId, departmentId: session.departmentId },
      "jobs"
    );

    if (scope.scope === "DENY") {
      return Response.json({ success: false, error: "暂无权限" }, { status: 403 });
    }

    // Get all scoped data
    const filter = {
      dateFrom: url.searchParams.get("dateFrom") ? new Date(url.searchParams.get("dateFrom")!) : undefined,
      dateTo: url.searchParams.get("dateTo") ? new Date(url.searchParams.get("dateTo")!) : undefined,
    };

    const applications = await repo.findApplicationsForFunnel(scope, filter);

    let filtered: typeof applications = [];

    if (type === "job" && value) {
      filtered = applications.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any) => a.jobId === value
      );
    } else if (type === "channel" && value) {
      filtered = applications.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any) => (a.candidate?.source || a.source) === value
      );
    } else if (type === "stage" && value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stageMap: Record<string, string[]> = {
        sourced: ["sourced"],
        applied: ["applied"],
        resume_reviewed: ["hr_screen"],
        screen_passed: ["business_screen"],
        interview_scheduled: ["first_interview", "second_interview", "final_interview"],
        interview_completed: ["first_interview", "second_interview", "final_interview"],
        feedback_submitted: ["first_interview", "second_interview", "final_interview"],
        interview_passed: ["first_interview", "second_interview", "final_interview"],
        offer_risk: ["offer_risk"],
        closed: ["rejected", "withdrawn", "closed"],
      };
      const stageValues = stageMap[value] || [value];
      filtered = applications.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any) => stageValues.includes(a.stage)
      );
    }

    // Sanitize: remove PII
    const sanitized = filtered.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => ({
        applicationId: a.id,
        stage: a.stage,
        status: a.status,
        source: a.candidate?.source || a.source,
        jobTitle: a.job?.title || null,
        jobId: a.jobId,
        createdAt: a.createdAt,
        // No candidate name/email/phone in drilldown for non-admin
      })
    );

    return Response.json({
      success: true,
      data: {
        type,
        value,
        count: sanitized.length,
        items: sanitized.slice(0, 50),
      },
    });
  } catch {
    return Response.json({ success: false, error: "明细数据加载失败" }, { status: 500 });
  }
}
