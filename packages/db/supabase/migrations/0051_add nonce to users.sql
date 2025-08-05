ALTER TABLE "User" ADD COLUMN "nonce" bigint;

UPDATE "User" SET "nonce" = (random() * 2147483648)::bigint * 4294967296 + (random() * 4294967296)::bigint;

ALTER TABLE "User" ALTER COLUMN "nonce" SET NOT NULL;