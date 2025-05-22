// Types for prospect data
import * as t from "@mohitrawat-ai/ingren-types"

type Prospect = t.Prospect;
type Company = t.Company;
type ProspectFilters = Partial<t.ProspectFilters> & Pick<t.ProspectFilters, "titles" | "departments" | "seniorities">;
type CompanyFilters = Partial<t.CompanyFilters> & Pick<t.CompanyFilters, "industries" | "sizes">;

export interface SaveProspectListParams {
  name: string;
  contacts: Prospect[];
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


export type {Prospect, Company, ProspectFilters, CompanyFilters}