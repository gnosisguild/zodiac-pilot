CREATE TABLE "Account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdById" uuid NOT NULL,
	"label" text,
	"chainId" integer NOT NULL,
	"address" text NOT NULL,
	"tenantId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Account_tenantId_chainId_address_unique" UNIQUE("tenantId","chainId","address")
);
--> statement-breakpoint
CREATE TABLE "ActiveRoute" (
	"userId" uuid NOT NULL,
	"accountId" uuid NOT NULL,
	"routeId" uuid NOT NULL,
	"tenantId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ActiveRoute_userId_accountId_routeId_pk" PRIMARY KEY("userId","accountId","routeId")
);
--> statement-breakpoint
CREATE TABLE "Route" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fromId" uuid,
	"toId" uuid NOT NULL,
	"waypoints" json,
	"tenantId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"belongsToId" uuid NOT NULL,
	"label" text NOT NULL,
	"address" text NOT NULL,
	"tenantId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Wallet_belongsToId_address_unique" UNIQUE("belongsToId","address")
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_createdById_User_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActiveRoute" ADD CONSTRAINT "ActiveRoute_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActiveRoute" ADD CONSTRAINT "ActiveRoute_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActiveRoute" ADD CONSTRAINT "ActiveRoute_routeId_Route_id_fk" FOREIGN KEY ("routeId") REFERENCES "public"."Route"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActiveRoute" ADD CONSTRAINT "ActiveRoute_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Route" ADD CONSTRAINT "Route_fromId_Wallet_id_fk" FOREIGN KEY ("fromId") REFERENCES "public"."Wallet"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Route" ADD CONSTRAINT "Route_toId_Account_id_fk" FOREIGN KEY ("toId") REFERENCES "public"."Account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Route" ADD CONSTRAINT "Route_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_belongsToId_User_id_fk" FOREIGN KEY ("belongsToId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Account_tenantId_index" ON "Account" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "Account_createdById_index" ON "Account" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "ActiveRoute_userId_index" ON "ActiveRoute" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "ActiveRoute_accountId_index" ON "ActiveRoute" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "ActiveRoute_routeId_index" ON "ActiveRoute" USING btree ("routeId");--> statement-breakpoint
CREATE INDEX "ActiveRoute_tenantId_index" ON "ActiveRoute" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "Route_fromId_index" ON "Route" USING btree ("fromId");--> statement-breakpoint
CREATE INDEX "Route_toId_index" ON "Route" USING btree ("toId");--> statement-breakpoint
CREATE INDEX "Route_tenantId_index" ON "Route" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "Wallet_tenantId_index" ON "Wallet" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "Wallet_belongsToId_index" ON "Wallet" USING btree ("belongsToId");