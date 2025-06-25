ALTER TABLE "SignedTransaction"
ADD COLUMN "routeLabel" text;

--> statement-breakpoint
ALTER TABLE "SignedTransaction"
ADD COLUMN "waypoints" json NOT NULL;

--> statement-breakpoint
UPDATE "SignedTransaction"
SET
  "routeLabel" = "Route"."label",
  "waypoints" = "Route"."waypoints"
FROM
  "SignedTransaction",
  "Route"
WHERE
  "Route"."id" = "SignedTransaction"."routeId";

ALTER TABLE "SignedTransaction"
DROP CONSTRAINT "SignedTransaction_routeId_Route_id_fk";

--> statement-breakpoint
DROP INDEX "SignedTransaction_routeId_index";

--> statement-breakpoint
ALTER TABLE "SignedTransaction"
DROP COLUMN "routeId";