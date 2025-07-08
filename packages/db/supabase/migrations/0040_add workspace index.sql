CREATE INDEX "Account_workspaceId_index" ON "Account" USING btree ("workspaceId");--> statement-breakpoint
CREATE INDEX "ProposedTransaction_workspaceId_index" ON "ProposedTransaction" USING btree ("workspaceId");--> statement-breakpoint
CREATE INDEX "SignedTransaction_workspaceId_index" ON "SignedTransaction" USING btree ("workspaceId");