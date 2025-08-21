CREATE TABLE "RoleDeploymentStep" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposedTransactionId" uuid,
	"signedTransactionId" uuid,
	"transactionHash" text,
	"roleDeploymentId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"tenantId" uuid NOT NULL,
	"workspaceId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "RoleDeployment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"completedAt" timestamp with time zone,
	"cancelledAt" timestamp with time zone,
	"cancelledById" uuid,
	"roleId" uuid NOT NULL,
	"createdById" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"tenantId" uuid NOT NULL,
	"workspaceId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD CONSTRAINT "RoleDeploymentStep_proposedTransactionId_ProposedTransaction_id_fk" FOREIGN KEY ("proposedTransactionId") REFERENCES "public"."ProposedTransaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD CONSTRAINT "RoleDeploymentStep_signedTransactionId_SignedTransaction_id_fk" FOREIGN KEY ("signedTransactionId") REFERENCES "public"."SignedTransaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD CONSTRAINT "RoleDeploymentStep_roleDeploymentId_RoleDeployment_id_fk" FOREIGN KEY ("roleDeploymentId") REFERENCES "public"."RoleDeployment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD CONSTRAINT "RoleDeploymentStep_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleDeploymentStep" ADD CONSTRAINT "RoleDeploymentStep_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleDeployment" ADD CONSTRAINT "RoleDeployment_cancelledById_User_id_fk" FOREIGN KEY ("cancelledById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleDeployment" ADD CONSTRAINT "RoleDeployment_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleDeployment" ADD CONSTRAINT "RoleDeployment_createdById_User_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleDeployment" ADD CONSTRAINT "RoleDeployment_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleDeployment" ADD CONSTRAINT "RoleDeployment_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "RoleDeploymentStep_roleDeploymentId_index" ON "RoleDeploymentStep" USING btree ("roleDeploymentId");--> statement-breakpoint
CREATE INDEX "RoleDeploymentStep_proposedTransactionId_index" ON "RoleDeploymentStep" USING btree ("proposedTransactionId");--> statement-breakpoint
CREATE INDEX "RoleDeploymentStep_signedTransactionId_index" ON "RoleDeploymentStep" USING btree ("signedTransactionId");--> statement-breakpoint
CREATE INDEX "RoleDeploymentStep_tenantId_index" ON "RoleDeploymentStep" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "RoleDeploymentStep_workspaceId_index" ON "RoleDeploymentStep" USING btree ("workspaceId");--> statement-breakpoint
CREATE INDEX "RoleDeployment_roleId_index" ON "RoleDeployment" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX "RoleDeployment_createdById_index" ON "RoleDeployment" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "RoleDeployment_tenantId_index" ON "RoleDeployment" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "RoleDeployment_workspaceId_index" ON "RoleDeployment" USING btree ("workspaceId");