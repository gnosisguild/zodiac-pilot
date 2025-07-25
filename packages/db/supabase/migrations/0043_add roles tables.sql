CREATE TABLE "ActivatedRole" (
	"roleId" uuid NOT NULL,
	"accountId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"tenantId" uuid NOT NULL,
	CONSTRAINT "ActivatedRole_accountId_roleId_pk" PRIMARY KEY("accountId","roleId")
);
--> statement-breakpoint
CREATE TABLE "RoleMembership" (
	"roleId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"tenantId" uuid NOT NULL,
	CONSTRAINT "RoleMembership_roleId_userId_pk" PRIMARY KEY("roleId","userId")
);
--> statement-breakpoint
CREATE TABLE "Role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"tenantId" uuid NOT NULL,
	"workspaceId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ActivatedRole" ADD CONSTRAINT "ActivatedRole_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActivatedRole" ADD CONSTRAINT "ActivatedRole_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActivatedRole" ADD CONSTRAINT "ActivatedRole_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleMembership" ADD CONSTRAINT "RoleMembership_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleMembership" ADD CONSTRAINT "RoleMembership_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoleMembership" ADD CONSTRAINT "RoleMembership_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Role" ADD CONSTRAINT "Role_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ActivatedRole_accountId_index" ON "ActivatedRole" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "ActivatedRole_roleId_index" ON "ActivatedRole" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX "ActivatedRole_tenantId_index" ON "ActivatedRole" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "RoleMembership_roleId_index" ON "RoleMembership" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX "RoleMembership_tenantId_index" ON "RoleMembership" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "RoleMembership_userId_index" ON "RoleMembership" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Role_tenantId_index" ON "Role" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "Role_workspaceId_index" ON "Role" USING btree ("workspaceId");