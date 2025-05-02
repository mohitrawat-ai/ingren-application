CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "audience_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"audience_id" integer NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"organization_name" text NOT NULL,
	"city" text,
	"state" text,
	"country" text,
	"email" text,
	"apollo_id" text
);
--> statement-breakpoint
CREATE TABLE "campaign_audiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"name" text NOT NULL,
	"total_results" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_pitch" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"company_url" text NOT NULL,
	"company_description" text NOT NULL,
	CONSTRAINT "campaign_pitch_campaign_id_unique" UNIQUE("campaign_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_sending_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"monday" boolean DEFAULT true NOT NULL,
	"tuesday" boolean DEFAULT true NOT NULL,
	"wednesday" boolean DEFAULT true NOT NULL,
	"thursday" boolean DEFAULT true NOT NULL,
	"friday" boolean DEFAULT true NOT NULL,
	"saturday" boolean DEFAULT false NOT NULL,
	"sunday" boolean DEFAULT false NOT NULL,
	CONSTRAINT "campaign_sending_days_campaign_id_unique" UNIQUE("campaign_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"from_name" text NOT NULL,
	"from_email" text NOT NULL,
	"email_service" text NOT NULL,
	"timezone" text NOT NULL,
	"track_opens" boolean DEFAULT true NOT NULL,
	"track_clicks" boolean DEFAULT true NOT NULL,
	"daily_send_limit" integer DEFAULT 500 NOT NULL,
	"unsubscribe_link" boolean DEFAULT true NOT NULL,
	"sending_start_time" text NOT NULL,
	"sending_end_time" text NOT NULL,
	CONSTRAINT "campaign_settings_campaign_id_unique" UNIQUE("campaign_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_targeting" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pitch_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" integer NOT NULL,
	"problem" text NOT NULL,
	"solution" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "target_job_titles" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "target_organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"employee_count" text
);
--> statement-breakpoint
CREATE TABLE "urls" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"summary" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audience_contacts" ADD CONSTRAINT "audience_contacts_audience_id_campaign_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."campaign_audiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_audiences" ADD CONSTRAINT "campaign_audiences_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_pitch" ADD CONSTRAINT "campaign_pitch_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_sending_days" ADD CONSTRAINT "campaign_sending_days_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_settings" ADD CONSTRAINT "campaign_settings_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_targeting" ADD CONSTRAINT "campaign_targeting_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_features" ADD CONSTRAINT "pitch_features_pitch_id_campaign_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."campaign_pitch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_job_titles" ADD CONSTRAINT "target_job_titles_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_organizations" ADD CONSTRAINT "target_organizations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;