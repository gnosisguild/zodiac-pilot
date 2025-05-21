CREATE TABLE "ActiveSubscription" (
	"subscriptionPlanId" uuid NOT NULL,
	"validFrom" timestamp with time zone DEFAULT now() NOT NULL,
	"validThrough" timestamp with time zone,
	"tenantId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SubscriptionPlan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"deletedById" uuid,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ActiveSubscription" ADD CONSTRAINT "ActiveSubscription_subscriptionPlanId_SubscriptionPlan_id_fk" FOREIGN KEY ("subscriptionPlanId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ActiveSubscription" ADD CONSTRAINT "ActiveSubscription_tenantId_Tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_deletedById_User_id_fk" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ActiveSubscription_subscriptionPlanId_index" ON "ActiveSubscription" USING btree ("subscriptionPlanId");--> statement-breakpoint
CREATE INDEX "ActiveSubscription_tenantId_index" ON "ActiveSubscription" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "SubscriptionPlan_deletedById_index" ON "SubscriptionPlan" USING btree ("deletedById");