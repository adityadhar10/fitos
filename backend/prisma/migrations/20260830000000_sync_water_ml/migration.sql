-- This column already exists in the database.
-- This migration file exists only to sync Prisma's migration history.
ALTER TABLE "DailyMetric" ADD COLUMN IF NOT EXISTS "waterMl" INTEGER NOT NULL DEFAULT 0;
