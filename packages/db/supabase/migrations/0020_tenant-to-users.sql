CREATE TABLE "TenantMembership" (
	"tenantId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "TenantMembership_tenantId_userId_pk" PRIMARY KEY("tenantId","userId")
);
--> statement-breakpoint
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_Tenant_id_fk";
--> statement-breakpoint
DROP INDEX "User_tenantId_index";--> statement-breakpoint
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "TenantMembership_tenantId_index" ON "TenantMembership" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "TenantMembership_userId_index" ON "TenantMembership" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "tenantId";