CREATE TYPE "public"."AllowanceInterval" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
ALTER TABLE "ActionAsset" ADD COLUMN "allowance" bigint;--> statement-breakpoint
ALTER TABLE "ActionAsset" ADD COLUMN "interval" "AllowanceInterval";