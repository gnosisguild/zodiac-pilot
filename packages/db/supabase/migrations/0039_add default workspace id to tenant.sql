ALTER TABLE "Tenant"
ADD COLUMN "defaultWorkspaceId" uuid;

--> statement-breakpoint
UPDATE "Tenant" AS t
SET
  "defaultWorkspaceId" = r."id"
FROM
  (
    SELECT
      w."id",
      w."tenantId"
    FROM
      "Tenant" AS t,
      "Workspace" AS w
    WHERE
      t."id" = w."tenantId"
  ) AS r
WHERE
  t."id" = r."tenantId";

ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_defaultWorkspaceId_Workspace_id_fk" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "public"."Workspace" ("id") ON DELETE set null ON UPDATE no action;