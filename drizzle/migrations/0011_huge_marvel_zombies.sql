CREATE TABLE "campaign_enrolled_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_enrollment_id" integer NOT NULL,
	"apollo_prospect_id" text NOT NULL,
	"contact_snapshot" json NOT NULL,
	"email_status" text DEFAULT 'pending',
	"last_contacted" timestamp,
	"response_status" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"source_target_list_id" integer NOT NULL,
	"enrollment_date" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"snapshot_data" json DEFAULT '{}'::json
);
--> statement-breakpoint
CREATE TABLE "target_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_synced" timestamp,
	"used_in_campaigns" boolean DEFAULT false NOT NULL,
	"campaign_count" integer DEFAULT 0 NOT NULL,
	"source_list_id" integer,
	"visibility" text DEFAULT 'private' NOT NULL,
	"created_by" text,
	"shared_with" json DEFAULT '[]'::json
);
--> statement-breakpoint
CREATE TABLE "target_list_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_list_id" integer NOT NULL,
	"apollo_prospect_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"title" text,
	"company_name" text,
	"first_name" text,
	"last_name" text,
	"department" text,
	"city" text,
	"state" text,
	"country" text,
	"additional_data" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_synced" timestamp
);
--> statement-breakpoint
CREATE TABLE "target_list_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_list_id" integer NOT NULL,
	"apollo_company_id" text NOT NULL,
	"company_name" text NOT NULL,
	"industry" text,
	"employee_count" text,
	"domain" text,
	"location" text,
	"description" text,
	"additional_data" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_synced" timestamp
);
--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD CONSTRAINT "campaign_enrolled_contacts_campaign_enrollment_id_campaign_enrollments_id_fk" FOREIGN KEY ("campaign_enrollment_id") REFERENCES "public"."campaign_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_enrollments" ADD CONSTRAINT "campaign_enrollments_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_enrollments" ADD CONSTRAINT "campaign_enrollments_source_target_list_id_target_lists_id_fk" FOREIGN KEY ("source_target_list_id") REFERENCES "public"."target_lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_lists" ADD CONSTRAINT "target_lists_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_lists" ADD CONSTRAINT "target_lists_source_list_id_target_lists_id_fk" FOREIGN KEY ("source_list_id") REFERENCES "public"."target_lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_lists" ADD CONSTRAINT "target_lists_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_list_contacts" ADD CONSTRAINT "target_list_contacts_target_list_id_target_lists_id_fk" FOREIGN KEY ("target_list_id") REFERENCES "public"."target_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_list_companies" ADD CONSTRAINT "target_list_companies_target_list_id_target_lists_id_fk" FOREIGN KEY ("target_list_id") REFERENCES "public"."target_lists"("id") ON DELETE cascade ON UPDATE no action;