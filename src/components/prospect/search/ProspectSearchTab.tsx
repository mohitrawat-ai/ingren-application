"use client";

import { useState } from "react";
import { Search, X, Info, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination";

import { ProspectCard } from "./ProspectCard";
import { useProspectSearchStore } from "@/stores/prospectStore";

export function ProspectSearchTab() {
  // Get everything from the store
  const {
    prospectQuery,
    setProspectQuery,
    searchProspects,
    loadingProspects,
    prospects,
    selectedProspects,
    toggleProspectSelection,
    prospectFilters,
    updateProspectFilter,
    searchMode,
    selectedCompanies,
    prospectPagination
  } = useProspectSearchStore();

  // Local state for handling the enter key in search
  const [searchInputValue, setSearchInputValue] = useState(prospectQuery);

  const handleSearch = async () => {
    // Update the store query with our local value
    setProspectQuery(searchInputValue);
    await searchProspects(1); // Always start from page 1 when searching
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTitleChange = (title: string) => {
    updateProspectFilter('titles', title);
  };

  const handleDepartmentChange = (department: string) => {
    updateProspectFilter('departments', department);
  };

  const handleSeniorityChange = (seniority: string) => {
    updateProspectFilter('seniorities', seniority);
  };

  const handlePageChange = (page: number) => {
    searchProspects(page);
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!prospectPagination) return null;
    
    const { page, pages : totalPages } = prospectPagination;
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
      {searchMode === "selection" && selectedCompanies.length > 0 && (
        <div className="p-3 bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Selected Companies:</span>
              <div className="flex items-center">
                {selectedCompanies.slice(0, 3).map(company => (
                  <Badge key={company.id} variant="outline" className="mr-1">
                    {company.name}
                  </Badge>
                ))}
                {selectedCompanies.length > 3 && (
                  <Badge variant="outline">
                    +{selectedCompanies.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">
                    Searching for prospects only within the companies you have selected
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
      
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prospects by name, title, etc..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-8"
            />
          </div>
          <Button onClick={handleSearch} disabled={loadingProspects}>
            {loadingProspects ? "Searching..." : "Search"}
          </Button>
        </div>
        
        <div className="flex gap-2 mt-2">
          {prospectFilters.titles.map(title => (
            <Badge key={title} variant="outline" className="flex items-center gap-1">
              {title}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleTitleChange(title)}
              />
            </Badge>
          ))}
          
          {prospectFilters.departments.map(department => (
            <Badge key={department} variant="outline" className="flex items-center gap-1">
              {department}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleDepartmentChange(department)}
              />
            </Badge>
          ))}
          
          {prospectFilters.seniorities.map(seniority => (
            <Badge key={seniority} variant="outline" className="flex items-center gap-1">
              {seniority}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleSeniorityChange(seniority)}
              />
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {loadingProspects ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-64 mb-2" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : prospects.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No prospects found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prospects.map(prospect => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                isSelected={selectedProspects.some(p => p.id === prospect.id)}
                onSelect={() => toggleProspectSelection(prospect)}
              />
            ))}
          </div>
        )}
      </div>
      
      {prospectPagination && prospectPagination.pages > 1 && (
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
              {prospectPagination ? (
                <>
                  {prospectPagination.total} prospects found 
                  (Page {prospectPagination.page} of {prospectPagination.pages})
                </>
              ) : (
                `${prospects.length} prospects found`
              )}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium">
              {selectedProspects.length} selected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}