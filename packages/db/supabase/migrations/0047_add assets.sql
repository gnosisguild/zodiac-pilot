CREATE TABLE "ActionAsset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roleActionId" uuid NOT NULL,
	"address" text,
	"symbol" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"tenantId" uuid NOT NULL,
	"workspaceId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ActionAsset" ADD CONSTRAINT "ActionAsset_roleActionId_RoleAction_id_fk" FOREIGN KEY ("roleActionId") REFERENCES "public"."RoleAction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActionAsset" ADD CONSTRAINT "ActionAsset_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActionAsset" ADD CONSTRAINT "ActionAsset_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ActionAsset_roleActionId_index" ON "ActionAsset" USING btree ("roleActionId");--> statement-breakpoint
CREATE INDEX "ActionAsset_tenantId_index" ON "ActionAsset" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "ActionAsset_workspaceId_index" ON "ActionAsset" USING btree ("workspaceId");