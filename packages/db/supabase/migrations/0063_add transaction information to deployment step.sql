ALTER TABLE "RoleDeploymentStep" ADD COLUMN "index" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD COLUMN "chainId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD COLUMN "account" json NOT NULL;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD COLUMN "calls" json NOT NULL;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD COLUMN "transactionBundle" json NOT NULL;