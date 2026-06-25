-- Phase 2.2: Job Schema Gap Patch
-- Add jobCode, brandLine, targetCompanies, interviewFocus to jobs table

ALTER TABLE "jobs"
ADD COLUMN "job_code" TEXT,
ADD COLUMN "brand_line" TEXT,
ADD COLUMN "target_companies" JSONB,
ADD COLUMN "interview_focus" JSONB;

-- Add unique constraint on job_code (if duplicates exist, they must be resolved first)
CREATE UNIQUE INDEX "jobs_job_code_key" ON "jobs"("job_code");
