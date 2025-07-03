ALTER TABLE "Account"
ADD COLUMN "workspaceId" uuid;

-- Migrate data
--> statement-breakpoint
ALTER TABLE "Account"
ALTER COLUMN "workspaceId"
SET
  NOT NULL;

ALTER TABLE "ProposedTransaction"
ADD COLUMN "workspaceId" uuid;

-- Migarte data
ALTER TABLE "ProposedTransaction"
ALTER COLUMN "workspaceId"
SET
  NOT NULL;

--> statement-breakpoint
ALTER TABLE "SignedTransaction"
ADD COLUMN "workspaceId" uuid;

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