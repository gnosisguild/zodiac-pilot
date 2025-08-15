ALTER TABLE "Account"
ADD COLUMN "nonce" bigint;

UPDATE "Account" SET "nonce" = (random() * 2147483648)::bigint * 4294967296 + (random() * 4294967296)::bigint;

ALTER TABLE "Account"
ALTER COLUMN "nonce"
SET
  NOT NULL;

--> statement-breakpoint
ALTER TABLE "Role"
DROP COLUMN "nonce";