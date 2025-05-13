CREATE TABLE "campaign_outreach" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"message_tone" text DEFAULT 'professional' NOT NULL,
	"selected_cta" text NOT NULL,
	CONSTRAINT "campaign_outreach_campaign_id_unique" UNIQUE("campaign_id")
);
--> statement-breakpoint
CREATE TABLE "cta_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personalization_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"source_id" text NOT NULL,
	"label" text NOT NULL,
	"enabled" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaign_outreach" ADD CONSTRAINT "campaign_outreach_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cta_options" ADD CONSTRAINT "cta_options_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personalization_sources" ADD CONSTRAINT "personalization_sources_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;