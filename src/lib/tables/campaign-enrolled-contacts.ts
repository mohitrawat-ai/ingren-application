import { pgTable, text, integer, serial, timestamp, json } from "drizzle-orm/pg-core";

import { campaignEnrollments } from "@/lib/tables/campaign-enrollments";


export const campaignEnrolledContacts = pgTable('campaign_enrolled_contacts', {
  id: serial('id').primaryKey(),
  campaignEnrollmentId: integer('campaign_enrollment_id').references(() => campaignEnrollments.id, { onDelete: 'cascade' }).notNull(),
  apolloProspectId: text('apollo_prospect_id').notNull(),
  contactSnapshot: json('contact_snapshot').$type<Record<string, unknown>>().notNull(),
  emailStatus: text('email_status').default('pending'), // 'pending', 'sent', 'delivered', 'opened', 'clicked', 'replied'
  lastContacted: timestamp('last_contacted'),
  responseStatus: text('response_status'), // 'no_response', 'positive', 'negative', 'neutral'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});