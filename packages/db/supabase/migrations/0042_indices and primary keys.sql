ALTER TABLE "ActiveSubscription" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE INDEX "ActiveAccount_accountId_index" ON "ActiveAccount" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "ActiveAccount_tenantId_index" ON "ActiveAccount" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "ActiveAccount_userId_index" ON "ActiveAccount" USING btree ("userId");