CREATE INDEX "ActiveFeature_featureId_index" ON "ActiveFeature" USING btree ("featureId");--> statement-breakpoint
CREATE INDEX "ActiveFeature_tenantId_index" ON "ActiveFeature" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "User_tenantId_index" ON "User" USING btree ("tenantId");--> statement-breakpoint
ALTER TABLE "ActiveFeature" ADD CONSTRAINT "ActiveFeature_featureId_tenantId_unique" UNIQUE("featureId","tenantId");