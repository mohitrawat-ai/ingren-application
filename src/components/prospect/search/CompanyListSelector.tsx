// src/components/prospect/search/CompanyListSelector.tsx
"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Building, X } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

import { useCompanyListStore } from "@/stores/companyListStore";
import { useProspectSearchStore } from "@/stores/prospectStore";

interface CompanyListSelectorProps {
  className?: string;
}

export function CompanyListSelector({ className }: CompanyListSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const { 
    scopingLists, 
    loadingScopingLists, 
    fetchScopingLists 
  } = useCompanyListStore();
  
  const {
    selectedCompanyListId,
    selectedCompanyListName,
    setCompanyListScope,
    clearCompanyListScope,
    setSearchMode
  } = useProspectSearchStore();

  useEffect(() => {
    if (open && scopingLists.length === 0 && !loadingScopingLists) {
      fetchScopingLists();
    }
  }, [open, scopingLists.length, loadingScopingLists, fetchScopingLists]);

  const handleSelectList = async (listId: number, listName: string) => {
    // Get the actual company list to access company IDs
    const selectedList = scopingLists.find(list => list.id === listId);
    
    if (selectedList) {
      setCompanyListScope(listId, listName);
      setOpen(false);
    }
  };

  const handleClearSelection = () => {
    clearCompanyListScope();
    setSearchMode('all');
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Scope to list:</span>
        
        {selectedCompanyListId ? (
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              {selectedCompanyListName}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={handleClearSelection}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
                size="sm"
              >
                Select company list...
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
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
                        onSelect={() => handleSelectList(list.id, list.name)}
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
                          <Check
                            className={`ml-auto h-4 w-4 ${
                              selectedCompanyListId === list.id ? "opacity-100" : "opacity-0"
                            }`}
                          />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
      
      {selectedCompanyListId && (
        <p className="text-xs text-muted-foreground mt-1">
          Prospect searches will be limited to companies in this list
        </p>
      )}
    </div>
  );
}