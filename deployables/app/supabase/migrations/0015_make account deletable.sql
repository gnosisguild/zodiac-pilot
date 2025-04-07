ALTER TABLE "Account" ADD COLUMN "deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Account" ADD COLUMN "deletedById" uuid;--> statement-breakpoint
ALTER TABLE "Account" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_deletedById_User_id_fk" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;