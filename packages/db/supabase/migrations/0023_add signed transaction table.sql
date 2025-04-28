CREATE TABLE "SignedTransaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction" json NOT NULL,
	"walletId" uuid NOT NULL,
	"accountId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"routeId" uuid NOT NULL,
	"tenantId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "SignedTransaction" ADD CONSTRAINT "SignedTransaction_walletId_Wallet_id_fk" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SignedTransaction" ADD CONSTRAINT "SignedTransaction_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SignedTransaction" ADD CONSTRAINT "SignedTransaction_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SignedTransaction" ADD CONSTRAINT "SignedTransaction_routeId_Route_id_fk" FOREIGN KEY ("routeId") REFERENCES "public"."Route"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SignedTransaction" ADD CONSTRAINT "SignedTransaction_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "SignedTransaction_accountId_index" ON "SignedTransaction" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "SignedTransaction_routeId_index" ON "SignedTransaction" USING btree ("routeId");--> statement-breakpoint
CREATE INDEX "SignedTransaction_tenantId_index" ON "SignedTransaction" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "SignedTransaction_userId_index" ON "SignedTransaction" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "SignedTransaction_walletId_index" ON "SignedTransaction" USING btree ("walletId");