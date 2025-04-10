-- ACTIVE FEATURE

ALTER TABLE "ActiveFeature" RENAME COLUMN "createdAt" TO "createdAt_old";
ALTER TABLE "ActiveFeature" ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT now();

UPDATE "ActiveFeature" SET "createdAt" = "createdAt_old"::timestamp;

ALTER TABLE "ActiveFeature" DROP COLUMN "createdAt_old";

-- FEATURE

ALTER TABLE "Feature" RENAME COLUMN "createdAt" TO "createdAt_old";
ALTER TABLE "Feature" ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT now();

UPDATE "Feature" SET "createdAt" = "createdAt_old"::timestamp;

ALTER TABLE "Feature" DROP COLUMN "createdAt_old";

-- TENANT

ALTER TABLE "Tenant" RENAME COLUMN "createdAt" TO "createdAt_old";
ALTER TABLE "Tenant" ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT now();

UPDATE "Tenant" SET "createdAt" = "createdAt_old"::timestamp;

ALTER TABLE "Tenant" DROP COLUMN "createdAt_old";

-- USER

ALTER TABLE "User" RENAME COLUMN "createdAt" TO "createdAt_old";
ALTER TABLE "User" ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT now();

UPDATE "User" SET "createdAt" = "createdAt_old"::timestamp;

ALTER TABLE "User" DROP COLUMN "createdAt_old";
