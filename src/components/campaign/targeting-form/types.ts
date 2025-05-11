// src/components/campaign/targeting-form/types.ts

export interface Organization {
  id: string;
  name: string;
  industry?: string;
  employeeCount?: string;
  website_url?: string;
  linkedin_url?: string;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  organization: {
    name: string;
  };
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  // Added prospect fields
  first_name?: string;
  last_name?: string;
  department?: string;
  tenure_months?: number;
  notable_achievement?: string;
  // Added company fields
  company_industry?: string;
  company_employee_count?: string;
  company_annual_revenue?: string;
  company_funding_stage?: string;
  company_growth_signals?: string;
  company_recent_news?: string;
  company_technography?: string;
  company_description?: string;
}

export interface OrganizationSearchResponse {
  organizations: Organization[];
  pagination: {
    total_entries: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export interface ContactSearchResponse {
  contacts: Contact[];
  pagination: {
    total_entries: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export interface CSVContact {
  // Basic fields
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  
  // Prospect fields
  first_name?: string;
  last_name?: string;
  job_title?: string;
  department?: string;
  tenure_months?: number;
  notable_achievement?: string;
  
  // Company fields
  company_name?: string;
  industry?: string;
  employee_count?: string;
  annual_revenue?: string;
  funding_stage?: string;
  growth_signals?: string;
  recent_news?: string;
  technography?: string;
  description?: string;
  
  [key: string]: unknown; // For additional fields
}

export interface TargetingFormValues {
  organizations?: Organization[];
  jobTitles?: string[];
  contacts: Contact[];
}