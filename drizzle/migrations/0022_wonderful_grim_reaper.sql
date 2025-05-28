ALTER TABLE "target_list_profiles" ADD COLUMN "profile_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "first_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "full_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "job_title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "management_level" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "seniority_level" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "is_decision_maker" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "linkedin_url" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "state" text NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "country" text NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "company_id" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "company_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "company_industry" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "company_size" integer;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "company_size_range" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "company_revenue" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "company_description" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "company_domain" text;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "company_founded" integer;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "tenure_months" integer;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "recent_job_change" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "confidence" integer;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "data_source" text DEFAULT 'coresignal' NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "last_enriched" timestamp;--> statement-breakpoint
ALTER TABLE "target_list_profiles" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;