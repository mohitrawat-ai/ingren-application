// Types for prospect data

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website_url?: string;
  linkedin_url?: string;
  employeeCount?: string;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  department?: string;
  organization: {
    id?: string;
    name: string;
  };
  // Additional fields
  firstName?: string;
  lastName?: string;
  notableAchievement?: string;
  tenureMonths?: number;
}

export interface CompanyFilters {
  industries: string[];
  employeeSizes: string[];
}

export interface ProspectFilters {
  titles: string[];
  departments: string[];
  seniorities: string[];
}

export interface SaveProspectListParams {
  name: string;
  contacts: Contact[];
  totalResults: number;
  metadata?: {
    searchFilters?: {
      company?: CompanyFilters;
      prospect?: ProspectFilters;
      companyQuery?: string;
      prospectQuery?: string;
    }
  };
}