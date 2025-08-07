ALTER TABLE "ActionAsset"
ADD COLUMN "allowBuy" boolean;

--> statement-breakpoint
ALTER TABLE "ActionAsset"
ADD COLUMN "allowSell" boolean;

UPDATE "ActionAsset"
SET
  "allowBuy" = true,
  "allowSell" = true;

ALTER TABLE "ActionAsset"
ALTER COLUMN "allowBuy"
SET
  NOT NULL;

ALTER TABLE "ActionAsset"
ALTER COLUMN "allowSell"
SET
  NOT NULL;