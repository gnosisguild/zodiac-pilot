CREATE TYPE "public"."RoleDeploymentIssue" AS ENUM('NoActiveAccounts', 'NoActiveMembers', 'MissingDefaultWallet');--> statement-breakpoint
CREATE TYPE "public"."SerAccountType" AS ENUM('EOA', 'SAFE', 'ROLES', 'DELAY');--> statement-breakpoint
ALTER TABLE "RoleDeployment" ADD COLUMN "issues" "RoleDeploymentIssue"[];