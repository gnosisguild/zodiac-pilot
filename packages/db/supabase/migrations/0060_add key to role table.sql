CREATE OR REPLACE FUNCTION pg_temp.random_string(int) RETURNS text
  AS $$ SELECT
    array_to_string(ARRAY(SELECT chr(ascii('B') + round(random() * 25)::integer)
    FROM
    generate_series(1, $1)), '') $$
  LANGUAGE sql;

ALTER TABLE "RoleAction" DROP CONSTRAINT "RoleAction_roleId_key_unique";--> statement-breakpoint
ALTER TABLE "Role" ADD COLUMN "key" varchar(32);--> statement-breakpoint

UPDATE "Role" SET "key" = LOWER(pg_temp.random_string(31));

ALTER TABLE "Role" ALTER COLUMN "key" SET NOT NULL;

ALTER TABLE "RoleAction" DROP COLUMN "key";--> statement-breakpoint
ALTER TABLE "Role" ADD CONSTRAINT "Role_workspaceId_key_unique" UNIQUE("workspaceId","key");