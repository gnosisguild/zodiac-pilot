ALTER TABLE "SignedTransaction"
ADD COLUMN "routeLabel" text;

--> statement-breakpoint
ALTER TABLE "SignedTransaction"
ADD COLUMN "waypoints" json;

--> statement-breakpoint
UPDATE "SignedTransaction"
SET
  "routeLabel" = r."label",
  "waypoints" = r."waypoints"
FROM
  "SignedTransaction" AS s,
  "Route" AS r
WHERE
  r."id" = s."routeId";

ALTER TABLE "SignedTransaction"
ALTER COLUMN "waypoints"
SET
  NOT NULL;

ALTER TABLE "SignedTransaction"
DROP CONSTRAINT "SignedTransaction_routeId_Route_id_fk";

--> statement-breakpoint
DROP INDEX "SignedTransaction_routeId_index";

--> statement-breakpoint
ALTER TABLE "SignedTransaction"
DROP COLUMN "routeId";