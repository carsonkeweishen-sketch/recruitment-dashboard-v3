// Phase 5.1: Object-level ownership check for business feedback operations
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

/**
 * Check if a business_owner user has RELATED access to a specific job.
 * Returns the job if related, throws PermissionDenied if not.
 */
export async function requireJobOwnership(
  userId: string,
  jobId: string,
  role: string
): Promise<{ id: string; title: string; businessOwnerId: string | null; ownerId: string }> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, title: true, businessOwnerId: true, ownerId: true },
  });

  if (!job) {
    throw new JobOwnershipError("Job not found");
  }

  // admin/leader: full access
  if (role === "admin" || role === "leader") return job;

  // business_owner: only if job.businessOwnerId === userId
  // Note: ownerId is the HR/recruiter owner — business_owner does NOT inherit recruiter scope
  if (role === "business_owner") {
    if (job.businessOwnerId !== userId) {
      throw new JobOwnershipError("Permission denied: you are not the business owner of this job");
    }
    return job;
  }

  // hrbp/recruiter: department/owned scope handled at service layer
  // interviewer: denied at service layer
  return job;
}

/**
 * Check if a business_owner can access a specific calibration.
 *
 * @param action - "read" allows createdBy self-access; "confirm" requires job-level bizOwner scope
 */
export async function requireCalibrationOwnership(
  userId: string,
  calibrationId: string,
  role: string,
  action: "read" | "confirm" = "read"
): Promise<void> {
  const cal = await prisma.profileCalibration.findUnique({
    where: { id: calibrationId },
    select: { id: true, jobId: true, createdBy: true, job: { select: { businessOwnerId: true, ownerId: true } } },
  });

  if (!cal) {
    throw new JobOwnershipError("Calibration not found");
  }

  if (role === "admin" || role === "leader") return;

  if (role === "business_owner") {
    // business_owner: calibration must belong to a job they own as businessOwner
    const hasJobScope = cal.job.businessOwnerId === userId;
    const isCreator = cal.createdBy === userId;

    if (action === "confirm") {
      // confirm requires job-level bizOwner scope — createdBy alone is insufficient
      if (!hasJobScope) {
        throw new JobOwnershipError("Permission denied: you must be the business owner of this job to confirm calibrations");
      }
    } else {
      // read: allows createdBy self-access
      if (!hasJobScope && !isCreator) {
        throw new JobOwnershipError("Permission denied: you are not related to this calibration");
      }
    }
  }
}

export class JobOwnershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JobOwnershipError";
  }
}
