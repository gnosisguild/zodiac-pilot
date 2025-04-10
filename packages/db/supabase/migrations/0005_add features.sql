CREATE TABLE "ActiveFeature" (
	"featureId" uuid NOT NULL,
	"tenantId" uuid NOT NULL,
	"createdAt" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Feature" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" date DEFAULT now() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ActiveFeature" ADD CONSTRAINT "ActiveFeature_featureId_Feature_id_fk" FOREIGN KEY ("featureId") REFERENCES "public"."Feature"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActiveFeature" ADD CONSTRAINT "ActiveFeature_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;