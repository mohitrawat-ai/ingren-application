"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Building, 
  User,
  Save,
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

// Import our prospect-specific components
import { CompanyFiltersPanel } from "@/components/prospect/search/CompanyFiltersPanel";
import { ProspectFiltersPanel } from "@/components/prospect/search/ProspectFiltersPanel";
import { CompanySearchTab } from "@/components/prospect/search/CompanySearchTab";
import { ProspectSearchTab } from "@/components/prospect/search/ProspectSearchTab";
import { SaveListDialog } from "@/components/prospect/search/SaveListDialog";

import { searchCompanies, searchProspects, saveProspectList } from "@/lib/actions/prospect";
import { 
  Company, 
  Contact, 
  CompanyFilters, 
  ProspectFilters 
} from "@/components/prospect/types";

export default function ProspectSearch() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("companies");
  const [searchMode, setSearchMode] = useState<"all" | "selection">("all");
  
  // Search inputs
  const [companyQuery, setCompanyQuery] = useState("");
  const [prospectQuery, setProspectQuery] = useState("");
  
  // Search results
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [prospects, setProspects] = useState<Contact[]>([]);
  const [selectedProspects, setSelectedProspects] = useState<Contact[]>([]);
  
  // UI states
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  
  // Filters
  const [companyFilters, setCompanyFilters] = useState<CompanyFilters>({
    industries: [],
    employeeSizes: [],
  });
  
  const [prospectFilters, setProspectFilters] = useState<ProspectFilters>({
    titles: [],
    departments: [],
    seniorities: [],
  });

  useEffect(() => {
    // If we have selected companies and switch to prospects tab,
    // automatically set search mode to selection
    if (activeTab === "prospects" && selectedCompanies.length > 0) {
      setSearchMode("selection");
    }
  }, [activeTab, selectedCompanies.length]);

  const handleSearchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const results = await searchCompanies(companyQuery, companyFilters);
      setCompanies(results);
    } catch (error) {
      toast.error("Failed to search companies");
      console.error(error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleSearchProspects = async () => {
    try {
      setLoadingProspects(true);
      
      const results = await searchProspects(
        prospectQuery, 
        prospectFilters,
        searchMode === "selection" ? selectedCompanies.map(c => c.id) : undefined
      );
      
      setProspects(results);
    } catch (error) {
      toast.error("Failed to search prospects");
      console.error(error);
    } finally {
      setLoadingProspects(false);
    }
  };

  const toggleCompanySelection = (company: Company) => {
    if (selectedCompanies.some(c => c.id === company.id)) {
      setSelectedCompanies(selectedCompanies.filter(c => c.id !== company.id));
    } else {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };

  const toggleProspectSelection = (prospect: Contact) => {
    if (selectedProspects.some(p => p.id === prospect.id)) {
      setSelectedProspects(selectedProspects.filter(p => p.id !== prospect.id));
    } else {
      setSelectedProspects([...selectedProspects, prospect]);
    }
  };

  const handleSaveList = async () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    
    if (selectedProspects.length === 0) {
      toast.error("Please select at least one prospect");
      return;
    }
    
    try {
      setSavingList(true);
      
      const newList = await saveProspectList({
        name: newListName,
        contacts: selectedProspects,
        totalResults: selectedProspects.length,
        metadata: {
          searchFilters: {
            company: companyFilters,
            prospect: prospectFilters,
            companyQuery: companyQuery,
            prospectQuery: prospectQuery,
          }
        }
      });
      
      toast.success("Prospect list created successfully");
      setSaveDialogOpen(false);
      
      // Navigate to the new list
      router.push(`/prospects/${newList.id}`);
      
    } catch (error) {
      toast.error("Failed to save prospect list");
      console.error(error);
    } finally {
      setSavingList(false);
    }
  };

  const handleIndustryChange = (industry: string) => {
    if (companyFilters.industries.includes(industry)) {
      setCompanyFilters({
        ...companyFilters,
        industries: companyFilters.industries.filter(i => i !== industry)
      });
    } else {
      setCompanyFilters({
        ...companyFilters,
        industries: [...companyFilters.industries, industry]
      });
    }
  };

  const handleEmployeeSizeChange = (size: string) => {
    if (companyFilters.employeeSizes.includes(size)) {
      setCompanyFilters({
        ...companyFilters,
        employeeSizes: companyFilters.employeeSizes.filter(s => s !== size)
      });
    } else {
      setCompanyFilters({
        ...companyFilters,
        employeeSizes: [...companyFilters.employeeSizes, size]
      });
    }
  };

  const handleTitleChange = (title: string) => {
    if (prospectFilters.titles.includes(title)) {
      setProspectFilters({
        ...prospectFilters,
        titles: prospectFilters.titles.filter(t => t !== title)
      });
    } else {
      setProspectFilters({
        ...prospectFilters,
        titles: [...prospectFilters.titles, title]
      });
    }
  };

  const handleDepartmentChange = (department: string) => {
    if (prospectFilters.departments.includes(department)) {
      setProspectFilters({
        ...prospectFilters,
        departments: prospectFilters.departments.filter(d => d !== department)
      });
    } else {
      setProspectFilters({
        ...prospectFilters,
        departments: [...prospectFilters.departments, department]
      });
    }
  };

  const handleSeniorityChange = (seniority: string) => {
    if (prospectFilters.seniorities.includes(seniority)) {
      setProspectFilters({
        ...prospectFilters,
        seniorities: prospectFilters.seniorities.filter(s => s !== seniority)
      });
    } else {
      setProspectFilters({
        ...prospectFilters,
        seniorities: [...prospectFilters.seniorities, seniority]
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/prospects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Find Prospects</h1>
        </div>
        {activeTab === "prospects" && selectedProspects.length > 0 && (
          <Button onClick={() => setSaveDialogOpen(true)}>
            <Save className="mr-2 h-4 w-4" />
            Save List ({selectedProspects.length})
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="companies" className="flex items-center">
              <Building className="mr-2 h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="prospects" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Prospects
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "prospects" && selectedCompanies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Search in:</span>
              <Select
                value={searchMode}
                onValueChange={(value: "all" | "selection") => setSearchMode(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="selection">Selected Companies ({selectedCompanies.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="flex flex-1 border rounded-md overflow-hidden">
          {/* Filters Sidebar */}
          <div className="w-64 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h3 className="font-medium mb-2">Filters</h3>
                
                {activeTab === "companies" ? (
                  <CompanyFiltersPanel
                    filters={companyFilters}
                    onIndustryChange={handleIndustryChange}
                    onEmployeeSizeChange={handleEmployeeSizeChange}
                  />
                ) : (
                  <ProspectFiltersPanel
                    filters={prospectFilters}
                    onTitleChange={handleTitleChange}
                    onDepartmentChange={handleDepartmentChange}
                    onSeniorityChange={handleSeniorityChange}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Main Content */}
          <TabsContent value="companies" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
            <CompanySearchTab
              query={companyQuery}
              onQueryChange={setCompanyQuery}
              onSearch={handleSearchCompanies}
              isLoading={loadingCompanies}
              companies={companies}
              selectedCompanies={selectedCompanies}
              onToggleCompanySelection={toggleCompanySelection}
              filters={companyFilters}
              onIndustryChange={handleIndustryChange}
              onEmployeeSizeChange={handleEmployeeSizeChange}
            />
          </TabsContent>
          
          <TabsContent value="prospects" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
            <ProspectSearchTab
              query={prospectQuery}
              onQueryChange={setProspectQuery}
              onSearch={handleSearchProspects}
              isLoading={loadingProspects}
              prospects={prospects}
              selectedProspects={selectedProspects}
              onToggleProspectSelection={toggleProspectSelection}
              filters={prospectFilters}
              onTitleChange={handleTitleChange}
              onDepartmentChange={handleDepartmentChange}
              onSeniorityChange={handleSeniorityChange}
              searchMode={searchMode}
              selectedCompanies={selectedCompanies}
            />
          </TabsContent>
        </div>
      </Tabs>
      
      <SaveListDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        listName={newListName}
        onListNameChange={setNewListName}
        onSave={handleSaveList}
        isSaving={savingList}
        selectedCount={selectedProspects.length}
      />
    </div>
  );
}