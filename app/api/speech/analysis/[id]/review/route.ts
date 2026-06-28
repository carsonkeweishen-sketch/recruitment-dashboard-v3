// Phase 8.10: PATCH /api/speech/analysis/:id/review — Accept/edit/reject AI analysis
import { getSession } from "@/server/auth/session";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // interviewer: 403
  if (session.role === "interviewer") {
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status as string | undefined;
  if (!status || !["accepted", "edited", "rejected"].includes(status)) {
    return Response.json(
      { success: false, error: "status must be one of: accepted, edited, rejected" },
      { status: 400 }
    );
  }

  try {
    // Verify the analysis exists
    const analysis = await prisma.communicationAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return Response.json({ success: false, error: "未找到该分析记录" }, { status: 404 });
    }

    // Create review record
    const review = await prisma.communicationReview.create({
      data: {
        analysisId: id,
        reviewerId: session.userId,
        status: status,
        reviewNote: body.reviewNote as string | undefined ?? null,
        editedSummary: body.editedSummary as string | undefined ?? null,
      },
    });

    // Update the analysis human review status
    await prisma.communicationAnalysis.update({
      where: { id },
      data: {
        humanReviewStatus: status,
        ...(body.editedSummary ? { summary: body.editedSummary as string } : {}),
      },
    });

    return Response.json({ success: true, data: review });
  } catch (err) {
    const message = err instanceof Error ? err.message : "提交评审失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
