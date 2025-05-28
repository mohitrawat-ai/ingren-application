ALTER TABLE "campaign_settings" ADD COLUMN "tone" text DEFAULT 'professional' NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_settings" ADD COLUMN "cta" text DEFAULT 'schedule_call' NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign_settings" DROP COLUMN "track_opens";--> statement-breakpoint
ALTER TABLE "campaign_settings" DROP COLUMN "track_clicks";--> statement-breakpoint
ALTER TABLE "campaign_settings" DROP COLUMN "unsubscribe_link";