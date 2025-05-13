ALTER TABLE "campaign_outreach" ADD COLUMN "selected_personalization_source" text NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_outreach" ADD COLUMN "cta_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_outreach" ADD COLUMN "personalization_source_id" text NOT NULL;