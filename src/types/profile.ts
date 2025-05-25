// src/types/profile.ts

// Core Profile interfaces
export interface ProfileFilters {
  // Geographic filters
  location?: {
    states?: string[];              // US state codes: ["CA", "NY", "TX"]
    cities?: string[];              // City names: ["San Francisco", "Austin"]
    countries?: string[];           // Country names: ["United States"]
    includeRemote?: boolean;        // Include remote workers
    metroAreas?: string[];          // Metro area names
  };
  
  // Role filters
  role?: {
    jobTitles?: string[];           // ["CEO", "CTO", "VP of Engineering"]
    departments?: string[];         // ["Engineering", "Sales", "Marketing"]
    managementLevels?: string[];    // ["executive", "manager", "individual_contributor"]
    seniorityLevels?: string[];     // ["c-level", "vp", "director", "manager", "senior"]
    isDecisionMaker?: boolean;      // Filter for decision makers
    keywords?: string;              // Free text search in job titles/descriptions
  };
  
  // Company filters
  company?: {
    industries?: string[];          // ["Technology", "Financial Services"]
    subIndustries?: string[];       // Specific sub-industries
    employeeCountRange?: {          // Company size range
      min?: number;                 // Minimum employees
      max?: number;                 // Maximum employees
    };
    revenueRange?: {               // Revenue range
      min?: string;                // e.g., "$1M"
      max?: string;                // e.g., "$100M"
    };
    foundedAfter?: number;         // Founded after year (e.g., 2015)
    foundedBefore?: number;        // Founded before year
    isB2B?: boolean;               // B2B companies only
    hasRecentFunding?: boolean;    // Companies with funding in last 24 months
    techStack?: string[];          // Technology stack
    companyKeywords?: string;      // Free text search in company names/descriptions
  };
  
  // Advanced filters
  advanced?: {
    skills?: string[];             // Technical/business skills
    educationLevel?: string[];     // ["Bachelor's", "Master's", "PhD"]
    tenureRange?: {               // Time in current role (months)
      min?: number;               // Minimum months in role
      max?: number;               // Maximum months in role
    };
    recentJobChange?: boolean;    // Started current job in last 12 months
    keywords?: string;            // General keyword search across all fields
  };
  
  // Pagination and sorting
  page?: number;                  // Page number (1-based)
  pageSize?: number;              // Results per page (max 100)
  sortBy?: 'relevance' | 'company_size' | 'recent_updates' | 'tenure';
  sortOrder?: 'asc' | 'desc';
  
  // Internal filters
  companyIds?: string[];          // Scope to specific company IDs
}

export interface TenureInfo {
  startDate: Date;               // When person started current role
  monthsInRole: number;          // Months in current role
  isCurrentRole: boolean;        // Whether this is current role
  previousTitle?: string;        // Previous job title
}

export interface ExperienceItem {
  company: string;               // Company name
  title: string;                 // Job title
  startDate: Date;               // Start date
  endDate?: Date;                // End date (undefined if current)
  description?: string;          // Job description
  isCurrent: boolean;            // Whether this is current role
}

export interface EducationInfo {
  institution: string;           // School/university name
  degree?: string;               // Degree type
  fieldOfStudy?: string;         // Field of study
  graduationYear?: number;       // Graduation year
}

export interface FundingInfo {
  lastRoundDate: Date;           // Date of last funding round
  lastRoundAmount?: number;      // Amount raised in last round
  lastRoundType: string;         // Type of round (e.g., "Series A")
  totalFunding?: number;         // Total funding raised
  investorCount?: number;        // Number of investors
}

export interface CompanyLocation {
  city: string;                  // Company city
  state: string;                 // Company state/region
  country: string;               // Company country
  address?: string;              // Full address
  postalCode?: string;           // Postal/ZIP code
  metroArea?: string;            // Metro area
  headquarters?: boolean;        // Whether this is HQ location
}

export interface CompanyProfile {
  id: string;                    // Company ID
  name: string;                  // Company name
  domain?: string;               // Company website domain
  industry: string;              // Primary industry
  subIndustry?: string;          // Sub-industry
  employeeCount: number;         // Current employee count
  employeeCountRange: string;    // Employee range (e.g., "51-200")
  revenue?: string;              // Formatted revenue string
  revenueRange?: string;         // Revenue range (e.g., "$10M-$50M")
  foundedYear?: number;          // Year company was founded
  isB2B?: boolean;               // Whether company is B2B
  location: CompanyLocation;     // Company location details
  description?: string;          // Company description
  techStack?: string[];          // Technology stack
  recentFunding?: FundingInfo;   // Recent funding information
  socialProfiles?: {
    linkedin?: string;           // LinkedIn company URL
    twitter?: string;            // Twitter handle
    website?: string;            // Company website
  };
}

export interface Profile {
  // Person Identity
  id: string;                    // Unique profile ID
  firstName: string;             // First name
  lastName: string;              // Last name
  fullName: string;              // Full name
  
  // Professional Role
  jobTitle: string;              // Current job title
  department: string;            // Current department
  managementLevel: string;       // "executive" | "manager" | "individual_contributor"
  isDecisionMaker: boolean;      // Whether person is a decision maker
  seniorityLevel: string;        // "c-level" | "vp" | "director" | "manager" | "senior" | "mid-level" | "junior"
  
  // Contact & Location
  email?: string;                // Email address (may not be available)
  phone?: string;                // Phone number (may not be available)
  city: string;                  // Current city
  state: string;                 // Current state/region
  country: string;               // Current country
  
  // Current Company Context
  company: CompanyProfile;       // Full company information
  
  // Professional Context
  currentTenure?: TenureInfo;    // Current role tenure information
  skills?: string[];             // Skills and competencies
  recentExperience?: ExperienceItem[]; // Recent work experience
  education?: EducationInfo;     // Education information
  
  // Metadata
  linkedinUrl?: string;          // LinkedIn profile URL
  lastUpdated: Date;             // When profile was last updated
  dataSource: 'coresignal';     // Data source
  confidence: number;            // Data confidence score (0-1)
}

// API Response types
export interface ProfileSearchResponse {
  profileIds: string[];
  searchMetadata: {
    queryTime: number;
    source: string;
    filters: ProfileFilters;
  };
}

export interface ProfileBatchResponse {
  profiles: Profile[];
  requested: number;
  found: number;
}

export interface ProfileValidationResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ProfileFilterOptionsResponse {
  industries: string[];
  managementLevels: string[];
  seniorityLevels: string[];
  departments: string[];
  companySizes: string[];
  usStates: string[];
  countries: string[];
}

// Extended filters for API requests
export interface ProviderProfileFilters extends ProfileFilters {
  keywords?: string;
  page?: number;
  pageSize?: number;
}

// Pagination type
export interface ProfilePaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

// Profile list management types
export interface SaveProfileListParams {
  name: string;
  description?: string;
  profiles: Profile[];
  totalResults: number;
  metadata?: {
    searchFilters?: ProfileFilters;
    query?: string;
  };
}