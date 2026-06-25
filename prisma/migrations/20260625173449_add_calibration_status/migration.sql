-- Phase 5.1: Add status tracking fields to ProfileCalibration
ALTER TABLE "profile_calibrations" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE "profile_calibrations" ADD COLUMN "confirmed_at" TIMESTAMPTZ;
ALTER TABLE "profile_calibrations" ADD COLUMN "confirmed_by" TEXT;
