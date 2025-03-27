CREATE TABLE "Tenant" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" date DEFAULT now() NOT NULL
);
