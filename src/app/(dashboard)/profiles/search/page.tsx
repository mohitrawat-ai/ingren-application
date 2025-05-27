// src/app/(dashboard)/profiles/search/page.tsx - Updated with clean UX flow

"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PAGINATION_CONFIG } from '@/config/pagination';

import {
    ArrowLeft,
    Filter,
    Search,
    Save,
    Download,
    RefreshCw,
    AlertTriangle,
    AlertCircle,
    Check,
    X
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

// Custom hooks
import { useProfileStore } from "@/stores/profileStore";
import {
    useFilterOptions,
    useProfileSearchWithData,
} from "@/hooks/useProfileQueries";

// Components
import { ProfileFiltersPanel } from "@/components/profile/search/ProfileFiltersPanel";
import { ProfilePagination } from "@/components/profile/ProfilePagination";
import { SaveProfileListDialog } from "@/components/profile/SaveProfileListDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProfileDataTable } from "@/components/profile/search/ProfileDataTable";

export default function ProfileSearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Zustand store state - UPDATED to use user-friendly methods
    const {
        query,                    // Applied query (used for search)
        draftQuery,              // Draft query (user is typing)
        appliedFilters,          // Applied filters (used for search)
        hasSearched,             // Whether user has performed a search
        selectedProfiles,
        currentPage,
        pageSize,
        setDraftQuery,           // Set draft query
        applyFilters,            // Apply draft to search
        resetSearch,             // Reset everything
        discardChanges,          // NEW: Discard draft changes
        setPage,
        setPageSize,
        toggleProfileSelection,
        bulkSelectProfiles,
        bulkDeselectProfiles,
        clearProfileSelections,
        hasUnsavedChanges,       // NEW: User-friendly pending changes check
        getCurrentFiltersCount,  // NEW: User-friendly filter count
    } = useProfileStore();

    // React Query hooks


    const {
        data: filterOptions,
        error: filterOptionsError,
        isLoading: isLoadingFilterOptions,
        refetch: refetchFilterOptions
    } = useFilterOptions();


    // Fixed useEffect in ProfileSearchPage - prevent router updates during render

    // Fixed useEffect in ProfileSearchPage - prevent router updates during render

    useEffect(() => {
        if (!isInitialized) {
            const urlQuery = searchParams.get('q') || '';
            const urlPage = parseInt(searchParams.get('page') || '1');
            const urlPageSize = parseInt(searchParams.get('pageSize') || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE.toString());

            // FIXED: Remove dependency checks that could cause loops
            setDraftQuery(urlQuery);
            setPage(urlPage);
            setPageSize(urlPageSize);

            setIsInitialized(true);
        }
    }, [isInitialized, searchParams, setDraftQuery, setPage, setPageSize]); // Include Zustand actions

const apiFilters = useMemo(() => {
    // Don't compute filters if not initialized to prevent premature API calls
    if (!isInitialized || !hasSearched) {
        return {
            // Don't include page/pageSize here as it would trigger new searches
        };
    }

    return {
        ...appliedFilters,
        keywords: query,
        // Remove page and pageSize from here - they're handled separately
    };
}, [isInitialized, hasSearched, appliedFilters, query]); // Remove currentPage and pageSize from dependencies

// Update the useProfileSearchWithData call to pass pagination separately:
const {
    profiles,
    totalResults,
    pagination,
    isLoading,
    error: searchError,
    refetchSearch,
    noResults,
} = useProfileSearchWithData(
    apiFilters, 
    currentPage,  // Pass pagination separately
    pageSize,     // Pass pagination separately
    hasSearched
);

    // Event handlers
    const handleSearch = () => {
        applyFilters();

        // Update URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('q', draftQuery);
        newUrl.searchParams.set('page', '1');
        router.replace(newUrl.toString(), { scroll: false });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleReset = () => {
        resetSearch();

        // Clear URL params
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('q');
        newUrl.searchParams.delete('page');
        router.replace(newUrl.toString(), { scroll: false });
    };

    const handleDiscardChanges = () => {
        discardChanges();
    };

    const handlePageChange = (page: number) => {
        setPage(page);

        // Update URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('page', page.toString());
        router.replace(newUrl.toString(), { scroll: false });
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);

        // Update URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('pageSize', size.toString());
        newUrl.searchParams.set('page', '1');
        router.replace(newUrl.toString(), { scroll: false });
    };

    const handleSelectAll = () => {
        const unselectedProfiles = profiles.filter(
            profile => !selectedProfiles.some(selected => selected.id === profile.id)
        );

        if (unselectedProfiles.length > 0) {
            bulkSelectProfiles(unselectedProfiles);
        } else {
            const currentPageIds = profiles.map(p => p.id);
            bulkDeselectProfiles(currentPageIds);
        }
    };

    const handleExportCSV = () => {
        if (selectedProfiles.length === 0) return;

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

    // Check if search criteria exists
    const hasSearchCriteria = draftQuery.trim() || getCurrentFiltersCount() > 0;
    const unsavedChanges = hasUnsavedChanges();

    // Don't render until initialized
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

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
                                Find profiles using enhanced profile data and company context
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
                <div className="space-y-4 mb-6">
                    {/* UPDATED: Clean unsaved changes alert */}
                    {unsavedChanges && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="flex items-center justify-between">
                                    <span>You have unsaved search changes.</span>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            onClick={handleSearch}
                                            className="h-7"
                                        >
                                            <Check className="mr-1 h-3 w-3" />
                                            Apply Changes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDiscardChanges}
                                            className="h-7"
                                        >
                                            <X className="mr-1 h-3 w-3" />
                                            Discard
                                        </Button>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Search bar */}
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search profiles by name, title, company, or keywords..."
                                value={draftQuery}
                                onChange={(e) => setDraftQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-9"
                            />
                        </div>

                        <Button
                            onClick={handleSearch}
                            disabled={isLoading || !hasSearchCriteria}
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
                                    {hasSearched ? 'Search Again' : 'Search'}
                                </>
                            )}
                        </Button>

                        {hasSearched && (
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                disabled={isLoading}
                            >
                                Reset
                            </Button>
                        )}

                        {/* Mobile Filters */}
                        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filters
                                    {getCurrentFiltersCount() > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {getCurrentFiltersCount()}
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

                        {/* UPDATED: Clean desktop filters indicator */}
                        <div className="hidden lg:flex items-center gap-2">
                            {getCurrentFiltersCount() > 0 && (
                                <Badge variant="secondary">
                                    {getCurrentFiltersCount()} {getCurrentFiltersCount() === 1 ? 'filter' : 'filters'} active
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {filterOptionsError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Filter options unavailable</div>
                                <div className="text-sm">
                                    Cannot load search filters. Please check your connection and try again.
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => refetchFilterOptions()}
                                disabled={isLoadingFilterOptions}
                            >
                                {isLoadingFilterOptions ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-3 w-3" />
                                )}
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {searchError && hasSearched && (
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
                                    {getCurrentFiltersCount() > 0 && (
                                        <Badge variant="secondary">
                                            {getCurrentFiltersCount()}
                                        </Badge>
                                    )}
                                    {isLoadingFilterOptions && (
                                        <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                                    )}
                                </div>

                                {filterOptionsError ? (
                                    <div className="text-center p-4">
                                        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                                        <div className="text-sm text-destructive mb-2">Filter options unavailable</div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => refetchFilterOptions()}
                                            disabled={isLoadingFilterOptions}
                                        >
                                            {isLoadingFilterOptions ? (
                                                <>
                                                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                                    Retrying...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-3 w-3 mr-1" />
                                                    Retry
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <ProfileFiltersPanel filterOptions={filterOptions} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {!hasSearched ? (
                            // Initial state - no search performed yet
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center max-w-md">
                                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Ready to search profiles</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Configure your search criteria and filters, then click the search button to find profiles.
                                    </p>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p>• Search by name, job title, or company keywords</p>
                                        <p>• Use filters to narrow by location, industry, and role level</p>
                                        <p>• Find decision makers with enhanced profile data</p>
                                        <p>• Search only runs when you click the search button</p>
                                    </div>

                                    {hasSearchCriteria && (
                                        <div className="mt-6">
                                            <Button onClick={handleSearch} size="lg">
                                                <Search className="mr-2 h-4 w-4" />
                                                Search Now
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : isLoading ? (
                            // Loading state
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">Searching profiles...</h3>
                                    <p className="text-muted-foreground">
                                        This may take a few moments
                                    </p>
                                </div>
                            </div>
                        ) : noResults ? (
                            // No results state
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center max-w-md">
                                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No profiles found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        No profiles match your current search criteria. Try adjusting your filters or search terms.
                                    </p>
                                    <div className="text-sm text-muted-foreground mb-6">
                                        <p>Current search:</p>
                                        <div className="mt-2 p-2 bg-muted rounded text-left">
                                            {query && <div>Query: &quot;{query}&quot;</div>}
                                            {getCurrentFiltersCount() > 0 && (
                                                <div>Filters: {getCurrentFiltersCount()} active</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                        <Button variant="outline" onClick={handleReset}>
                                            Reset Search
                                        </Button>
                                        <Button onClick={() => refetchSearch()}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Retry
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Results Header */}
                                <div className="flex items-center justify-between p-4 border-b bg-background">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <span className="font-medium">{totalResults.toLocaleString()}</span>
                                            <span className="text-muted-foreground"> profiles found</span>
                                            {unsavedChanges && (
                                                <Badge variant="outline" className="ml-2">
                                                    Changes pending
                                                </Badge>
                                            )}
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
                                </div>

                                {/* Results Content */}
                                <div className="flex-1 overflow-y-auto">
                                    <div className="p-4">
                                        <ProfileDataTable
                                            profiles={profiles}
                                            selectedProfiles={selectedProfiles}
                                            onToggleSelection={toggleProfileSelection}
                                            isLoading={isLoading}
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
                                            onPageChange={handlePageChange}
                                            onPageSizeChange={handlePageSizeChange}
                                        />
                                    </div>
                                )}
                            </>
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