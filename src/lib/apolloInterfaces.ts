
export interface ApolloSearchParams {
    organization_ids?: string[];
    q_person_title?: string[];
    q_organization_num_employees_ranges?: string[];
    page?: number;
    per_page?: number;
  }
  
export interface ApolloResponse {
    contacts: ApolloContact[];
    pagination: {
      total_entries: number;
      per_page?: number;
      current_page?: number;
      total_pages?: number;
    };
  }
  
export interface ApolloContact {
    id: string;
    name: string
    title: string;
    city: string,
    state: string,
    country: string,
    organization: {
      name: string;
    };
  }


export interface ApolloOrganization {
    id: string;
    name: string;
    website_url?: string;
    linkedin_url?: string;
    industry?: string;
    employee_count?: string;
  }
  
export interface OrganizationSearchResponse {
    organizations: ApolloOrganization[];
    pagination: {
      total_entries: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  }
  