ALTER TABLE "campaign_outreach" ALTER COLUMN "cta_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "campaign_outreach" ALTER COLUMN "cta_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_outreach" ALTER COLUMN "personalization_source_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "campaign_outreach" ALTER COLUMN "personalization_source_id" SET NOT NULL;