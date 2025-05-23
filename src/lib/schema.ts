import { pgTable, text, integer, serial, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Auth Tables
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({columns : [account.provider, account.providerAccountId]}),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Campaign Tables
export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Campaign Settings
export const campaignSettings = pgTable('campaign_settings', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull().unique(),
  fromName: text('from_name').notNull(),
  fromEmail: text('from_email').notNull(),
  emailService: text('email_service').notNull(),
  timezone: text('timezone').notNull(),
  trackOpens: boolean('track_opens').notNull().default(true),
  trackClicks: boolean('track_clicks').notNull().default(true),
  dailySendLimit: integer('daily_send_limit').notNull().default(500),
  unsubscribeLink: boolean('unsubscribe_link').notNull().default(true),
  sendingStartTime: text('sending_start_time').notNull(),
  sendingEndTime: text('sending_end_time').notNull(),
});

// Sending Days
export const campaignSendingDays = pgTable('campaign_sending_days', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull().unique(),
  monday: boolean('monday').notNull().default(true),
  tuesday: boolean('tuesday').notNull().default(true),
  wednesday: boolean('wednesday').notNull().default(true),
  thursday: boolean('thursday').notNull().default(true),
  friday: boolean('friday').notNull().default(true),
  saturday: boolean('saturday').notNull().default(false),
  sunday: boolean('sunday').notNull().default(false),
});

// Campaign Pitch
export const campaignPitch = pgTable('campaign_pitch', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull().unique(),
  companyUrl: text('company_url').notNull(),
  companyDescription: text('company_description').notNull(),
});

// Pitch Features
export const pitchFeatures = pgTable('pitch_features', {
  id: serial('id').primaryKey(),
  pitchId: integer('pitch_id').references(() => campaignPitch.id, { onDelete: 'cascade' }).notNull(),
  problem: text('problem').notNull(),
  solution: text('solution').notNull(),
});

// Campaign Targeting
export const campaignTargeting = pgTable('campaign_targeting', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
});

// Target Organizations
export const targetOrganizations = pgTable('target_organizations', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(),
  industry: text('industry'),
  employeeCount: text('employee_count'),
});

// Target Job Titles
export const targetJobTitles = pgTable('target_job_titles', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
});

// Outreach settings
export const campaignOutreach = pgTable('campaign_outreach', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull().unique(),
  messageTone: text('message_tone').notNull().default('professional'),
  selectedCta: text('selected_cta').notNull(),
});

// CTA options
export const ctaOptions = pgTable('cta_options', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  label: text('label').notNull(),
  sourceId: text('source_id').notNull(),
});

// Personalization sources
export const personalizationSources = pgTable('personalization_sources', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  sourceId: text('source_id').notNull(),
  label: text('label').notNull(),
  enabled: integer('enabled').notNull().default(0),
});


// Audience Contacts
// Extract from src/lib/schema.ts (audienceContacts table)

export const audienceContacts = pgTable('audience_contacts', {
  id: serial('id').primaryKey(),
  audienceId: integer('audience_id').references(() => campaignAudiences.id, { onDelete: 'cascade' }).notNull(),
  
  // Basic contact info (existing fields)
  name: text('name').notNull(),
  title: text('title').notNull(),
  organizationName: text('organization_name').notNull(),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  email: text('email'),
  apolloId: text('apollo_id'),
  
  // Additional prospect fields
  firstName: text('first_name'),
  lastName: text('last_name'),
  department: text('department'),
  tenureMonths: integer('tenure_months'),
  notableAchievement: text('notable_achievement'),
  
  // Additional company fields
  companyIndustry: text('company_industry'),
  companyEmployeeCount: text('company_employee_count'),
  companyAnnualRevenue: text('company_annual_revenue'),
  companyFundingStage: text('company_funding_stage'),
  companyGrowthSignals: text('company_growth_signals'),
  companyRecentNews: text('company_recent_news'),
  companyTechnography: text('company_technography'),
  companyDescription: text('company_description'),
});

// Add csvFileName to campaignAudiences table
export const campaignAudiences = pgTable('campaign_audiences', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  totalResults: integer('total_results').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  csvFileName: text('csv_file_name'), // Added field for CSV file reference
});

export const campaignOutreachRelations = relations(campaignOutreach, ({ one, many }) => ({
  campaign: many(campaigns),
  ctaOptions: one(ctaOptions, {
    fields: [campaignOutreach.campaignId],
    references: [ctaOptions.campaignId]
  }),
  personalizationSources: one(personalizationSources, {
    fields: [campaignOutreach.campaignId],
    references: [personalizationSources.campaignId]
  })
}));

// Schema relations
export const campaignRelations = relations(campaigns, ({ one, many }) => ({
  settings: one(campaignSettings, {
    fields: [campaigns.id],
    references: [campaignSettings.campaignId],
  }),
  sendingDays: one(campaignSendingDays, {
    fields: [campaigns.id],
    references: [campaignSendingDays.campaignId],
  }),
  targeting: one(campaignTargeting, {
    fields: [campaigns.id],
    references: [campaignTargeting.campaignId],
  }),
  pitch: one(campaignPitch, {
    fields: [campaigns.id],
    references: [campaignPitch.campaignId],
  }),
  audiences: many(campaignAudiences),
  outreach: one(campaignOutreach, {
    fields: [campaigns.id],
    references: [campaignOutreach.campaignId],
  }),
  ctaOptions: many(ctaOptions),
  personalizationSources: many(personalizationSources),
}));

export const audienceRelations = relations(campaignAudiences, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [campaignAudiences.campaignId],
    references: [campaigns.id],
  }),
  contacts: many(audienceContacts),
}));

export const audienceContactRelations = relations(audienceContacts, ({ one }) => ({
  audience: one(campaignAudiences, {
    fields: [audienceContacts.audienceId],
    references: [campaignAudiences.id],
  }),
}));

// URL Management
export const urls = pgTable('urls', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  summary: text('summary'),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Type exports
export type User = typeof users.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Url = typeof urls.$inferSelect;
export type ContactType = typeof audienceContacts.$inferSelect;
export type AudienceType = typeof campaignAudiences.$inferSelect;
export type SettingType = typeof campaignSettings.$inferSelect;
export type SendingDayType = typeof campaignSendingDays.$inferSelect;
export type TargetingType = typeof campaignTargeting.$inferSelect;
export type PitchType = typeof campaignPitch.$inferSelect;