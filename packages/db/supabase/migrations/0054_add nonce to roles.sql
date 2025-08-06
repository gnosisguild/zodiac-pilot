ALTER TABLE "Role" ADD COLUMN "nonce" bigint;

UPDATE "Role" SET "nonce" = (random() * 2147483648)::bigint * 4294967296 + (random() * 4294967296)::bigint;

ALTER TABLE "Role" ALTER COLUMN "nonce" SET NOT NULL;