ALTER TABLE "RoleDeploymentStep" ADD COLUMN "completedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD COLUMN "completedById" uuid;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD COLUMN "cancelledAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD COLUMN "cancelledById" uuid;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD CONSTRAINT "RoleDeploymentStep_completedById_User_id_fk" FOREIGN KEY ("completedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD CONSTRAINT "RoleDeploymentStep_cancelledById_User_id_fk" FOREIGN KEY ("cancelledById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "RoleDeploymentStep_completedById_index" ON "RoleDeploymentStep" USING btree ("completedById");--> statement-breakpoint
CREATE INDEX "RoleDeploymentStep_cancelledById_index" ON "RoleDeploymentStep" USING btree ("cancelledById");