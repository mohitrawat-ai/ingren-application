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
    name: string;
    title: string;
    company: string;
    email?: string;
    city?: string;
    state?: string;
    country?: string;
    [key: string]: unknown; // For additional fields
  }
  
  export interface TargetingFormValues {
    organizations: Organization[];
    jobTitles: string[];
    contacts: Contact[];
  }