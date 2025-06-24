ALTER TABLE "ActiveRoute" RENAME TO "DefaultRoute";--> statement-breakpoint
ALTER TABLE "DefaultRoute" DROP CONSTRAINT "ActiveRoute_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "DefaultRoute" DROP CONSTRAINT "ActiveRoute_accountId_Account_id_fk";
--> statement-breakpoint
ALTER TABLE "DefaultRoute" DROP CONSTRAINT "ActiveRoute_routeId_Route_id_fk";
--> statement-breakpoint
ALTER TABLE "DefaultRoute" DROP CONSTRAINT "ActiveRoute_tenantId_Tenant_id_fk";
--> statement-breakpoint
DROP INDEX "ActiveRoute_userId_index";--> statement-breakpoint
DROP INDEX "ActiveRoute_accountId_index";--> statement-breakpoint
DROP INDEX "ActiveRoute_routeId_index";--> statement-breakpoint
DROP INDEX "ActiveRoute_tenantId_index";--> statement-breakpoint
ALTER TABLE "DefaultRoute" DROP CONSTRAINT "ActiveRoute_userId_accountId_routeId_pk";--> statement-breakpoint
ALTER TABLE "DefaultRoute" ADD CONSTRAINT "DefaultRoute_userId_accountId_routeId_pk" PRIMARY KEY("userId","accountId","routeId");--> statement-breakpoint
ALTER TABLE "DefaultRoute" ADD CONSTRAINT "DefaultRoute_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DefaultRoute" ADD CONSTRAINT "DefaultRoute_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DefaultRoute" ADD CONSTRAINT "DefaultRoute_routeId_Route_id_fk" FOREIGN KEY ("routeId") REFERENCES "public"."Route"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DefaultRoute" ADD CONSTRAINT "DefaultRoute_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "DefaultRoute_userId_index" ON "DefaultRoute" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "DefaultRoute_accountId_index" ON "DefaultRoute" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "DefaultRoute_routeId_index" ON "DefaultRoute" USING btree ("routeId");--> statement-breakpoint
CREATE INDEX "DefaultRoute_tenantId_index" ON "DefaultRoute" USING btree ("tenantId");