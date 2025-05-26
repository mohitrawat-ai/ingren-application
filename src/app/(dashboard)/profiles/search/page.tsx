// src/app/(dashboard)/profiles/search/page.tsx - Complete implementation

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Filter, 
  Search, 
  Save, 
  Download,
  Grid,
  List,
  RefreshCw,
  AlertTriangle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom hooks
import { useProfileStore } from "@/stores/profileStore";
import { 
  useFilterOptions, 
  useProfileSearchWithData, 
} from "@/hooks/useProfileQueries";

// Components
import { ProfileFiltersPanel } from "@/components/profile/search/ProfileFiltersPanel";
import { ProfileList } from "@/components/profile/ProfileList";
import { ProfilePagination } from "@/components/profile/ProfilePagination";
import { SaveProfileListDialog } from "@/components/profile/SaveProfileListDialog";
import { ErrorBoundary } from "@/components/prospect/ErrorBoundary";

export default function ProfileSearchPage() {
  // Local state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchInputValue, setSearchInputValue] = useState('');

  // Zustand store state
  const { 
    query, 
    filters, 
    selectedProfiles, 
    currentPage, 
    pageSize,
    setQuery,
    setPage,
    setPageSize,
    toggleProfileSelection,
    bulkSelectProfiles,
    bulkDeselectProfiles,
    clearProfileSelections 
  } = useProfileStore();

  // React Query hooks
  const {
    data: filterOptions,
    error: filterOptionsError,
    refetch: refetchFilterOptions
  } = useFilterOptions();

  // Convert UI filters to API format
  const apiFilters = useMemo(() => ({
    ...filters,
    keywords: query,
    page: currentPage,
    pageSize,
  }), [filters, query, currentPage, pageSize]);

  // Main search query
  const {
    profiles,
    totalResults,
    pagination,
    isLoading,
    error: searchError,
    refetchSearch,
  } = useProfileSearchWithData(apiFilters, currentPage, pageSize);

  // Event handlers
  const handleSearch = () => {
    setQuery(searchInputValue);
    setPage(1); // Reset to first page on new search
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
      "Company", "Industry", "Email", "City", "State", "Country", 
      "Management Level", "Seniority Level", "Decision Maker"
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
        `"${profile.email || ''}"`,
        `"${profile.city || ''}"`,
        `"${profile.state || ''}"`,
        `"${profile.country || ''}"`,
        `"${profile.managementLevel || ''}"`,
        `"${profile.seniorityLevel || ''}"`,
        `"${profile.isDecisionMaker ? 'Yes' : 'No'}"`
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
  };

  // Compute selection states
  const allCurrentPageSelected = profiles.length > 0 && 
    profiles.every(profile => selectedProfiles.some(selected => selected.id === profile.id));
  

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    
    if (filters.location?.countries?.length) count += filters.location.countries.length;
    if (filters.location?.states?.length) count += filters.location.states.length;
    if (filters.location?.cities?.length) count += filters.location.cities.length;
    if (filters.location?.includeRemote) count += 1;
    
    if (filters.role?.jobTitles?.length) count += filters.role.jobTitles.length;
    if (filters.role?.departments?.length) count += filters.role.departments.length;
    if (filters.role?.managementLevels?.length) count += filters.role.managementLevels.length;
    if (filters.role?.seniorityLevels?.length) count += filters.role.seniorityLevels.length;
    if (filters.role?.isDecisionMaker) count += 1;
    if (filters.role?.keywords) count += 1;
    
    if (filters.company?.industries?.length) count += filters.company.industries.length;
    if (filters.company?.employeeCountRange?.min || filters.company?.employeeCountRange?.max) count += 1;
    if (filters.company?.foundedAfter || filters.company?.foundedBefore) count += 1;
    if (filters.company?.isB2B) count += 1;
    if (filters.company?.hasRecentFunding) count += 1;
    if (filters.company?.companyKeywords) count += 1;
    
    if (filters.advanced?.skills?.length) count += filters.advanced.skills.length;
    if (filters.advanced?.tenureRange?.min || filters.advanced?.tenureRange?.max) count += 1;
    if (filters.advanced?.recentJobChange) count += 1;
    if (filters.advanced?.keywords) count += 1;
    
    return count;
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profiles">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Search Profiles</h1>
              <p className="text-muted-foreground">
                Find prospects using enhanced profile data and company context
              </p>
            </div>
          </div>
        </div>

        {/* Selection Toolbar */}
        {selectedProfiles.length > 0 && (
          <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedProfiles.length} profiles selected
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Across all pages
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSaveDialogOpen(true)}
                >
                  <Save className="mr-1 h-3 w-3" />
                  Save as List
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearProfileSelections}
                  className="text-destructive hover:text-destructive"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search profiles by name, title, company, or keywords..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
          
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
          
          {/* Mobile Filters */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your profile search with filters
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ProfileFiltersPanel filterOptions={filterOptions} />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Desktop Filters Indicator */}
          <div className="hidden lg:flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Badge variant="outline">
                {getActiveFiltersCount()} filters active
              </Badge>
            )}
          </div>
        </div>

        {/* Error Alerts */}
        {filterOptionsError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load filter options. Using defaults.</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchFilterOptions()}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {searchError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Search failed: {searchError.message}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchSearch()}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-1 overflow-hidden border rounded-lg">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 border-r bg-muted/30">
            <div className="h-full overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4" />
                  <h3 className="font-semibold">Filters</h3>
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </div>

                <ProfileFiltersPanel filterOptions={filterOptions} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Results Header */}
            {!isLoading && totalResults > 0 && (
              <div className="flex items-center justify-between p-4 border-b bg-background">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-medium">{totalResults.toLocaleString()}</span>
                    <span className="text-muted-foreground"> profiles found</span>
                  </div>
                  
                  {profiles.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {allCurrentPageSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {viewMode === 'cards' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
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
                </div>
              </div>
            )}

            {/* Results Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <ProfileList 
                  profiles={profiles}
                  selectedProfiles={selectedProfiles}
                  onToggleSelection={toggleProfileSelection}
                  viewMode={viewMode}
                />
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="border-t p-4 bg-background">
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
          </div>
        </div>

        {/* Save List Dialog */}
        <SaveProfileListDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
        />
      </div>
    </ErrorBoundary>
  );
}