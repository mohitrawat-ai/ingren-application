import {text, integer, timestamp, boolean } from "drizzle-orm/pg-core";


export const profileColumns = {
      // Core profile identification
  profileId: text('profile_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  fullName: text('full_name').notNull(),
  
  // Professional role
  jobTitle: text('job_title').notNull(),
  department: text('department'),
  managementLevel: text('management_level'),
  seniorityLevel: text('seniority_level'),
  isDecisionMaker: boolean('is_decision_maker').default(false),
  
  // Contact information
  email: text('email'),
  phone: text('phone'),
  linkedinUrl: text('linkedin_url'),
  
  // Location
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  
  // Company context
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
  confidence: integer('confidence'),
  dataSource: text('data_source').notNull().default('coresignal'),
  lastEnriched: timestamp('last_enriched'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
}