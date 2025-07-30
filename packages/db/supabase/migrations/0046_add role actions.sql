CREATE TYPE "public"."RoleActionType" AS ENUM('swapper', 'stake', 'bridge', 'transfer', 'custom');--> statement-breakpoint
CREATE TABLE "RoleAction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"type" "RoleActionType" NOT NULL,
	"roleId" uuid NOT NULL,
	"workspaceId" uuid NOT NULL,
	"tenantId" uuid NOT NULL,
	"createdById" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "RoleAction" ADD CONSTRAINT "RoleAction_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleAction" ADD CONSTRAINT "RoleAction_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleAction" ADD CONSTRAINT "RoleAction_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleAction" ADD CONSTRAINT "RoleAction_createdById_User_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "RoleAction_createdById_index" ON "RoleAction" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "RoleAction_roleId_index" ON "RoleAction" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX "RoleAction_tenantId_index" ON "RoleAction" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "RoleAction_workspaceId_index" ON "RoleAction" USING btree ("workspaceId");