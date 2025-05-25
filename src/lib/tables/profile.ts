// src/lib/tables/profile-lists.ts
import { pgTable, text, integer, serial, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { targetLists } from "@/lib/tables/target-lists";

// Profile-specific contacts table (extends target_list_contacts for profiles)
export const profileListContacts = pgTable('profile_list_contacts', {
  id: serial('id').primaryKey(),
  targetListId: integer('target_list_id').notNull().references(() => targetLists.id, { onDelete: 'cascade' }),
  
  // Core Identity Fields
  profileId: text('profile_id').notNull(), // From provider (e.g., coresignal ID)
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  fullName: text('full_name').notNull(),
  
  // Professional Role
  jobTitle: text('job_title').notNull(),
  department: text('department'),
  managementLevel: text('management_level'), // executive, manager, individual_contributor
  seniorityLevel: text('seniority_level'), // c-level, vp, director, etc.
  isDecisionMaker: boolean('is_decision_maker').default(false),
  
  // Contact Information
  email: text('email'),
  phone: text('phone'),
  linkedinUrl: text('linkedin_url'),
  
  // Location
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  
  // Company Context (stored here for performance)
  companyId: text('company_id'),
  companyName: text('company_name').notNull(),
  companyIndustry: text('company_industry'),
  companySize: integer('company_size'),
  companySizeRange: text('company_size_range'),
  companyRevenue: text('company_revenue'),
  companyDescription: text('company_description'),
  companyDomain: text('company_domain'),
  companyFounded: integer('company_founded'),
  
  // Professional Context
  tenureMonths: integer('tenure_months'),
  skills: json('skills').$type<string[]>().default([]),
  previousTitle: text('previous_title'),
  recentJobChange: boolean('recent_job_change').default(false),
  
  // Enrichment Data
  confidence: integer('confidence'), // 0-100 confidence score
  dataSource: text('data_source').notNull().default('coresignal'),
  lastEnriched: timestamp('last_enriched'),
  
  // Full Profile Data (JSON storage for complete provider response)
  profileData: json('profile_data').$type<Record<string, unknown>>().default({}),
  
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Profile Search Cache (for performance optimization)
export const profileSearchCache = pgTable('profile_search_cache', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  searchHash: text('search_hash').notNull(), // Hash of search filters
  searchFilters: json('search_filters').$type<Record<string, unknown>>().notNull(),
  resultIds: json('result_ids').$type<string[]>().notNull(),
  totalResults: integer('total_results').notNull(),
  searchTime: integer('search_time'), // Query time in ms
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(), // Cache expiration
});

// Profile Enrichment Queue (for background enrichment)
export const profileEnrichmentQueue = pgTable('profile_enrichment_queue', {
  id: serial('id').primaryKey(),
  profileId: text('profile_id').notNull(),
  userId: text('user_id').notNull(),
  enrichmentType: text('enrichment_type').notNull(), // 'full', 'contact', 'company'
  priority: integer('priority').notNull().default(5), // 1-10 priority
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  errorMessage: text('error_message'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Profile Activity Log (for analytics and debugging)
export const profileActivityLog = pgTable('profile_activity_log', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  profileId: text('profile_id'),
  action: text('action').notNull(), // search, view, save, export, etc.
  metadata: json('metadata').$type<Record<string, unknown>>().default({}),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports for the new tables
export type ProfileListContact = typeof profileListContacts.$inferSelect;
export type ProfileSearchCache = typeof profileSearchCache.$inferSelect;
export type ProfileEnrichmentQueue = typeof profileEnrichmentQueue.$inferSelect;
export type ProfileActivityLog = typeof profileActivityLog.$inferSelect;