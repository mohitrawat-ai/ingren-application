// src/app/(dashboard)/profiles/search/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Filter,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";


// Import our components
import { ProfileFiltersPanel } from "@/components/profile/search/ProfileFiltersPanel";
import { ProfileDataTable } from "@/components/profile/search/ProfileDataTable";
import { ProfileSelectionToolbar } from "@/components/profile/search/ProfileSelectionToolbar";
import { SaveListDialog } from "@/components/prospect/search/SaveListDialog";
import { ErrorBoundary } from "@/components/prospect/ErrorBoundary";

// Import our store
import { useProfileStore } from "@/stores/profileStore";

export default function ProfileSearchPage() {
  const router = useRouter();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Get state and actions from profile store
  const {
    query,
    setQuery,
    filters,
    selectedProfiles,
    loadingProfiles,
    searchProfiles,
    newListName,
    setNewListName,
    savingList,
    saveAsList,
  } = useProfileStore();

  const [searchInputValue, setSearchInputValue] = useState(query);

  const handleSearch = async () => {
    setQuery(searchInputValue);
    try {
      await searchProfiles(1); // Always start from page 1 when searching
    } catch (error) {
      console.error("Error searching profiles:", error);
      toast.error("Failed to search profiles");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSaveList = async () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    if (selectedProfiles.length === 0) {
      toast.error("Please select at least one profile");
      return;
    }

    try {
      const newListId = await saveAsList();

      if (newListId) {
        toast.success("Profile list created successfully");
        setSaveDialogOpen(false);
        router.push(`/profile-lists/${newListId}`);
      }
    } catch (error) {
      console.error("Error saving profile list:", error);
      toast.error("Failed to save profile list");
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    
    // Count location filters
    if (filters.location?.countries?.length) count += filters.location.countries.length;
    if (filters.location?.states?.length) count += filters.location.states.length;
    if (filters.location?.cities?.length) count += filters.location.cities.length;
    if (filters.location?.includeRemote) count += 1;
    
    // Count role filters
    if (filters.role?.jobTitles?.length) count += filters.role.jobTitles.length;
    if (filters.role?.departments?.length) count += filters.role.departments.length;
    if (filters.role?.managementLevels?.length) count += filters.role.managementLevels.length;
    if (filters.role?.seniorityLevels?.length) count += filters.role.seniorityLevels.length;
    if (filters.role?.isDecisionMaker) count += 1;
    if (filters.role?.keywords) count += 1;
    
    // Count company filters
    if (filters.company?.industries?.length) count += filters.company.industries.length;
    if (filters.company?.employeeCountRange?.min || filters.company?.employeeCountRange?.max) count += 1;
    if (filters.company?.revenueRange?.min || filters.company?.revenueRange?.max) count += 1;
    if (filters.company?.foundedAfter || filters.company?.foundedBefore) count += 1;
    if (filters.company?.isB2B) count += 1;
    if (filters.company?.hasRecentFunding) count += 1;
    if (filters.company?.companyKeywords) count += 1;
    
    // Count advanced filters
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
            <h1 className="text-3xl font-bold">Search Profiles</h1>
          </div>
        </div>

        {/* Selection Toolbar */}
        <div className="mb-4">
          <ProfileSelectionToolbar 
            onSave={() => setSaveDialogOpen(true)}
          />
        </div>

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
            disabled={loadingProfiles}
            size="lg"
          >
            {loadingProfiles ? "Searching..." : "Search"}
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
                <ProfileFiltersPanel />
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

        <div className="flex flex-1 overflow-hidden border rounded-lg">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 border-r bg-muted/30">
            <ScrollArea className="h-full">
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

                <ProfileFiltersPanel />
              </div>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <ProfileDataTable />
            </div>
          </div>
        </div>

        <SaveListDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          listName={newListName}
          onListNameChange={setNewListName}
          onSave={handleSaveList}
          isSaving={savingList}
          selectedCount={selectedProfiles.length}
        />
      </div>
    </ErrorBoundary>
  );
}