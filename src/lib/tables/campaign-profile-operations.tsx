// src/lib/tables/campaign-profile-operations.ts
import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { campaignEnrollmentProfiles } from "@/lib/tables/campaign-enrollment-profiles";

// Separate table for operational/tracking data
export const campaignProfileOperations = pgTable('campaign_profile_operations', {
  id: serial('id').primaryKey(),
  enrollmentProfileId: integer('enrollment_profile_id').references(() => campaignEnrollmentProfiles.id, { onDelete: 'cascade' }).notNull(),
  
  // Email tracking
  emailStatus: text('email_status').notNull().default('pending'), // pending, sent, delivered, opened, clicked, replied, bounced, failed
  lastEmailSent: timestamp('last_email_sent'),
  emailsSentCount: integer('emails_sent_count').notNull().default(0),
  
  // Response tracking
  responseStatus: text('response_status').notNull().default('none'), // none, engaged, bounced, unsubscribed, replied
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
  isActive: text('is_active').notNull().default('true'), // true, paused, completed, unsubscribed
  unsubscribedAt: timestamp('unsubscribed_at'),
  pausedAt: timestamp('paused_at'),
  pauseReason: text('pause_reason'),
  
  // Notes and manual tracking
  notes: text('notes'),
  manualTags: text('manual_tags'), // JSON array of tags
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});