import { Prospect, Company, CompanySearchResponse, ProspectSearchResponse } from '@mohitrawat-ai/ingren-types';
// import them from prospects, since some properties are made optional there
import { CompanyFilters, ProspectFilters } from './prospect';
/**
 * Enhanced Company interface with additional provider fields
 */
export type ProviderCompany = Company

/**
 * Enhanced Contact interface with additional provider fields
 */
export type ProviderProspect = Prospect

/**
 * Extended CompanyFilters interface for API requests
 */
export type ProviderCompanyFilters = CompanyFilters & {
  keywords?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Extended ProspectFilters interface for API requests
 */
export type ProviderProspectFilters = ProspectFilters & {
  keywords?: string;
  page?: number;
  pageSize?: number;
}


/**
 * API response structure for companies
 */
export type CompanyResponse = CompanySearchResponse

/**
 * API response structure for prospects
 */
export type ProspectResponse = ProspectSearchResponse

export interface ProviderApiClientInterface {
  searchCompanies(filters: ProviderCompanyFilters): Promise<CompanyResponse>;
  searchProspects(filters: ProviderProspectFilters): Promise<ProspectResponse>;
  getCompany(id: string): Promise<ProviderCompany>;
  getProspect(id: string): Promise<ProviderProspect>;
  enrichCompany(id: string): Promise<ProviderCompany>;
  enrichProspect(id: string): Promise<ProviderProspect>;
}

export type PaginationInfo = ProspectSearchResponse['pagination']
// pages is totalPages
// total is totalResults