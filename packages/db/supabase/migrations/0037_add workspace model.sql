CREATE TABLE
	"Workspace" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
		"label" text NOT NULL,
		"createdById" uuid NOT NULL,
		"tenantId" uuid NOT NULL,
		"createdAt" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"updatedAt" timestamp
		with
			time zone,
			"deleted" boolean DEFAULT false NOT NULL,
			"deletedById" uuid,
			"deletedAt" timestamp
		with
			time zone
	);

INSERT INTO
	"Workspace" ("label", "createdById", "tenantId")
SELECT
	'Default workspace',
	"createdById",
	"id"
FROM
	"Tenant";

--> statement-breakpoint
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_createdById_User_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."User" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_deletedById_User_id_fk" FOREIGN KEY ("deletedById") REFERENCES "public"."User" ("id") ON DELETE set null ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "Workspace_tenantId_index" ON "Workspace" USING btree ("tenantId");

--> statement-breakpoint
CREATE INDEX "Workspace_createdById_index" ON "Workspace" USING btree ("createdById");

--> statement-breakpoint
CREATE INDEX "Workspace_deletedById_index" ON "Workspace" USING btree ("deletedById");