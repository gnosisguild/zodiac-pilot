ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_tenantId_Tenant_id_fk";
--> statement-breakpoint
DROP INDEX "Wallet_tenantId_index";--> statement-breakpoint
ALTER TABLE "Wallet" DROP COLUMN "tenantId";