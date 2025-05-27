// src/lib/tables/target-list-contacts.ts - Updated with unified rich structure
import { pgTable, text, integer, serial, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { targetLists } from "@/lib/tables/target-lists";

// UNIFIED: Rich profile structure (same as campaign_enrollment_profiles)
export const targetListProfiles = pgTable('target_list_profiles', {
  id: serial('id').primaryKey(),
  targetListId: integer('target_list_id').notNull().references(() => targetLists.id, { onDelete: 'cascade' }),
  
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
  seniorityLevel: text('seniority_level'), // c-level, vp, director, manager, senior, mid-level, junior
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
  confidence: integer('confidence'), // 0-100 confidence score
  dataSource: text('data_source').notNull().default('coresignal'),
  lastEnriched: timestamp('last_enriched'),
  
  // Legacy compatibility fields (keeping for backward compatibility)
  apolloProspectId: text('apollo_prospect_id'), // For backward compatibility
  additionalData: json('additional_data').default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastSynced: timestamp('last_synced'),
});