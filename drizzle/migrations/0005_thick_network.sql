ALTER TABLE "campaign_outreach" ALTER COLUMN "cta_id" SET DEFAULT 'call';--> statement-breakpoint
ALTER TABLE "campaign_outreach" ALTER COLUMN "cta_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_outreach" ALTER COLUMN "personalization_source_id" SET DEFAULT 'professional';--> statement-breakpoint
ALTER TABLE "campaign_outreach" ALTER COLUMN "personalization_source_id" DROP NOT NULL;