ALTER TABLE "Role" ADD COLUMN "createdById" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "Role" ADD CONSTRAINT "Role_createdById_User_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Role_createdById_index" ON "Role" USING btree ("createdById");