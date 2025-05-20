"use client";

import { Search, X, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { CompanyCard } from "./CompanyCard";
import { Company, CompanyFilters } from "../types";

interface CompanySearchTabProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  companies: Company[];
  selectedCompanies: Company[];
  onToggleCompanySelection: (company: Company) => void;
  filters: CompanyFilters;
  onIndustryChange: (industry: string) => void;
  onEmployeeSizeChange: (size: string) => void;
}

export function CompanySearchTab({
  query,
  onQueryChange,
  onSearch,
  isLoading,
  companies,
  selectedCompanies,
  onToggleCompanySelection,
  filters,
  onIndustryChange,
  onEmployeeSizeChange
}: CompanySearchTabProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={onSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
        
        <div className="flex gap-2 mt-2">
          {filters.industries.map(industry => (
            <Badge key={industry} variant="outline" className="flex items-center gap-1">
              {industry}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onIndustryChange(industry)}
              />
            </Badge>
          ))}
          
          {filters.employeeSizes.map(size => (
            <Badge key={size} variant="outline" className="flex items-center gap-1">
              {size} employees
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onEmployeeSizeChange(size)}
              />
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-2" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No companies found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                isSelected={selectedCompanies.some(c => c.id === company.id)}
                onSelect={() => onToggleCompanySelection(company)}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t bg-muted/30">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">
              {companies.length} companies found
            </span>
          </div>
          <div>
            <span className="text-sm font-medium">
              {selectedCompanies.length} selected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}