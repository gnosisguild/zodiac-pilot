DROP INDEX "ActiveAccount_accountId_index";--> statement-breakpoint
DROP INDEX "ActiveAccount_tenantId_index";--> statement-breakpoint
DROP INDEX "ActiveAccount_userId_index";--> statement-breakpoint
ALTER TABLE "ActiveAccount" ADD CONSTRAINT "ActiveAccount_accountId_tenantId_userId_pk" PRIMARY KEY("accountId","tenantId","userId");--> statement-breakpoint
CREATE INDEX "Account_deletedById_index" ON "Account" USING btree ("deletedById");--> statement-breakpoint
CREATE INDEX "ProposedTransaction_accountId_index" ON "ProposedTransaction" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "Route_userId_index" ON "Route" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Tenant_createdById_index" ON "Tenant" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "Tenant_defaultWorkspaceId_index" ON "Tenant" USING btree ("defaultWorkspaceId");--> statement-breakpoint
CREATE INDEX "Wallet_deletedById_index" ON "Wallet" USING btree ("deletedById");