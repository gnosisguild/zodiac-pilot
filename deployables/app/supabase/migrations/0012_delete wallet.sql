ALTER TABLE "Wallet" ADD COLUMN "deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Wallet" ADD COLUMN "deletedById" uuid;--> statement-breakpoint
ALTER TABLE "Wallet" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_deletedById_User_id_fk" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;