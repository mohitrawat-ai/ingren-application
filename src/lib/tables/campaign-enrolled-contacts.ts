// src/lib/tables/campaign-enrolled-contacts.ts
import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { campaignEnrollments } from "@/lib/tables/campaign-enrollments";

export const campaignEnrolledContacts = pgTable('campaign_enrolled_contacts', {
  id: serial('id').primaryKey(),
  campaignEnrollmentId: integer('campaign_enrollment_id').references(() => campaignEnrollments.id, { onDelete: 'cascade' }).notNull(),
  apolloProspectId: text('apollo_prospect_id'),
  
  // Core contact fields (for operations & LLM)
  email: text('email'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  fullName: text('full_name').notNull(),
  title: text('title'),
  department: text('department'),
  seniority: text('seniority'),
  
  // Company fields
  companyName: text('company_name'),
  companyIndustry: text('company_industry'),
  companySize: text('company_size'),
  companyDescription: text('company_description'),
  companyAnnualRevenue: text('company_annual_revenue'),
  companyFundingStage: text('company_funding_stage'),
  companyEmployeeCount: text('company_employee_count'),
  
  // Location fields
  city: text('city'),
  state: text('state'),
  country: text('country'),
  
  // Personalization fields (for LLM)
  tenureMonths: integer('tenure_months'),
  notableAchievement: text('notable_achievement'),
  recentNews: text('recent_news'),
  growthSignals: text('growth_signals'),
  technography: text('technography'),
  
  // Timestamps
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});