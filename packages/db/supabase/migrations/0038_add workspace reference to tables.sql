ALTER TABLE "Account"
ADD COLUMN "workspaceId" uuid;

UPDATE "Account"
SET
  "workspaceId" = r."workspaceId"
FROM
  (
    SELECT
      w."id" AS "workspaceId",
      a."id" AS "accountId"
    FROM
      "Account" AS a,
      "Workspace" AS w
    WHERE
      a."tenantId" = w."tenantId"
  ) AS r
WHERE
  "id" = r."accountId";

-- Migrate data
--> statement-breakpoint
ALTER TABLE "Account"
ALTER COLUMN "workspaceId"
SET
  NOT NULL;

ALTER TABLE "ProposedTransaction"
ADD COLUMN "workspaceId" uuid;

UPDATE "ProposedTransaction"
SET
  "workspaceId" = r."workspaceId"
FROM
  (
    SELECT
      w."id" AS "workspaceId",
      a."id" AS "proposedTransactionId"
    FROM
      "ProposedTransaction" AS a,
      "Workspace" AS w
    WHERE
      a."tenantId" = w."tenantId"
  ) AS r
WHERE
  "id" = r."proposedTransactionId";

-- Migarte data
ALTER TABLE "ProposedTransaction"
ALTER COLUMN "workspaceId"
SET
  NOT NULL;

--> statement-breakpoint
ALTER TABLE "SignedTransaction"
ADD COLUMN "workspaceId" uuid;

UPDATE "SignedTransaction"
SET
  "workspaceId" = r."workspaceId"
FROM
  (
    SELECT
      w."id" AS "workspaceId",
      a."id" AS "signedTransactionId"
    FROM
      "SignedTransaction" AS a,
      "Workspace" AS w
    WHERE
      a."tenantId" = w."tenantId"
  ) AS r
WHERE
  "id" = r."signedTransactionId";

-- Migrate data
ALTER TABLE "SignedTransaction"
ALTER COLUMN "workspaceId"
SET
  NOT NULL;

--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "ProposedTransaction" ADD CONSTRAINT "ProposedTransaction_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace" ("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "SignedTransaction" ADD CONSTRAINT "SignedTransaction_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace" ("id") ON DELETE cascade ON UPDATE no action;