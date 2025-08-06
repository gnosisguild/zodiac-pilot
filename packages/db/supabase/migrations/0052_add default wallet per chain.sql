CREATE TABLE "DefaultWallet" (
	"chainId" integer NOT NULL,
	"userId" uuid NOT NULL,
	"walletId" uuid NOT NULL,
	CONSTRAINT "DefaultWallet_chainId_userId_walletId_pk" PRIMARY KEY("chainId","userId","walletId")
);
--> statement-breakpoint
ALTER TABLE "DefaultWallet" ADD CONSTRAINT "DefaultWallet_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DefaultWallet" ADD CONSTRAINT "DefaultWallet_walletId_Wallet_id_fk" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "DefaultWallet_userId_index" ON "DefaultWallet" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "DefaultWallet_walletId_index" ON "DefaultWallet" USING btree ("walletId");