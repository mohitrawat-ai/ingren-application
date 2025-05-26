// src/components/profile/ProfileResults.tsx - Updated for React Query + Zustand architecture

"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Users, 
  Grid,
  List,
  Download,
  Save,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom hooks
import { useProfileStore } from "@/stores/profileStore";
import { useProfileSearchWithData } from "@/hooks/useProfileQueries";

// Components
import { ProfileList } from "./ProfileList";
import { ProfilePagination } from "./ProfilePagination";
import { SaveProfileListDialog } from "./SaveProfileListDialog";

interface ProfileResultsProps {
  className?: string;
}

export function ProfileResults({ className }: ProfileResultsProps) {
  // Local state
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'company_size' | 'recent_updates' | 'tenure'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Zustand store state
  const { 
    query, 
    filters, 
    selectedProfiles, 
    currentPage, 
    pageSize,
    setPage,
    setPageSize,
    toggleProfileSelection,
    bulkSelectProfiles,
    bulkDeselectProfiles,
    clearProfileSelections 
  } = useProfileStore();

  // Convert UI filters to API format with sorting
  const apiFilters = useMemo(() => ({
    ...filters,
    keywords: query,
    page: currentPage,
    pageSize,
    sortBy,
    sortOrder,
  }), [filters, query, currentPage, pageSize, sortBy, sortOrder]);

  // Main search query
  const {
    profiles,
    totalResults,
    pagination,
    isLoading,
    error,
    refetchSearch,
  } = useProfileSearchWithData(apiFilters, currentPage, pageSize);

  // Event handlers
  const handleSelectAll = () => {
    const unselectedProfiles = profiles.filter(
      profile => !selectedProfiles.some(selected => selected.id === profile.id)
    );
    
    if (unselectedProfiles.length > 0) {
      bulkSelectProfiles(unselectedProfiles);
    } else {
      // All are selected, deselect current page
      const currentPageIds = profiles.map(p => p.id);
      bulkDeselectProfiles(currentPageIds);
    }
  };

  const handleExportCSV = () => {
    if (selectedProfiles.length === 0) {
      return;
    }

    const headers = [
      "First Name", "Last Name", "Full Name", "Job Title", "Department", 
      "Company", "Industry", "Employee Count", "Email", "Phone",
      "City", "State", "Country", "Management Level", "Seniority Level", 
      "Decision Maker", "LinkedIn URL", "Skills", "Current Tenure (Months)"
    ];
    
    const csvContent = [
      headers.join(","),
      ...selectedProfiles.map(profile => [
        `"${profile.firstName || ''}"`,
        `"${profile.lastName || ''}"`,
        `"${profile.fullName || ''}"`,
        `"${profile.jobTitle || ''}"`,
        `"${profile.department || ''}"`,
        `"${profile.company?.name || ''}"`,
        `"${profile.company?.industry || ''}"`,
        `"${profile.company?.employeeCount || ''}"`,
        `"${profile.email || ''}"`,
        `"${profile.phone || ''}"`,
        `"${profile.city || ''}"`,
        `"${profile.state || ''}"`,
        `"${profile.country || ''}"`,
        `"${profile.managementLevel || ''}"`,
        `"${profile.seniorityLevel || ''}"`,
        `"${profile.isDecisionMaker ? 'Yes' : 'No'}"`,
        `"${profile.linkedinUrl || ''}"`,
        `"${profile.skills?.join('; ') || ''}"`,
        `"${profile.currentTenure?.monthsInRole || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `profile_search_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRetry = () => {
    refetchSearch();
  };

  // Compute selection states
  const allCurrentPageSelected = profiles.length > 0 && 
    profiles.every(profile => selectedProfiles.some(selected => selected.id === profile.id));
  
  const someCurrentPageSelected = profiles.some(profile => 
    selectedProfiles.some(selected => selected.id === profile.id)
  );

  // Get search summary text
  const getSearchSummary = () => {
    const parts = [];
    
    if (query) {
      parts.push(`"${query}"`);
    }
    
    if (filters.role?.jobTitles?.length) {
      parts.push(`${filters.role.jobTitles.length} job title${filters.role.jobTitles.length > 1 ? 's' : ''}`);
    }
    
    if (filters.company?.industries?.length) {
      parts.push(`${filters.company.industries.length} industr${filters.company.industries.length > 1 ? 'ies' : 'y'}`);
    }
    
    if (filters.location?.states?.length) {
      parts.push(`${filters.location.states.length} location${filters.location.states.length > 1 ? 's' : ''}`);
    }
    
    if (parts.length === 0) {
      return "All profiles";
    }
    
    return parts.join(" • ");
  };

  // Loading skeleton
  if (isLoading && profiles.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          
          {/* Results skeleton */}
          <div className="space-y-4">
            {[...Array(pageSize)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && profiles.length === 0) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <div className="font-medium mb-1">Search Failed</div>
              <div className="text-sm">{error.message}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No results state
  if (!isLoading && profiles.length === 0 && totalResults === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No profiles found</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              No profiles match your current search criteria. Try adjusting your filters or search terms.
            </p>
            <div className="text-sm text-muted-foreground mb-4">
              Searched for: {getSearchSummary()}
            </div>
            <Button variant="outline" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Selection Banner */}
      {selectedProfiles.length > 0 && (
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Users className="h-3 w-3 mr-1" />
                {selectedProfiles.length} selected
              </Badge>
              <span className="text-sm text-muted-foreground">
                Across all search results
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={selectedProfiles.length === 0}
              >
                <Download className="mr-1 h-3 w-3" />
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={() => setSaveDialogOpen(true)}
                disabled={selectedProfiles.length === 0}
              >
                <Save className="mr-1 h-3 w-3" />
                Save as List
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearProfileSelections}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : (
                <>
                  {totalResults.toLocaleString()} profile{totalResults !== 1 ? 's' : ''} found
                </>
              )}
            </h2>
            {!isLoading && totalResults > 0 && (
              <p className="text-sm text-muted-foreground">
                {getSearchSummary()}
              </p>
            )}
          </div>
          
          {profiles.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {allCurrentPageSelected 
                ? 'Deselect Page' 
                : someCurrentPageSelected 
                  ? 'Select Page' 
                  : 'Select All'
              }
            </Button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sort Controls */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "relevance" | "company_size" | "recent_updates" | "tenure")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="company_size">Company Size</SelectItem>
              <SelectItem value="recent_updates">Recent Updates</SelectItem>
              <SelectItem value="tenure">Tenure</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>

          {/* View Mode Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {viewMode === 'cards' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewMode('cards')}>
                <Grid className="mr-2 h-4 w-4" />
                Cards View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('table')}>
                <List className="mr-2 h-4 w-4" />
                Table View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error Alert (for partial failures) */}
      {error && profiles.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some results may be incomplete due to an error: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      <div className="space-y-4">
        <ProfileList 
          profiles={profiles}
          selectedProfiles={selectedProfiles}
          onToggleSelection={toggleProfileSelection}
          viewMode={viewMode}
        />

        {/* Loading indicator for pagination */}
        {isLoading && profiles.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-6">
          <ProfilePagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalResults={pagination.total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Save List Dialog */}
      <SaveProfileListDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />
    </div>
  );
}