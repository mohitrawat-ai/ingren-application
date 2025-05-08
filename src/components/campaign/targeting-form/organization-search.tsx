// src/components/campaign/targeting-form/organization-search.tsx
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormLabel, FormDescription } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { Organization, OrganizationSearchResponse } from "./types";

interface OrganizationSearchProps {
  selectedOrganizations: Organization[];
  onAddOrganization: (organization: Organization) => void;
  onRemoveOrganization: (organizationId: string) => void;
}

export function OrganizationSearch({
  selectedOrganizations,
  onAddOrganization,
  onRemoveOrganization,
}: OrganizationSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [searching, setSearching] = useState(false);
  
  const API_BASE_URL = process.env.AUDIENCE_PUBLIC_API_BASE_URL || '/api';

  useEffect(() => {
    const searchOrgs = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setSearching(true);
      try {
        const response = await fetch(`${API_BASE_URL}/organizations/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: searchTerm,
            page: 1,
            per_page: 10
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to search organizations');
        }
        
        const data: OrganizationSearchResponse = await response.json();
        setSearchResults(data.organizations);
      } catch (error) {
        console.error("Error searching organizations:", error);
        toast.error("Failed to search organizations");
      } finally {
        setSearching(false);
      }
    };
    
    const timeoutId = setTimeout(searchOrgs, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, API_BASE_URL]);

  return (
    <div>
      <FormLabel>Organizations</FormLabel>
      <FormDescription>
        Select target organizations
      </FormDescription>
      
      <div className="flex flex-wrap gap-2 mt-2 mb-2">
        {selectedOrganizations.map(org => (
          <Badge 
            key={org.id}
            variant="secondary"
            className="text-sm py-1 px-3"
          >
            {org.name}
            <button 
              type="button" 
              className="ml-1 hover:text-destructive"
              onClick={() => onRemoveOrganization(org.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full justify-start"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Organization
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search organizations..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {searching ? (
                <div className="p-2">
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ) : searchTerm.length < 2 ? (
                <CommandEmpty>
                  Type at least 2 characters to search
                </CommandEmpty>
              ) : searchResults.length === 0 ? (
                <CommandEmpty>No organizations found</CommandEmpty>
              ) : (
                <CommandGroup>
                  {searchResults.map(org => (
                    <CommandItem
                      key={org.id}
                      onSelect={() => {
                        onAddOrganization(org);
                        setSearchTerm("");
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span>{org.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {org.industry} • {org.employeeCount} employees
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}