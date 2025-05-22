"use client";

import { useEffect } from "react";
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
import { ErrorBoundary } from "@/components/prospect/ErrorBoundary";

// Import our store
import { useProspectSearchStore } from "@/stores/prospectStore";

export default function ProspectSearch() {
  const router = useRouter();

  // Get state and actions from our store
  const {
    // UI state
    activeTab,
    setActiveTab,

    selectedCompanies,
    
    selectedProspects,
    searchMode,
    setSearchMode,

    // List state & actions
    newListName,
    setNewListName,
    savingList,
    saveAsList,
  } = useProspectSearchStore();


  // Auto-switch to selection mode if we have selected companies
  useEffect(() => {
    if (activeTab === "prospects" && selectedCompanies.length > 0) {
      setSearchMode("selection");
    }
  }, [activeTab, selectedCompanies.length, setSearchMode]);

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
      const newListId = await saveAsList();

      if (newListId) {
        toast.success("Prospect list created successfully");
        router.push(`/prospects/${newListId}`);
      }
    } catch (error) {
      console.error("Error saving list:", error);
      toast.error("Failed to save prospect list");
    }
  };

  return (
    <ErrorBoundary>
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
            <Button onClick={() => {
              const listDialog = document.getElementById("save-list-dialog");
              if (listDialog) {
                // TODO : Trigger the dialog - in actual implementation you'd use a state
                // or a ref to control the dialog
              }
            }}>
              <Save className="mr-2 h-4 w-4" />
              Save List ({selectedProspects.length})
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'companies' | 'prospects')} className="flex-1 flex flex-col">
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
                    <CompanyFiltersPanel />
                  ) : (
                    <ProspectFiltersPanel />
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Main Content */}
            <TabsContent value="companies" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
              <CompanySearchTab />
            </TabsContent>

            <TabsContent value="prospects" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
              <ProspectSearchTab />
            </TabsContent>
          </div>
        </Tabs>

        <SaveListDialog
          open={savingList}
          onOpenChange={(open) => {
            if (!open) {
              // TODO : Clear saving state if dialog is closed
              // In a real implementation, you might want to handle this in the store
            }
          }}
          listName={newListName}
          onListNameChange={setNewListName}
          onSave={handleSaveList}
          isSaving={savingList}
          selectedCount={selectedProspects.length}
        />
      </div>
    </ErrorBoundary>
  );
}