ALTER TABLE "campaign_enrolled_contacts" ALTER COLUMN "apollo_prospect_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_contacts" ALTER COLUMN "apollo_prospect_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "target_list_companies" ALTER COLUMN "apollo_company_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "full_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "seniority" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "company_name" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "company_industry" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "company_size" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "company_description" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "company_annual_revenue" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "company_funding_stage" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "company_employee_count" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "tenure_months" integer;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "notable_achievement" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "recent_news" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "growth_signals" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "technography" text;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "enrolled_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" DROP COLUMN "contact_snapshot";--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" DROP COLUMN "email_status";--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" DROP COLUMN "last_contacted";--> statement-breakpoint
ALTER TABLE "campaign_enrolled_contacts" DROP COLUMN "response_status";