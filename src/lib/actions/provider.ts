"use server"

import { getProviderApiClient } from "@/lib/server/providerApi";
import { CompanyResponse, ProviderCompanyFilters, ProviderCompany, ProviderProspect, ProspectResponse, ProviderProspectFilters } from "@/types";

const providerClient = await getProviderApiClient();

export async function searchCompanies(filters: ProviderCompanyFilters): Promise<CompanyResponse> {
    return providerClient.searchCompanies(filters);
}

export async function getCompany(id: string): Promise<ProviderCompany> {
    return providerClient.getCompany(id);
}

export async function enrichCompany(id: string): Promise<ProviderCompany> {
    return providerClient.enrichCompany(id);
}

export async function enrichProspect(id: string): Promise<ProviderProspect> {
    return providerClient.enrichProspect(id);
}

export async function getProspect(id: string): Promise<ProviderProspect> {
    return providerClient.getProspect(id);
}

export async function searchProspects(filters: ProviderProspectFilters, companyScope?: string[]): Promise<ProspectResponse> {
    return providerClient.searchProspects(filters, companyScope);
}