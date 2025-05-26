// src/components/ui/searchable-multi-select.tsx

import React, { useState, useCallback, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export interface FilterOption {
  value: string;
  label: string;
}

interface SearchableMultiSelectProps {
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplay?: number;
}

export function SearchableMultiSelect({
  options,
  selectedValues = [],
  onSelectionChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search options...",
  className,
  disabled = false,
  maxDisplay = 3,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Get selected option labels for display
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  const handleSelect = useCallback(
    (value: string) => {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      onSelectionChange(newSelectedValues);
    },
    [selectedValues, onSelectionChange]
  );

  const handleRemove = useCallback(
    (value: string, event: React.MouseEvent | React.KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onSelectionChange(selectedValues.filter((v) => v !== value));
    },
    [selectedValues, onSelectionChange]
  );

  const handleClearAll = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onSelectionChange([]);
    },
    [onSelectionChange]
  );

  // Render selected items with badges
  const renderSelectedItems = () => {
    if (selectedOptions.length === 0) {
      return (
        <span className="text-muted-foreground">{placeholder}</span>
      );
    }

    const displayItems = selectedOptions.slice(0, maxDisplay);
    const remainingCount = selectedOptions.length - maxDisplay;

    return (
      <div className="flex flex-wrap gap-1">
        {displayItems.map((option) => (
          <Badge
            key={option.value}
            variant="secondary"
            className="text-xs px-2 py-0.5 max-w-[120px] flex items-center gap-1"
          >
            <span className="truncate">{option.label}</span>
            <span
              className="ml-1 hover:bg-secondary-foreground/20 rounded-sm cursor-pointer flex items-center justify-center w-4 h-4"
              onClick={(e) => handleRemove(option.value, e)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRemove(option.value, e);
                }
              }}
              aria-label={`Remove ${option.label}`}
            >
              <X className="h-3 w-3" />
            </span>
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-[2.5rem] px-3 py-2",
            className
          )}
          disabled={disabled}
        >
          <div className="flex-1 text-left overflow-hidden">
            {renderSelectedItems()}
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {selectedValues.length > 0 && (
              <span
                onClick={handleClearAll}
                className="hover:bg-muted rounded-sm p-1 cursor-pointer flex items-center justify-center"
                title="Clear all"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClearAll(e);
                  }
                }}
                aria-label="Clear all selections"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[200px] p-0 z-50" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span className="flex-1">{option.label}</span>
                  {selectedValues.includes(option.value) && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Selected
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}