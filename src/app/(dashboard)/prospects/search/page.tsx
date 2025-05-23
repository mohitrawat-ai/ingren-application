// src/app/(dashboard)/prospects/search/page.tsx - Updated with Selection Management
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building,
  User,
  Filter,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Card,
  CardContent,
} from "@/components/ui/card";

// Import our components
import { CompanyFiltersPanel } from "@/components/prospect/search/CompanyFiltersPanel";
import { ProspectFiltersPanel } from "@/components/prospect/search/ProspectFiltersPanel";
import { CompanyDataTable } from "@/components/prospect/search/CompanyDataTable";
import { ProspectDataTable } from "@/components/prospect/search/ProspectDataTable";
import { SaveListDialog } from "@/components/prospect/search/SaveListDialog";
import { CompanyListSelector } from "@/components/prospect/search/CompanyListSelector";
import { SaveCompanyListDialog } from "@/components/prospect/search/SaveCompanyListDialog";
import { SelectionToolbar } from "@/components/prospect/search/SelectionToolbar";
import { ErrorBoundary } from "@/components/prospect/ErrorBoundary";

// Import our stores
import { useProspectSearchStore } from "@/stores/prospectStore";
import { useCompanyListStore } from "@/stores/companyListStore";

export default function ProspectSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saveProspectDialogOpen, setSaveProspectDialogOpen] = useState(false);
  const [saveCompanyDialogOpen, setSaveCompanyDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Get state and actions from prospect search store
  const {
    // UI state
    activeTab,
    setActiveTab,
    viewMode,

    // Search state
    companyQuery,
    setCompanyQuery,
    prospectQuery,
    setProspectQuery,
    searchCompanies,
    searchProspects,
    loadingCompanies,
    loadingProspects,

    // Selection state
    selectedCompanies,
    selectedProspects,
    searchMode,
    setSearchMode,
    selectedCompanyListId,
    selectedCompanyListName,
    setCompanyListScope,

    // Filters
    companyFilters,
    prospectFilters,

    // List state & actions
    newListName,
    setNewListName,
    savingList,
    saveAsList,
  } = useProspectSearchStore();

  // Get actions from company list store
  const { setSelectedCompanies } = useCompanyListStore();

  // Handle URL parameters for company list scoping
  useEffect(() => {
    const companyListParam = searchParams?.get('companyList');
    if (companyListParam) {
      const listId = parseInt(companyListParam);
      if (!isNaN(listId)) {
        // Set the company list scope from URL parameter
        setCompanyListScope(listId, `Company List ${listId}`);
        setActiveTab('prospects'); // Switch to prospects tab when scoping
      }
    }
  }, [searchParams, setCompanyListScope, setActiveTab]);

  // Auto-switch to selection mode if we have selected companies
  useEffect(() => {
    if (activeTab === "prospects" && selectedCompanies.length > 0 && searchMode === 'all') {
      setSearchMode("selection");
    }
  }, [activeTab, selectedCompanies.length, searchMode, setSearchMode]);

  const handleSearch = async () => {
    if (activeTab === "companies") {
      await searchCompanies(1);
    } else {
      await searchProspects(1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSaveProspectList = async () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    if (selectedProspects.length === 0) {
      toast.error("Please select at least one prospect");
      return;
    }

    try {
      const newListId = await saveAsList();

      if (newListId) {
        toast.success("Prospect list created successfully");
        setSaveProspectDialogOpen(false);
        router.push(`/prospect-lists/${newListId}`);
      }
    } catch (error) {
      console.error("Error saving prospect list:", error);
      toast.error("Failed to save prospect list");
    }
  };

  const handleSaveCompanyList = () => {
    if (selectedCompanies.length === 0) {
      toast.error("Please select at least one company");
      return;
    }

    // Set selected companies in company list store and open dialog
    setSelectedCompanies(selectedCompanies);
    setSaveCompanyDialogOpen(true);
  };

  const getActiveFiltersCount = () => {
    if (activeTab === "companies") {
      return companyFilters.industries.length + companyFilters.sizes.length;
    } else {
      return prospectFilters.titles.length + prospectFilters.departments.length + prospectFilters.seniorities.length;
    }
  };

  const getSearchModeLabel = () => {
    switch (searchMode) {
      case 'selection':
        return `Selected Companies (${selectedCompanies.length})`;
      case 'list':
        return selectedCompanyListName || 'Company List';
      default:
        return 'All Companies';
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/prospects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Find Prospects</h1>
          </div>
        </div>

        {/* Selection Toolbars */}
        <div className="space-y-3 mb-4">
          <SelectionToolbar 
            type="companies" 
            onSave={handleSaveCompanyList}
          />
          <SelectionToolbar 
            type="prospects" 
            onSave={() => setSaveProspectDialogOpen(true)}
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "companies" ? "Search companies..." : "Search prospects..."}
              value={activeTab === "companies" ? companyQuery : prospectQuery}
              onChange={(e) => {
                if (activeTab === "companies") {
                  setCompanyQuery(e.target.value);
                } else {
                  setProspectQuery(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
          
          <Button 
            onClick={handleSearch} 
            disabled={loadingCompanies || loadingProspects}
            size="lg"
          >
            {(loadingCompanies || loadingProspects) ? "Searching..." : "Search"}
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
                  Refine your search with filters
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                {activeTab === "companies" ? (
                  <CompanyFiltersPanel />
                ) : (
                  <ProspectFiltersPanel />
                )}
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

        {/* Company List Scoping for Prospects */}
        {activeTab === "prospects" && viewMode === "search" && (
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <CompanyListSelector className="flex-1" />
                
                {(selectedCompanies.length > 0 || selectedCompanyListId) && (
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-muted-foreground">Search in:</span>
                    <Select
                      value={searchMode}
                      onValueChange={(value: "all" | "selection" | "list") => setSearchMode(value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {selectedCompanies.length > 0 && (
                          <SelectItem value="selection">
                            Selected Companies ({selectedCompanies.length})
                          </SelectItem>
                        )}
                        {selectedCompanyListId && (
                          <SelectItem value="list">
                            {selectedCompanyListName}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {searchMode !== 'all' && (
                <div className="mt-2 p-2 bg-black-800 border border-black-200 rounded text-sm">
                  <span className="font-medium text-white-100">
                    Scoped Search: 
                  </span>
                  <span className="text-white-200 ml-1">
                    Searching for prospects only within {getSearchModeLabel()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'companies' | 'prospects')} className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="companies" className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Companies
                {selectedCompanies.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCompanies.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="prospects" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Prospects
                {selectedProspects.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedProspects.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-1 overflow-hidden border rounded-lg">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-72 border-r bg-muted/30">
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

                  {activeTab === "companies" ? (
                    <CompanyFiltersPanel />
                  ) : (
                    <ProspectFiltersPanel />
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="companies" className="h-full m-0 data-[state=inactive]:hidden">
                <div className="h-full overflow-auto">
                  <CompanyDataTable />
                </div>
              </TabsContent>

              <TabsContent value="prospects" className="h-full m-0 data-[state=inactive]:hidden">
                <div className="h-full overflow-auto">
                  <ProspectDataTable />
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>

        <SaveListDialog
          open={saveProspectDialogOpen}
          onOpenChange={setSaveProspectDialogOpen}
          listName={newListName}
          onListNameChange={setNewListName}
          onSave={handleSaveProspectList}
          isSaving={savingList}
          selectedCount={selectedProspects.length}
        />

        <SaveCompanyListDialog
          open={saveCompanyDialogOpen}
          onOpenChange={setSaveCompanyDialogOpen}
        />
      </div>
    </ErrorBoundary>
  );
}