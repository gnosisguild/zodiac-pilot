CREATE TABLE "ProposedTransaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction" json NOT NULL,
	"signedTransactionId" uuid,
	"userId" uuid NOT NULL,
	"tenantId" uuid NOT NULL,
	"accountId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ProposedTransaction" ADD CONSTRAINT "ProposedTransaction_signedTransactionId_SignedTransaction_id_fk" FOREIGN KEY ("signedTransactionId") REFERENCES "public"."SignedTransaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProposedTransaction" ADD CONSTRAINT "ProposedTransaction_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProposedTransaction" ADD CONSTRAINT "ProposedTransaction_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProposedTransaction" ADD CONSTRAINT "ProposedTransaction_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ProposedTransaction_tenantId_index" ON "ProposedTransaction" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "ProposedTransaction_userId_index" ON "ProposedTransaction" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "ProposedTransaction_signedTransactionId_index" ON "ProposedTransaction" USING btree ("signedTransactionId");