ALTER TABLE "cta_options" RENAME COLUMN "label" TO "cta_label";--> statement-breakpoint
ALTER TABLE "cta_options" ADD COLUMN "personalization_source_label" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cta_options" ADD COLUMN "cta_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cta_options" ADD COLUMN "personalization_source_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_outreach" DROP COLUMN "cta_id";--> statement-breakpoint
ALTER TABLE "campaign_outreach" DROP COLUMN "personalization_source_id";