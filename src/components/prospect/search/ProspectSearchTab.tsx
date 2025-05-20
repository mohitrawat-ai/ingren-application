"use client";

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

import { ProspectCard } from "./ProspectCard";
import { Contact, ProspectFilters, Company } from "../types";

interface ProspectSearchTabProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  prospects: Contact[];
  selectedProspects: Contact[];
  onToggleProspectSelection: (prospect: Contact) => void;
  filters: ProspectFilters;
  onTitleChange: (title: string) => void;
  onDepartmentChange: (department: string) => void;
  onSeniorityChange: (seniority: string) => void;
  searchMode: "all" | "selection";
  selectedCompanies: Company[];
}

export function ProspectSearchTab({
  query,
  onQueryChange,
  onSearch,
  isLoading,
  prospects,
  selectedProspects,
  onToggleProspectSelection,
  filters,
  onTitleChange,
  onDepartmentChange,
  onSeniorityChange,
  searchMode,
  selectedCompanies
}: ProspectSearchTabProps) {
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
          {filters.titles.map(title => (
            <Badge key={title} variant="outline" className="flex items-center gap-1">
              {title}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onTitleChange(title)}
              />
            </Badge>
          ))}
          
          {filters.departments.map(department => (
            <Badge key={department} variant="outline" className="flex items-center gap-1">
              {department}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onDepartmentChange(department)}
              />
            </Badge>
          ))}
          
          {filters.seniorities.map(seniority => (
            <Badge key={seniority} variant="outline" className="flex items-center gap-1">
              {seniority}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onSeniorityChange(seniority)}
              />
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {isLoading ? (
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
                onSelect={() => onToggleProspectSelection(prospect)}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t bg-muted/30">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">
              {prospects.length} prospects found
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