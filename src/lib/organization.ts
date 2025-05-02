// app/lib/services/apolloOrganizationService.ts

/**
 * Interface representing an organization returned from the Apollo API
 */
export interface ApolloOrganization {
  id: string;
  name: string;
  website_url?: string;
  logo_url?: string;
  industry?: string;
  employee_count?: string;
  linkedin_url?: string;
}

/**
 * Interface for API response from our organization search endpoint
 */
interface OrganizationSearchResponse {
  organizations: ApolloOrganization[];
  error?: string;
}

/**
 * Service to interact with Apollo organization data through our server API
 */
class ApolloOrganizationService {
  /**
   * Search for organizations by name
   * @param query The search query (organization name)
   * @param onSuccess Callback for successful search
   * @param onError Callback for error handling
   */
  async searchOrganizations(
    query: string,
    onSuccess: (organizations: ApolloOrganization[]) => void,
    onError: (errorMessage: string) => void
  ): Promise<void> {
    try {
      // Ensure the query is at least 2 characters
      if (!query || query.length < 2) {
        onSuccess([]);
        return;
      }

      // Call our API endpoint using POST
      const response = await fetch('/api/apollo/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        // Try to parse the error message from the response
        let errorMessage = 'Failed to search organizations';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Ignore JSON parsing errors
        }
        throw new Error(errorMessage);
      }

      const data: OrganizationSearchResponse = await response.json();
      
      // Check for error in the response
      if (data.error) {
        throw new Error(data.error);
      }
      
      onSuccess(data.organizations || []);
    } catch (error: any) {
      console.error('Error searching organizations:', error);
      onError(error.message || 'Failed to search organizations');
    }
  }
  
  /**
   * Get an organization by ID
   * @param id Organization ID
   * @returns Promise resolving to organization data or null if not found
   */
  async getOrganizationById(id: string): Promise<ApolloOrganization | null> {
    try {
      const response = await fetch(`/api/apollo/organizations/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to get organization details');
      }
      
      const data = await response.json();
      return data.organization;
    } catch (error: any) {
      console.error('Error getting organization details:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const apolloOrganizationService = new ApolloOrganizationService();