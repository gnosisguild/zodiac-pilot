CREATE TABLE "ActiveAccount" (
	"userId" uuid NOT NULL,
	"accountId" uuid NOT NULL,
	"tenantId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ActiveAccount" ADD CONSTRAINT "ActiveAccount_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActiveAccount" ADD CONSTRAINT "ActiveAccount_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActiveAccount" ADD CONSTRAINT "ActiveAccount_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;