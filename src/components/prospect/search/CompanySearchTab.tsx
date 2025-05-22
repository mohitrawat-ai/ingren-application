"use client";

import { useState } from "react";
import { Search, X, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination";

import { CompanyCard } from "./CompanyCard";
import { useProspectSearchStore } from "@/stores/prospectStore";


export function CompanySearchTab() {
  // Get everything from the store
  const {
    companyQuery, 
    setCompanyQuery,
    searchCompanies,
    loadingCompanies,
    companies,
    selectedCompanies,
    toggleCompanySelection,
    companyFilters,
    updateCompanyFilter,
    companyPagination
  } = useProspectSearchStore();

  // Local state for handling the enter key in search
  const [searchInputValue, setSearchInputValue] = useState(companyQuery);

  const handleSearch = async () => {
    // Update the store query with our local value
    setCompanyQuery(searchInputValue);
    await searchCompanies(1); // Always start from page 1 when searching
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleIndustryChange = (industry: string) => {
    updateCompanyFilter('industries', industry);
  };

  const handleEmployeeSizeChange = (size: string) => {
    updateCompanyFilter('sizes', size);
  };

  const handlePageChange = (page: number) => {
    searchCompanies(page);
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!companyPagination) return null;
    
    const { page, total: totalPages } = companyPagination;
    const items = [];
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => page > 1 && handlePageChange(page - 1)}
          className={page === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    // Page numbers with ellipsis for large ranges
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink 
            onClick={() => handlePageChange(1)}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Ellipsis after first page if needed
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            onClick={() => handlePageChange(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => page < totalPages && handlePageChange(page + 1)}
          className={page === totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    return items;
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-8"
            />
          </div>
          <Button onClick={handleSearch} disabled={loadingCompanies}>
            {loadingCompanies ? "Searching..." : "Search"}
          </Button>
        </div>
        
        <div className="flex gap-2 mt-2">
          {companyFilters.industries.map(industry => (
            <Badge key={industry} variant="outline" className="flex items-center gap-1">
              {industry}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleIndustryChange(industry)}
              />
            </Badge>
          ))}
          
          {companyFilters.sizes.map(size => (
            <Badge key={size} variant="outline" className="flex items-center gap-1">
              {size} employees
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleEmployeeSizeChange(size)}
              />
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {loadingCompanies ? (
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
                onSelect={() => toggleCompanySelection(company)}
              />
            ))}
          </div>
        )}
      </div>
      
      {companyPagination && companyPagination.pages > 1 && (
        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              {generatePaginationItems()}
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      <div className="p-3 border-t bg-muted/30">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">
              {companyPagination ? (
                <>
                  {companyPagination.total} companies found 
                  (Page {companyPagination.page} of {companyPagination.pages})
                </>
              ) : (
                `${companies.length} companies found`
              )}
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