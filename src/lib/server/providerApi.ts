"use server"

// src/lib/api/providerApi.ts
import { ProviderCompany, ProviderProspect, CompanyResponse, ProspectResponse, ProviderCompanyFilters, ProviderProspectFilters, ProviderApiClientInterface } from '@/types';


/**
 * Provider API client for communicating directly with the provider service
 */
class ProviderApiClient implements ProviderApiClientInterface{
  private apiBaseUrl: string;
  private apiKey: string;

  constructor() {
    // In a real implementation, these would be environment variables
    this.apiBaseUrl = process.env.NEXT_PUBLIC_PROVIDERS_INGREN_API_URL || 'http://localhost:3004/api/provider';
    this.apiKey = process.env.INGREN_API_KEY || '';
  }

  /**
   * Search for companies using the provider service
   */
  async searchCompanies(filters: ProviderCompanyFilters): Promise<CompanyResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/companies/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${this.apiKey}`
        },
        body: JSON.stringify({ filters }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to search companies');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  }

  /**
   * Get company details by ID
   */
  async getCompany(id: string): Promise<ProviderCompany> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/companies/${id}`, {
        headers: {
          'x-api-key': `${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get company details');
      }

      const data = await response.json();
      return data.company;
    } catch (error) {
      console.error('Error getting company details:', error);
      throw error;
    }
  }

  /**
   * Search for prospects using the provider service
   */
  async searchProspects(
    filters: ProviderProspectFilters,
    companyScope?: string[]
  ): Promise<ProspectResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/prospects/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${this.apiKey}`
        },
        body: JSON.stringify({ 
          filters,
          companyScope
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to search prospects');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching prospects:', error);
      throw error;
    }
  }

  /**
   * Get prospect details by ID
   */
  async getProspect(id: string): Promise<ProviderProspect> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/prospects/${id}`, {
        headers: {
          'x-api-key': `${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get prospect details');
      }

      const data = await response.json();
      return data.prospect;
    } catch (error) {
      console.error('Error getting prospect details:', error);
      throw error;
    }
  }

  /**
   * Enrich company data
   */
  async enrichCompany(id: string): Promise<ProviderCompany> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/companies/${id}/enrich`, {
        headers: {
          'x-api-key': `${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to enrich company data');
      }

      const data = await response.json();
      return data.company;
    } catch (error) {
      console.error('Error enriching company data:', error);
      throw error;
    }
  }

  /**
   * Enrich prospect data
   */
  async enrichProspect(id: string): Promise<ProviderProspect> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/prospects/${id}/enrich`, {
        headers: {
          'x-api-key': `${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to enrich prospect data');
      }

      const data = await response.json();
      return data.prospect;
    } catch (error) {
      console.error('Error enriching prospect data:', error);
      throw error;
    }
  }
}

let providerApiClient : ProviderApiClient | null = null

export async function getProviderApiClient() : Promise<ProviderApiClient>{
  if(providerApiClient == null){
    providerApiClient = new ProviderApiClient()
  }
  return providerApiClient
}
