import { pgTable, text, integer, serial, timestamp, json } from "drizzle-orm/pg-core";
import { campaigns } from "@/lib/schema/campaigns/tables";
import { targetLists } from "@/lib/schema/profiles/tables";
import * as common from "@/lib/schema/common/columns";

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
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  ...common.profileColumns
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