// app/lib/services/apolloPersonService.ts

import { ApolloContact, ApolloResponse, ApolloSearchParams } from "./apolloInterfaces";

class ApolloPersonService {
  /**
   * Search for contacts using server-side Apollo API integration
   * @param params Search parameters
   * @returns Promise with contacts and pagination info
   */
  async searchContacts(params: ApolloSearchParams): Promise<ApolloResponse> {
    try {
      // Log what we're searching for (for debugging)
      console.log('Searching contacts with params:', params);
      
      // Call our server endpoint
      const response = await fetch('/api/apollo/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        // Try to get detailed error message
        let errorMessage = 'Failed to search contacts';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Ignore JSON parsing errors in error response
        }
        throw new Error(errorMessage);
      }
      
      // Parse the successful response
      const data = await response.json();
      
      // Return the contacts and pagination info
      return {
        contacts: data.contacts || [],
        pagination: data.pagination || {
          total_entries: 0,
          total_pages: 0,
          current_page: 1
        }
      };
    } catch (error: any) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }
  
  /**
   * Get a single contact by ID
   * @param id Contact ID
   * @returns Promise with contact data
   */
  async getContactById(id: string): Promise<ApolloContact | null> {
    try {
      const response = await fetch(`/api/apollo/contacts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to get contact details');
      }
      
      const data = await response.json();
      return data.contact;
    } catch (error: any) {
      console.error('Error getting contact details:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const apolloService = new ApolloPersonService();