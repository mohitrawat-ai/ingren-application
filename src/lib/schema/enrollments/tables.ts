import { pgTable, text, integer, serial, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { campaigns } from "@/lib/schema/campaigns/tables";
import { targetLists } from "../profiles/tables";

export const campaignEnrollments = pgTable('campaign_enrollments', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  sourceTargetListId: integer('source_target_list_id').references(() => targetLists.id).notNull(),
  enrollmentDate: timestamp('enrollment_date').notNull().defaultNow(),
  status: text('status').notNull().default('active'),
  snapshotData: json('snapshot_data').$type<Record<string, unknown>>().default({}),
});

export const campaignEnrollmentProfiles = pgTable('campaign_enrollment_profiles', {
  id: serial('id').primaryKey(),
  campaignEnrollmentId: integer('campaign_enrollment_id').references(() => campaignEnrollments.id, { onDelete: 'cascade' }).notNull(),
  
  // IDENTICAL structure to target_list_profiles (minus target_list_id, plus campaign_enrollment_id)
  profileId: text('profile_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  fullName: text('full_name').notNull(),
  jobTitle: text('job_title').notNull(),
  department: text('department'),
  managementLevel: text('management_level'),
  seniorityLevel: text('seniority_level'),
  isDecisionMaker: boolean('is_decision_maker').default(false),
  email: text('email'),
  phone: text('phone'),
  linkedinUrl: text('linkedin_url'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  companyId: text('company_id'),
  companyName: text('company_name').notNull(),
  companyIndustry: text('company_industry'),
  companySize: integer('company_size'),
  companySizeRange: text('company_size_range'),
  companyRevenue: text('company_revenue'),
  companyDescription: text('company_description'),
  companyDomain: text('company_domain'),
  companyFounded: integer('company_founded'),
  tenureMonths: integer('tenure_months'),
  recentJobChange: boolean('recent_job_change').default(false),
  confidence: integer('confidence'),
  dataSource: text('data_source').notNull().default('coresignal'),
  lastEnriched: timestamp('last_enriched'),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const campaignProfileOperations = pgTable('campaign_profile_operations', {
  id: serial('id').primaryKey(),
  enrollmentProfileId: integer('enrollment_profile_id').references(() => campaignEnrollmentProfiles.id, { onDelete: 'cascade' }).notNull(),
  
  // Email tracking
  emailStatus: text('email_status').notNull().default('pending'),
  lastEmailSent: timestamp('last_email_sent'),
  emailsSentCount: integer('emails_sent_count').notNull().default(0),
  
  // Response tracking
  responseStatus: text('response_status').notNull().default('none'),
  firstResponseDate: timestamp('first_response_date'),
  lastResponseDate: timestamp('last_response_date'),
  
  // Engagement tracking
  openCount: integer('open_count').notNull().default(0),
  clickCount: integer('click_count').notNull().default(0),
  replyCount: integer('reply_count').notNull().default(0),
  
  // Campaign flow tracking
  currentSequenceStep: integer('current_sequence_step').notNull().default(1),
  nextScheduledContact: timestamp('next_scheduled_contact'),
  lastContactAttempt: timestamp('last_contact_attempt'),
  
  // Status tracking
  isActive: text('is_active').notNull().default('true'),
  unsubscribedAt: timestamp('unsubscribed_at'),
  pausedAt: timestamp('paused_at'),
  pauseReason: text('pause_reason'),
  
  // Notes and manual tracking
  notes: text('notes'),
  manualTags: text('manual_tags'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});