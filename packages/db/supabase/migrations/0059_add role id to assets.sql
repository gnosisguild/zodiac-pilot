ALTER TABLE "ActionAsset"
ADD COLUMN "roleId" uuid;

UPDATE "ActionAsset" AS t
SET
  "roleId" = r."roleId"
FROM
  (
    SELECT
      ra."roleId",
      aa."roleActionId"
    FROM
      "RoleAction" ra,
      "ActionAsset" aa
    WHERE
      ra."id" = aa."roleActionId"
  ) AS r
WHERE
  t."roleActionId" = r."roleActionId";

--> statement-breakpoint
ALTER TABLE "ActionAsset"
ALTER COLUMN "roleId"
SET
  NOT NULL;

ALTER TABLE "ActionAsset" ADD CONSTRAINT "ActionAsset_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."Role" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "ActionAsset_roleId_index" ON "ActionAsset" USING btree ("roleId");