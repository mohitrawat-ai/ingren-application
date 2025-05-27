// src/lib/tables/campaign-enrollment-profiles.ts
import { pgTable, text, integer, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { campaignEnrollments } from "@/lib/tables/campaign-enrollments";

export const campaignEnrollmentProfiles = pgTable('campaign_enrollment_profiles', {
  id: serial('id').primaryKey(),
  campaignEnrollmentId: integer('campaign_enrollment_id').references(() => campaignEnrollments.id, { onDelete: 'cascade' }).notNull(),
  
  // Core profile identification
  profileId: text('profile_id').notNull(), // Original profile ID from provider
  
  // Basic identity fields
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  fullName: text('full_name').notNull(),
  
  // Professional role
  jobTitle: text('job_title').notNull(),
  department: text('department'),
  managementLevel: text('management_level'), // executive, manager, individual_contributor
  seniorityLevel: text('seniority_level'), // c-level, vp, director, etc.
  isDecisionMaker: boolean('is_decision_maker').default(false),
  
  // Contact information
  email: text('email'),
  phone: text('phone'),
  linkedinUrl: text('linkedin_url'),
  
  // Location
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  
  // Company context (stored here for performance)
  companyId: text('company_id'),
  companyName: text('company_name').notNull(),
  companyIndustry: text('company_industry'),
  companySize: integer('company_size'),
  companySizeRange: text('company_size_range'),
  companyRevenue: text('company_revenue'),
  companyDescription: text('company_description'),
  companyDomain: text('company_domain'),
  companyFounded: integer('company_founded'),
  
  // Professional context
  tenureMonths: integer('tenure_months'),
  recentJobChange: boolean('recent_job_change').default(false),
  
  // Enrichment data
  confidence: integer('confidence'), // 0-100 confidence score
  dataSource: text('data_source').notNull().default('coresignal'),
  lastEnriched: timestamp('last_enriched'),
  
  // Timestamps (enrollment tracking only)
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});