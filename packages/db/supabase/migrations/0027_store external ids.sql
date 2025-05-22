ALTER TABLE "Tenant" ADD COLUMN "externalId" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "externalId" text;--> statement-breakpoint
CREATE INDEX "Tenant_externalId_index" ON "Tenant" USING btree ("externalId");--> statement-breakpoint
CREATE INDEX "User_externalId_index" ON "User" USING btree ("externalId");