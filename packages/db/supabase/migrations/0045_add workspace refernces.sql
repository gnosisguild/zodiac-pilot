ALTER TABLE "ActivatedRole"
ADD COLUMN "workspaceId" uuid;

UPDATE "ActivatedRole" AS ar
SET
  "workspaceId" = r."workspaceId"
FROM
  (
    SELECT
      "id",
      "workspaceId"
    FROM
      "Role"
  ) AS r
WHERE
  ar."roleId" = r."id";

--> statement-breakpoint
ALTER TABLE "ActivatedRole"
ALTER COLUMN "workspaceId"
SET
  NOT NULL;

ALTER TABLE "RoleMembership"
ADD COLUMN "workspaceId" uuid;

UPDATE "RoleMembership" AS ar
SET
  "workspaceId" = r."workspaceId"
FROM
  (
    SELECT
      "id",
      "workspaceId"
    FROM
      "Role"
  ) AS r
WHERE
  ar."roleId" = r."id";

ALTER TABLE "RoleMembership"
ALTER COLUMN "workspaceId"
SET
  NOT NULL;

--> statement-breakpoint
ALTER TABLE "ActivatedRole" ADD CONSTRAINT "ActivatedRole_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "RoleMembership" ADD CONSTRAINT "RoleMembership_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "ActivatedRole_workspaceId_index" ON "ActivatedRole" USING btree ("workspaceId");

--> statement-breakpoint
CREATE INDEX "RoleMembership_workspaceId_index" ON "RoleMembership" USING btree ("workspaceId");