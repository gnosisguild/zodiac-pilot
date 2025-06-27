ALTER TABLE "Route"
ADD COLUMN "userId" uuid;

UPDATE "Route"
SET
  "userId" = w."belongsToId"
FROM
  "Route" AS r,
  "Wallet" AS w
WHERE
  r."fromId" = w."id";

--> statement-breakpoint
ALTER TABLE "Route"
ALTER COLUMN "userId"
SET
  NOT NULL;

ALTER TABLE "Route" ADD CONSTRAINT "Route_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE cascade ON UPDATE no action;