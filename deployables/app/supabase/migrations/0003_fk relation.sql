ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_createdBy_User_id_fk";
--> statement-breakpoint
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_Tenant_id_fk";
--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "createdAt" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Tenant" DROP COLUMN "createdBy";