// src/components/campaign/targeting/CompanyListProspectSearch.tsx
"use client";

import { useState, useEffect } from "react";
import { Building, Search, ChevronDown } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useCompanyListStore } from "@/stores/companyListStore";
import { Prospect } from "@/types";

interface CompanyListProspectSearchProps {
  selectedCompanyListId?: number;
  onProspectsSelected: (companyListId: number, companyListName: string, prospects: Array<Prospect>) => void;
}

export function CompanyListProspectSearch({
  selectedCompanyListId,
  onProspectsSelected,
}: CompanyListProspectSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchingProspects, setSearchingProspects] = useState(false);
  
  const { 
    scopingLists, 
    loadingScopingLists, 
    fetchScopingLists 
  } = useCompanyListStore();

  useEffect(() => {
    fetchScopingLists();
  }, [fetchScopingLists]);

  const selectedList = scopingLists.find(list => list.id === selectedCompanyListId);

  const handleSelectCompanyList = async (list: typeof scopingLists[0]) => {
    setOpen(false);
    setSearchingProspects(true);

    try {
      // TODO : Simulate prospect search within the company list
      // In real implementation, this would call the prospect search API
      // with company list scoping
      const mockProspects = Array.from({ length: Math.floor(Math.random() * 50) + 10 }, (_, i) => ({
        id: `prospect-${i}`,
        firstName: `First${i}`,
        lastName: `Last${i}`,
        email: `prospect${i}@company.com`,
        title: 'VP of Engineering',
        companyName: `Company ${i}`,
        department: 'Engineering',
        seniority: 'C-Level',
        tenureMonths: Math.floor(Math.random() * 100),
        notableAchievement: `Achievement ${i}`,
        companyId: `company-${i}`,
        city: `City ${i}`,
        state: `State ${i}`,
        country: `Country ${i}`,
        phone: `123-456-${i}`,
        providerMetadata: {
            providerId: "ingren",
            source: "ingren-123",
            confidence: 0.9,
            lastUpdated: new Date()
        },
        socialProfiles : {},
      }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      onProspectsSelected(list.id, list.name, mockProspects);
    } catch (error) {
      console.error('Error searching prospects:', error);
    } finally {
      setSearchingProspects(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Prospects from Company List</CardTitle>
        <CardDescription>
          Choose a company list to search for prospects within those specific companies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={searchingProspects}
            >
              {selectedList ? selectedList.name : "Select company list..."}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search company lists..." />
              <CommandList>
                <CommandEmpty>
                  {loadingScopingLists ? "Loading..." : "No company lists found."}
                </CommandEmpty>
                <CommandGroup>
                  {scopingLists.map((list) => (
                    <CommandItem
                      key={list.id}
                      value={list.name}
                      onSelect={() => handleSelectCompanyList(list)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4" />
                          <div>
                            <div className="font-medium">{list.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {list.companyCount} companies
                            </div>
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {searchingProspects && (
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="flex items-center justify-center gap-2">
              <Search className="h-4 w-4 animate-spin" />
              <span>Searching for prospects in {selectedList?.name}...</span>
            </div>
          </div>
        )}

        {selectedList && !searchingProspects && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{selectedList.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedList.companyCount} companies • Ready to search for prospects
                </p>
              </div>
              <Button 
                onClick={() => handleSelectCompanyList(selectedList)}
                disabled={searchingProspects}
              >
                <Search className="mr-2 h-4 w-4" />
                Search Prospects
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

