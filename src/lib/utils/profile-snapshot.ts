import { sql } from 'drizzle-orm';
import type { DatabaseTransaction } from '@/types/database';

export async function takeProfileSnapshot(tx: DatabaseTransaction, enrollmentId: number, profileListId: number) {
  /**
   * IMPORTANT: This query copies profiles from target_list_profiles to campaign_enrollment_profiles
   * 
   * EXCLUDED FIELDS (not copied):
   * - id: Auto-generated primary key
   * - target_list_id: Replaced with campaign_enrollment_id
   * - apollo_prospect_id: Legacy field, not needed in enrollments
   * - additional_data: Legacy JSON field, not needed
   * - created_at: Will use enrollment timestamp
   * - last_synced: Not relevant for enrolled profiles
   * 
   * TRANSFORMED FIELDS:
   * - campaign_enrollment_id: Set to the enrollment ID instead of target_list_id
   * 
   * When adding new fields to target_list_profiles, remember to:
   * 1. Add them to campaign_enrollment_profiles schema
   * 2. Update this query
   * 3. Update the mapper in profileMapper.ts
   */
  await tx.execute(sql`
    INSERT INTO campaign_enrollment_profiles (
      campaign_enrollment_id,
      -- Core Identity
      profile_id, first_name, last_name, full_name,
      -- Professional Role  
      job_title, department, management_level, seniority_level, is_decision_maker,
      -- Contact Info
      email, phone, linkedin_url,
      -- Location
      city, state, country,
      -- Company Context
      company_id, company_name, company_industry, company_size, company_size_range,
      company_revenue, company_description, company_domain, company_founded,
      -- Professional Context
      tenure_months, recent_job_change,
      -- Enrichment Data
      confidence, data_source, last_enriched
    )
    SELECT 
      ${enrollmentId},
      -- Core Identity
      profile_id, first_name, last_name, full_name,
      -- Professional Role
      job_title, department, management_level, seniority_level, is_decision_maker,
      -- Contact Info  
      email, phone, linkedin_url,
      -- Location
      city, state, country,
      -- Company Context
      company_id, company_name, company_industry, company_size, company_size_range,
      company_revenue, company_description, company_domain, company_founded,
      -- Professional Context
      tenure_months, recent_job_change,
      -- Enrichment Data
      confidence, data_source, last_enriched
    FROM target_list_profiles 
    WHERE target_list_id = ${profileListId}
  `);
}