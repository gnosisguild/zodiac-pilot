ALTER TABLE "Tenant"
ADD COLUMN "createdById" uuid;

UPDATE "Tenant"
SET
  "createdById" = r."userId"
FROM
  (
    SELECT
      tm."userId" AS "userId",
      tm."tenantId" AS "tenantId"
    FROM
      (
        SELECT
          "userId",
          "tenantId",
          ROW_NUMBER() OVER (
            PARTITION BY
              "tenantId"
            ORDER BY
              "createdAt" ASC
          ) AS row_number
        FROM
          "TenantMembership"
      ) AS tm
    WHERE
      tm."row_number" = 1
  ) AS r
WHERE
  "id" = r."tenantId";

--> statement-breakpoint
ALTER TABLE "Tenant"
ALTER COLUMN "createdById"
SET
  NOT NULL;

ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_createdById_User_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."User" ("id") ON DELETE cascade ON UPDATE no action;