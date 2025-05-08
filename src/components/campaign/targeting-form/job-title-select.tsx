// src/components/campaign/targeting-form/job-title-select.tsx
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormLabel, FormDescription } from "@/components/ui/form";
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

const defaultJobTitleOptions = [
  "CEO",
  "CTO",
  "CFO",
  "CIO",
  "VP of Sales",
  "VP of Marketing",
  "Director of Sales",
  "Director of Marketing",
  "Sales Manager",
  "Marketing Manager",
  "Product Manager",
];

interface JobTitleSelectProps {
  selectedJobTitles: string[];
  onAddJobTitle: (title: string) => void;
  onRemoveJobTitle: (title: string) => void;
}

export function JobTitleSelect({
  selectedJobTitles,
  onAddJobTitle,
  onRemoveJobTitle,
}: JobTitleSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTitles, setFilteredTitles] = useState(defaultJobTitleOptions);
  
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTitles(defaultJobTitleOptions);
      return;
    }
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = defaultJobTitleOptions.filter(title => 
      title.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredTitles(filtered);
  }, [searchTerm]);

  return (
    <div>
      <FormLabel>Job Titles</FormLabel>
      <FormDescription>
        Select target job titles
      </FormDescription>
      
      <div className="flex flex-wrap gap-2 mt-2 mb-2">
        {selectedJobTitles.map(title => (
          <Badge 
            key={title}
            variant="secondary"
            className="text-sm py-1 px-3"
          >
            {title}
            <button 
              type="button" 
              className="ml-1 hover:text-destructive"
              onClick={() => onRemoveJobTitle(title)}
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
            Add Job Title
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search job titles..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {filteredTitles.length === 0 ? (
                <CommandEmpty>No job titles found</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredTitles.map(title => (
                    <CommandItem
                      key={title}
                      onSelect={() => {
                        onAddJobTitle(title);
                        setSearchTerm("");
                      }}
                      className="cursor-pointer"
                    >
                      {title}
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