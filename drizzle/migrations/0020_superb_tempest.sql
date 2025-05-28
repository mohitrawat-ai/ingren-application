ALTER TABLE "audience_contacts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "campaign_audiences" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "campaign_outreach" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "campaign_pitch" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "campaign_targeting" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cta_options" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "personalization_sources" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pitch_features" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "target_job_titles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "target_organizations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "urls" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "audience_contacts" CASCADE;--> statement-breakpoint
DROP TABLE "campaign_audiences" CASCADE;--> statement-breakpoint
DROP TABLE "campaign_outreach" CASCADE;--> statement-breakpoint
DROP TABLE "campaign_pitch" CASCADE;--> statement-breakpoint
DROP TABLE "campaign_targeting" CASCADE;--> statement-breakpoint
DROP TABLE "cta_options" CASCADE;--> statement-breakpoint
DROP TABLE "personalization_sources" CASCADE;--> statement-breakpoint
DROP TABLE "pitch_features" CASCADE;--> statement-breakpoint
DROP TABLE "target_job_titles" CASCADE;--> statement-breakpoint
DROP TABLE "target_organizations" CASCADE;--> statement-breakpoint
DROP TABLE "urls" CASCADE;--> statement-breakpoint
ALTER TABLE "target_lists" DROP CONSTRAINT "target_lists_source_list_id_target_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "target_lists" DROP COLUMN "last_synced";--> statement-breakpoint
ALTER TABLE "target_lists" DROP COLUMN "source_list_id";