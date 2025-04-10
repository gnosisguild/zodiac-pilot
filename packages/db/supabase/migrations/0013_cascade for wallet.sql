ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_deletedById_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_deletedById_User_id_fk" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;