ALTER TABLE "RoleDeployment" ALTER COLUMN "issues" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "RoleDeployment" ALTER COLUMN "issues" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD COLUMN "targetAccount" text;