import { getSession } from "@/server/auth/session";
import { getJobDetail } from "@/server/services/jobs/job-service";
import { requirePermission } from "@/server/permissions/check-permission";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  requirePermission(session, "jobs", "view");

  const { id } = await params;
  const job = await getJobDetail(id, session.role, session.userId, session.departmentId);

  if (!job) {
    return Response.json({ success: false, error: "Job not found" }, { status: 404 });
  }

  return Response.json({
    success: true,
    data: {
      id: job.id,
      jobCode: job.jobCode,
      title: job.title,
      department: job.department ? { id: job.department.id, name: job.department.name } : null,
      level: job.level,
      status: job.status,
      priority: job.priority,
      owner: job.owner ? { id: job.owner.id, name: job.owner.name } : null,
      businessOwner: job.businessOwner ? { id: job.businessOwner.id, name: job.businessOwner.name } : null,
      location: job.location,
      headcount: job.headcount,
      brandLine: job.brandLine,
      jdText: job.jdText,
      profileSummary: job.profileSummary,
      mustHave: job.mustHave,
      niceToHave: job.niceToHave,
      targetCompanies: job.targetCompanies,
      interviewFocus: job.interviewFocus,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      totalApplications: job.totalApplications,
      activeApplications: job.activeApplications,
      applicationsByStage: job.applicationsByStage,
    },
  });
}
