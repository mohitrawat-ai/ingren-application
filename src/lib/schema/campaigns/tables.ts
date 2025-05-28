import { pgTable, text, integer, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "@/lib/schema/auth/tables"; // Import from auth module

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const campaignSettings = pgTable('campaign_settings', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull().unique(),
  fromName: text('from_name').notNull(),
  fromEmail: text('from_email').notNull(),
  emailService: text('email_service').notNull(),
  timezone: text('timezone').notNull(),
  dailySendLimit: integer('daily_send_limit').notNull().default(500),
  sendingStartTime: text('sending_start_time').notNull(),
  sendingEndTime: text('sending_end_time').notNull(),
  startDate: timestamp('start_date').notNull().defaultNow(),
  tone: text('tone').notNull().default('professional'), // professional, friendly, casual, formal
  cta: text('cta').notNull().default('schedule_call'), 
});

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