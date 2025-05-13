export type TargetingFormData = {
    organizations?: {
      id: string;
      name: string;
      industry?: string;
      employeeCount?: string;
    }[];
    jobTitles?: string[];
    contacts: {
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
      [key: string]: unknown; // For additional fields
    }[];
    totalResults?: number;
    csvFileName?: string;
  }