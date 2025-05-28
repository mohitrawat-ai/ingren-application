import { pgTable, text, integer, serial, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { users } from "@/lib/schema/auth/tables";

export const targetLists = pgTable('target_lists', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'profile' | 'company'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  usedInCampaigns: boolean('used_in_campaigns').notNull().default(false),
  campaignCount: integer('campaign_count').notNull().default(0),
  visibility: text('visibility').notNull().default('private'),
  createdBy: text('created_by').references(() => users.id),
  sharedWith: json('shared_with').$type<string[]>().default([]),
});

export const targetListProfiles = pgTable('target_list_profiles', {
  id: serial('id').primaryKey(),
  targetListId: integer('target_list_id').notNull().references(() => targetLists.id, { onDelete: 'cascade' }),
  
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
  
  // Legacy compatibility
  apolloProspectId: text('apollo_prospect_id'),
  additionalData: json('additional_data').default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastSynced: timestamp('last_synced'),
});